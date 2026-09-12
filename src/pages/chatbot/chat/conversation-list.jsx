import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollContainer, SectionTitle } from "@/components/ui/section";
import { useChatSessionListQuery } from "@/features/chat/chatApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { getCountryMeta } from "@/lib/countries";
import { cn, getInitials } from "@/lib/utils";
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  Globe,
  Globe2,
  LoaderCircle,
  MoreHorizontal,
  Search,
  UserRound,
} from "lucide-react";

const channelMeta = {
  web_widget: {
    label: "Website",
    icon: <Globe size={12} />,
    className: "text-slate-500",
  },
  facebook: {
    label: "Messenger",
    icon: <img src="/ms.webp" className="size-3" />,
    className: "text-blue-600 dark:text-blue-400",
  },
  instagram: {
    label: "Instagram",
    icon: <img src="/insta.webp" className="size-3" />,
    className: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: <img src="/wp.webp" className="size-3" />,
    className: "text-emerald-600 dark:text-emerald-400",
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

function getLocation(session) {
  const userData = session.user_data || {};
  const countryValue =
    userData.detected_country ||
    userData.detected_country_code ||
    session.detected_country ||
    session.detected_country_code;

  return {
    country: getCountryMeta(countryValue),
    label:
      userData.detected_address ||
      userData.location ||
      [session.detected_city, countryValue].filter(Boolean).join(", ") ||
      countryValue ||
      "Location unavailable",
  };
}

function getAssigneeName(session) {
  if (!session.assigned_to) return null;
  if (typeof session.assigned_to === "string") return session.assigned_to;
  return session.assigned_to.name || session.assigned_to.full_name || null;
}

function SupportStatus({ conversation }) {
  const assignee = getAssigneeName(conversation);

  if (conversation.status === "resolved") {
    return (
      <span className="inline-flex min-w-0 items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
        <Check className="size-3 shrink-0" />
        Resolved
      </span>
    );
  }

  if (conversation.requires_attention) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
        <AlertCircle className="size-2.5 shrink-0" />
        <span>Needs attention</span>
      </div>
    );
  }

  if (assignee) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <UserRound className="size-2.5 shrink-0" />
        <span className="truncate">{assignee}</span>
      </div>
    );
  }

  if (conversation.ai_enabled) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-primary font-medium">
        <Check className="size-2.5 shrink-0" />
        <span>AI Enabled</span>
      </div>
    );
  }

  return null;
}

function ChannelIcon({ channel, className }) {
  const meta = channelMeta[channel] || channelMeta.web_widget;

  return (
    <span
      className={cn(
        "text-xs gap-1.5 flex shrink-0 items-center rounded-full bg-white p-0.5",
        meta.className,
        className,
      )}
      title={meta.label}
    >
      {meta.icon}
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
        channel: channel !== "all" ? channel : undefined,
        search: query.trim() || undefined,
        is_recently_active: filter === "active" ? true : undefined,
        requires_attention: filter === "attention" ? true : undefined,
        is_resolved: filter === "resolved" ? true : undefined,
      },
      { skip: !chatbotSlug },
    );

  const sessions = data?.data ?? [];
  const conversations = sessions;
  const unreadCount = sessions.reduce(
    (total, session) => total + (session.unread_message_count || 0),
    0,
  );
  const attentionCount = sessions.filter(
    (session) => session.requires_attention,
  ).length;
  const chatbotName =
    currentChatbot?.chatbot_name || currentChatbot?.name || "Chat support";

  return (
    <aside className="flex w-[330px] shrink-0 flex-col border-r bg-card xl:w-[350px]">
      <div className="border-b px-4 pb-3 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle
            title="Inbox"
            details={chatbotName}
            tag={unreadCount > 0 && (unreadCount > 99 ? "99+" : unreadCount)}
          />
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

      {/* <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto"> */}
      <ScrollContainer>
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
            const location = getLocation(conversation);
            const isRecentlyActive = Boolean(conversation.is_recently_active);
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
                  selectedId === String(conversation.id)
                    ? "bg-primary/[0.07] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-primary"
                    : isRecentlyActive
                      ? "bg-emerald-500/[0.025] hover:bg-emerald-500/[0.06]"
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
                    className="absolute top-7 right-0"
                  />
                  <span
                    className={cn(
                      "absolute -left-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full border-2 border-card",
                      isRecentlyActive
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/35",
                    )}
                    title={
                      isRecentlyActive
                        ? "Recently active"
                        : "Not recently active"
                    }
                  >
                    {isRecentlyActive && (
                      <span className="absolute size-2 animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                    )}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p
                      className={cn(
                        "min-w-0 flex-1 truncate text-[13px]",
                        unread > 0 ? "font-bold" : "font-semibold",
                      )}
                    >
                      {name}
                      {location.country ? (
                        <span
                          className="ml-2 text-sm leading-none"
                          role="img"
                          aria-label={`${location.country.name} flag`}
                        >
                          {location.country.flag}
                        </span>
                      ) : null}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 text-[10px]",
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
                        "min-w-0 flex-1 truncate text-[12px]",
                        unread > 0
                          ? "font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      <span className="font-bold">
                        {conversation.last_message?.sender?.split(" ")[0]}
                        {": "}
                      </span>
                      {conversation.last_message?.content || "No messages yet"}
                    </p>
                    {unread > 0 && (
                      <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex min-w-0 items-center gap-2">
                    <SupportStatus conversation={conversation} />
                    {conversation.ai_enabled &&
                      conversation.requires_attention && (
                        <div className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                          <Check className="size-2.5 shrink-0" />
                          <span>AI Enabled</span>
                        </div>
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
      </ScrollContainer>
      {/* </div> */}
    </aside>
  );
};

export default ConversationList;
