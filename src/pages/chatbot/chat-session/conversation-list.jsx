import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatSessionListQuery } from "@/features/chat-session/chatSessionApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  Facebook,
  Globe2,
  Instagram,
  LoaderCircle,
  MessageCircleMore,
  MoreHorizontal,
  Search,
} from "lucide-react";

const channelMeta = {
  web_widget: {
    label: "Web widget",
    icon: Globe2,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  facebook: {
    label: "Facebook",
    icon: Facebook,
    className: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
  },
  instagram: {
    label: "Instagram",
    icon: Instagram,
    className: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircleMore,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "attention", label: "Needs attention" },
  { id: "resolved", label: "Resolved" },
];

const avatarTones = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
];

const relativeTime = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

function getDisplayName(session) {
  return session.user_data?.name?.trim() || "Unknown visitor";
}

function getInitials(name) {
  if (name === "Unknown visitor") return "UV";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAvatarTone(id = "") {
  const hash = [...id].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return avatarTones[hash % avatarTones.length];
}

function formatActivity(value) {
  if (!value) return "—";
  const activityDate = new Date(value);
  if (Number.isNaN(activityDate.getTime())) return "—";

  const difference = activityDate.getTime() - Date.now();
  const absoluteDifference = Math.abs(difference);
  const units = [
    ["year", 365 * 24 * 60 * 60 * 1000],
    ["month", 30 * 24 * 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
  ];
  const [unit, duration] = units.find(
    ([, size]) => absoluteDifference >= size,
  ) || ["second", 1000];
  return relativeTime.format(Math.round(difference / duration), unit);
}

function ChannelIcon({ channel, className }) {
  const meta = channelMeta[channel] || channelMeta.web_widget;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full",
        meta.className,
        className,
      )}
      title={meta.label}
    >
      <Icon className="size-3.5" />
    </span>
  );
}

const ConversationList = ({
  selectedId,
  onSelect,
  filter,
  setFilter,
  channel,
  setChannel,
  query,
  setQuery,
}) => {
  const { chatbotSlug, currentChatbot } = useCurrentChatbot();
  const { data, isLoading, isFetching, isError, refetch } =
    useChatSessionListQuery(
      {
        chatbotSlug,
        status: filter !== "all" && filter !== "attention" ? filter : undefined,
        channel: channel !== "all" ? channel : undefined,
        search: query.trim() || undefined,
      },
      { skip: !chatbotSlug },
    );

  const sessions = data?.data ?? [];
  const conversations =
    filter === "attention"
      ? sessions.filter((session) => session.unread_message_count > 0)
      : sessions;
  const unreadCount = sessions.reduce(
    (total, session) => total + (session.unread_message_count || 0),
    0,
  );
  const attentionCount = sessions.filter(
    (session) => session.unread_message_count > 0,
  ).length;
  const chatbotName =
    currentChatbot?.chatbot_name || currentChatbot?.name || "Chat support";

  return (
    <aside className="flex w-[330px] shrink-0 flex-col border-r bg-card xl:w-[350px]">
      <div className="border-b px-4 pb-3 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Inbox</h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {chatbotName}
            </p>
          </div>
          <Button size="icon-sm" variant="ghost" aria-label="Inbox options">
            <MoreHorizontal />
          </Button>
        </div>

        <label className="relative block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border bg-muted/35 pl-9 pr-8 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
            placeholder="Search conversations"
          />
          {isFetching && !isLoading && (
            <LoaderCircle className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </label>

        <div className="custom-scrollbar -mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                filter === item.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
              {item.id === "attention" && attentionCount > 0 && (
                <span className="ml-1 text-amber-500">{attentionCount}</span>
              )}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Globe2 className="size-3.5" />
                {channel === "all"
                  ? "All channels"
                  : channelMeta[channel]?.label || channel}
              </span>
              <ChevronDown className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuRadioGroup value={channel} onValueChange={setChannel}>
              <DropdownMenuRadioItem value="all">
                All channels
              </DropdownMenuRadioItem>
              {Object.entries(channelMeta).map(([value, meta]) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {meta.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-3" aria-label="Loading conversations">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-3 rounded-xl p-2"
              >
                <span className="size-10 shrink-0 rounded-full bg-muted" />
                <div className="flex-1 space-y-2 py-1">
                  <span className="block h-3 w-2/3 rounded bg-muted" />
                  <span className="block h-2.5 w-full rounded bg-muted" />
                  <span className="block h-2.5 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-56 flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="mb-3 size-7 text-destructive/70" />
            <p className="text-sm font-semibold">Couldn’t load conversations</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check your connection and try again.
            </p>
            <Button
              className="mt-4"
              size="sm"
              variant="outline"
              onClick={refetch}
            >
              Try again
            </Button>
          </div>
        ) : conversations.length ? (
          conversations.map((conversation) => {
            const name = getDisplayName(conversation);
            const unread = conversation.unread_message_count || 0;
            const needsAttention = unread > 0;
            const activityTitle = conversation.last_activity_at
              ? new Date(conversation.last_activity_at).toLocaleString()
              : undefined;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation)}
                className={cn(
                  "group relative flex w-full gap-3 border-b px-4 py-4 text-left transition",
                  selectedId === conversation.id
                    ? "bg-primary/[0.07] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-primary"
                    : "hover:bg-muted/50",
                )}
              >
                <div className="relative shrink-0">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full text-xs font-bold",
                      getAvatarTone(conversation.id),
                    )}
                  >
                    {getInitials(name)}
                  </span>
                  <ChannelIcon
                    channel={conversation.channel}
                    className="absolute top-7 -right-0.5 size-4 border border-card [&_svg]:size-4"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm",
                        unread > 0 ? "font-bold" : "font-semibold",
                      )}
                    >
                      {name}
                    </p>
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 text-[11px]",
                        unread > 0
                          ? "font-semibold text-primary"
                          : "text-muted-foreground",
                      )}
                      title={activityTitle}
                    >
                      {formatActivity(conversation.last_activity_at)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p
                      className={cn(
                        "min-w-0 flex-1 truncate text-xs",
                        unread > 0
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {conversation.last_message?.content || "No messages yet"}
                    </p>
                    {unread > 0 && (
                      <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {conversation.status === "resolved" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <Check className="size-3" />
                        Resolved
                      </span>
                    ) : needsAttention ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                        <AlertCircle className="size-3" />
                        Needs attention
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                        <Bot className="size-3" />
                        {conversation.ai_enabled
                          ? "AI handling"
                          : "Team handling"}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex h-56 flex-col items-center justify-center px-6 text-center">
            <Search className="mb-3 size-7 text-muted-foreground/50" />
            <p className="text-sm font-semibold">No conversations found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try another filter or search term.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
