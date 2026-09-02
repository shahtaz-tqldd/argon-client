import { useMemo, useState } from "react";
import {
  CircleUserRound,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  Tag,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useChatMessageListQuery,
  useChatSessionDetailQuery,
} from "@/features/chat-session/chatSessionApiSlice";
import { useCapturedLeadDetailQuery } from "@/features/lead_captures/leadCaptureApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { cn } from "@/lib/utils";
import ChatPanel from "./chat-pannel";
import ConversationList from "./conversation-list";

const avatarTones = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
];

function unwrapObject(payload) {
  let value = payload;
  while (value?.data && !Array.isArray(value.data)) value = value.data;
  return value && !Array.isArray(value) ? value : {};
}

function unwrapMessages(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function displayName(session) {
  return (
    session?.user_data?.name?.trim() ||
    session?.lead?.name?.trim() ||
    session?.visitor_name?.trim() ||
    "Unknown visitor"
  );
}

function initials(name) {
  if (name === "Unknown visitor") return "UV";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function avatarTone(id = "") {
  const hash = [...String(id)].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return avatarTones[hash % avatarTones.length];
}

function channelLabel(channel = "web_widget") {
  return {
    web_widget: "Website",
    facebook: "Facebook",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
  }[channel] || channel;
}

function formatDate(value, fallback = "Not available") {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function buildConversation(summary, details) {
  const session = { ...(summary || {}), ...(details || {}) };
  const name = displayName(session);
  const assigned =
    session.assigned_to?.name ||
    session.assigned_agent?.name ||
    session.assignee?.name ||
    session.assigned_to_name;

  return {
    ...session,
    id: session.id,
    sessionId: session.session_id || session.id,
    name,
    initials: initials(name),
    avatarTone: avatarTone(session.id),
    channel: channelLabel(session.channel),
    status: session.status || "active",
    owner: assigned || (session.ai_enabled === false ? "Unassigned" : "AI"),
    online: Boolean(session.is_online || session.online),
    lastSeen: formatDate(session.last_activity_at || session.updated_at),
    email: session.user_data?.email || "Not collected",
    phone: session.user_data?.phone || "Not collected",
    location:
      session.user_data?.location ||
      [session.detected_city, session.detected_country_code]
        .filter(Boolean)
        .join(", ") ||
      "Not available",
    firstSeen: formatDate(session.created_at),
    currentPage:
      session.metadata?.page_url || session.user_data?.page_url || "Not available",
  };
}

function ContextRow({ icon, label, value }) {
  const ContextIcon = icon;
  return (
    <div className="flex gap-3 py-2.5">
      <ContextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 break-words text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

function CustomerContext({ conversation, lead, isLeadLoading, open, onClose }) {
  return (
    <aside
      className={cn(
        "custom-scrollbar absolute inset-y-0 right-0 z-30 w-[310px] overflow-y-auto border-l bg-card shadow-2xl transition-transform xl:static xl:z-auto xl:w-[300px] xl:translate-x-0 xl:shadow-none 2xl:w-[330px]",
        open ? "translate-x-0" : "translate-x-full xl:translate-x-0",
      )}
    >
      <div className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b bg-card/95 px-4 backdrop-blur">
        <div>
          <h2 className="text-sm font-bold">Customer context</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Session and lead details
          </p>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon-sm" className="xl:hidden" aria-label="Close customer context">
          <X />
        </Button>
      </div>

      <div className="border-b px-4 py-5 text-center">
        <span className={cn("mx-auto flex size-14 items-center justify-center rounded-full text-sm font-bold", conversation.avatarTone)}>
          {conversation.initials}
        </span>
        <p className="mt-3 text-sm font-bold">{conversation.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {conversation.sessionId} · {conversation.channel}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
          <Tag className="size-3" />
          {isLeadLoading ? "Loading lead…" : lead?.status || "Lead details placeholder"}
        </span>
      </div>

      <section className="border-b px-4 py-3">
        <h3 className="mb-1 text-xs font-bold">Contact details</h3>
        <ContextRow icon={Mail} label="Email" value={lead?.email || conversation.email} />
        <ContextRow icon={Phone} label="Phone" value={lead?.phone || conversation.phone} />
        <ContextRow icon={MapPin} label="Location" value={conversation.location} />
      </section>
      <section className="border-b px-4 py-3">
        <h3 className="mb-1 text-xs font-bold">Session activity</h3>
        <ContextRow icon={Globe2} label="Current page" value={conversation.currentPage} />
        <ContextRow icon={Clock3} label="First seen" value={conversation.firstSeen} />
        <ContextRow icon={CircleUserRound} label="Last activity" value={conversation.lastSeen} />
        <ContextRow icon={MessageCircleMore} label="Channel" value={conversation.channel} />
      </section>
      <section className="px-4 py-5">
        <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center">
          <p className="text-xs font-semibold">Lead profile coming soon</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Score, collected fields, notes, and conversation history will appear here.
          </p>
        </div>
      </section>
    </aside>
  );
}

function EmptyConversation() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center bg-muted/10 px-6 text-center">
      <div>
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircleMore className="size-6" />
        </span>
        <h2 className="mt-4 text-sm font-bold">Select a conversation</h2>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Choose a conversation from the inbox to view its session, lead, and message history.
        </p>
      </div>
    </div>
  );
}

const ChatSessionPage = () => {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [channel, setChannel] = useState("all");
  const [query, setQuery] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const { chatbotSlug } = useCurrentChatbot();
  const sessionId = selected?.id;

  const sessionQuery = useChatSessionDetailQuery(
    { chatbotSlug, sessionId },
    { skip: !chatbotSlug || !sessionId },
  );
  const messageQuery = useChatMessageListQuery(
    { chatbotSlug, sessionId },
    { skip: !chatbotSlug || !sessionId },
  );
  const sessionDetails = unwrapObject(sessionQuery.currentData);
  const leadId =
    selected?.lead_id ||
    selected?.captured_lead_id ||
    selected?.user_data?.lead_id ||
    sessionDetails?.lead_id ||
    sessionDetails?.captured_lead_id ||
    sessionDetails?.lead?.id;
  const leadQuery = useCapturedLeadDetailQuery(
    { chatbotSlug, leadId },
    { skip: !chatbotSlug || !sessionId || !leadId },
  );

  const conversation = useMemo(
    () => (selected ? buildConversation(selected, sessionDetails) : null),
    [selected, sessionDetails],
  );
  const messages = useMemo(
    () => unwrapMessages(messageQuery.currentData),
    [messageQuery.currentData],
  );
  const lead = unwrapObject(leadQuery.currentData);

  return (
    <section className="relative -m-8 flex h-[calc(100%+4rem)] min-h-[620px] overflow-hidden rounded-2xl bg-background">
      <ConversationList
        selectedId={sessionId}
        onSelect={(conversationSummary) => {
          setSelected(conversationSummary);
          setContextOpen(false);
        }}
        filter={filter}
        setFilter={setFilter}
        channel={channel}
        setChannel={setChannel}
        query={query}
        setQuery={setQuery}
      />

      {!conversation ? (
        <EmptyConversation />
      ) : (
        <>
          <ChatPanel
            conversation={conversation}
            messages={messages}
            isLoading={
              sessionQuery.isLoading ||
              messageQuery.isLoading ||
              (sessionQuery.isFetching && !sessionQuery.currentData) ||
              (messageQuery.isFetching && !messageQuery.currentData)
            }
            isError={sessionQuery.isError || messageQuery.isError}
            onRetry={() => {
              sessionQuery.refetch();
              messageQuery.refetch();
            }}
            onToggleContext={() => setContextOpen(true)}
          />
          {contextOpen && (
            <button
              className="absolute inset-0 z-20 bg-black/20 xl:hidden"
              aria-label="Close customer context"
              onClick={() => setContextOpen(false)}
            />
          )}
          <CustomerContext
            conversation={conversation}
            lead={lead}
            isLeadLoading={leadQuery.isLoading}
            open={contextOpen}
            onClose={() => setContextOpen(false)}
          />
        </>
      )}
    </section>
  );
};

export default ChatSessionPage;
