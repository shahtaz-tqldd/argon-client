import {
  AlertCircle,
  ChevronRight,
  FolderOpen,
  Info,
  LoaderCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { ScrollContainer, SectionTitle } from "@/components/ui/section";
import { useChatSessionListQuery } from "@/features/chat/chatApiSlice";

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

const UnansweredAlerts = ({ chatbotSlug }) => {
  const { data, isLoading, isError, refetch } = useChatSessionListQuery(
    {
      chatbotSlug,
      requires_attention: true,
    },
    { skip: !chatbotSlug },
  );
  const conversations = data?.data ?? [];

  return (
    <Card className="flex h-[30rem] min-h-0 flex-col p-0">
      <div className="shrink-0 flex items-start justify-between gap-4 border-b border-amber-500/10 bg-amber-500/[0.04] py-4 px-6">
        <SectionTitle
          title="Needs your attention"
          details="Questions AI couldn't answer"
        />
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
                Couldn’t load conversations
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
          ) : conversations.length === 0 ? (
            <div className="h-[20rem] px-6 center flex-col gap-4 text-center text-sm text-muted-foreground">
              <Info size={40} strokeWidth={1} className="opacity-40" />
              No conversations need attention.
            </div>
          ) : (
            conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  to={`/chatbot/${chatbotSlug}/chat-session?session_id=${conversation.id}`}
                  className="group flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-muted/30"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-5 text-foreground">
                      {conversation.attention_reason}
                    </span>
                    <span className="mt-2 block truncate text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">
                        {channelLabels[conversation.channel] ||
                          conversation.channel}
                      </span>
                      <span className="mx-1.5">·</span>
                      {formatActivity(conversation.last_activity_at)}
                    </span>
                  </span>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))
          )}
        </ul>
      </ScrollContainer>
      <div className="py-1.5 px-6"></div>
    </Card>
  );
};

export default UnansweredAlerts;
