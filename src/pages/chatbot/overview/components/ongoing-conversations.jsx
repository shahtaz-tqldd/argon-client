import {
  AlertCircle,
  FolderOpen,
  LoaderCircle,
  MessageCircle,
  Radio,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn, getInitials } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ScrollContainer, SectionTitle } from "@/components/ui/section";
import { useChatSessionListQuery } from "@/features/chat/chatApiSlice";

const statusStyles = {
  "AI handling": "bg-primary/10 text-primary",
  "Needs attention": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Assigned to you": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const relativeTime = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

const channelLabels = {
  web_widget: "Website",
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
};

function formatActivity(value) {
  if (!value) return "—";

  const activityDate = new Date(value);
  if (Number.isNaN(activityDate.getTime())) return "—";

  const difference = activityDate.getTime() - Date.now();
  const units = [
    ["year", 365 * 24 * 60 * 60 * 1000],
    ["month", 30 * 24 * 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
  ];
  const [unit, duration] = units.find(
    ([, size]) => Math.abs(difference) >= size,
  ) || ["second", 1000];

  return relativeTime.format(Math.round(difference / duration), unit);
}

function getConversationStatus(conversation) {
  if (conversation.requires_attention) return "Needs attention";
  if (conversation.assigned_to) return "Assigned to you";
  if (conversation.ai_enabled) return "AI handling";
  return "Open";
}

const ConversationRow = ({ conversation, chatbotSlug }) => {
  const name = conversation.user_data?.name?.trim() || "Unknown visitor";
  const status = getConversationStatus(conversation);

  return (
    <Link
      to={`/chatbot/${chatbotSlug}/chat-session?session_id=${conversation.id}`}
      className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:px-6"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative shrink-0">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {getInitials(name)}
          </span>
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {name}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                statusStyles[status],
              )}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {conversation.last_message?.content || "No messages yet"}
          </p>
          <p className="mt-2 truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">
              {channelLabels[conversation.channel] || conversation.channel}
            </span>
            <span className="mx-1.5">·</span>
            <span className="w-7 text-right text-xs text-muted-foreground">
              {formatActivity(conversation.last_activity_at)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pl-14 sm:justify-end sm:pl-0">
        <div className="flex items-center gap-2">
          {conversation.unread_message_count > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {conversation.unread_message_count > 99
                ? "99+"
                : conversation.unread_message_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const OngoingConversations = ({ chatbotSlug }) => {
  const { data, isLoading, isError, refetch } = useChatSessionListQuery(
    {
      chatbotSlug,
      is_recently_active: true,
    },
    { skip: !chatbotSlug },
  );
  const conversations = data?.data ?? [];
  const activeCount = data?.meta?.count ?? conversations.length;

  return (
    <Card className="flex h-[30rem] min-h-0 flex-col p-0">
      <div className="shrink-0 flex items-center justify-between gap-4 border-b border-primary/10 py-4 px-6 bg-primary/10">
        <SectionTitle
          title="Active Conversation"
          details={`${activeCount} active right now`}
        />
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/chatbot/${chatbotSlug}/chat-session`}>View all</Link>
        </Button>
      </div>

      <ScrollContainer allowScrollChaining>
        <ul className="min-h-0 flex-1 divide-y divide-border">
          {isLoading ? (
            <li className="flex h-40 items-center justify-center text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              <span className="sr-only">Loading conversations</span>
            </li>
          ) : isError ? (
            <li className="flex h-40 flex-col items-center justify-center px-6 text-center">
              <AlertCircle className="mb-2 size-6 text-destructive/70" />
              <p className="text-sm font-semibold">
                Couldn't load conversations
              </p>
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                onClick={refetch}
              >
                Try again
              </Button>
            </li>
          ) : conversations.length ? (
            conversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationRow
                  conversation={conversation}
                  chatbotSlug={chatbotSlug}
                />
              </li>
            ))
          ) : (
            <div className="h-[20rem] px-6 center flex-col gap-4 text-center text-sm text-muted-foreground">
              <MessageCircle size={40} strokeWidth={1} className="opacity-40" />
              No active conversations right now
            </div>
          )}
        </ul>
      </ScrollContainer>
      <div className="py-1.5 px-6"></div>
    </Card>
  );
};

export default OngoingConversations;
