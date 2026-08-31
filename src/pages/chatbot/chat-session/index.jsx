import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  AtSign,
  Ban,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Facebook,
  FileText,
  Globe2,
  Info,
  Instagram,
  Mail,
  MapPin,
  MessageCircleMore,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Sparkles,
  Tag,
  UserRound,
  UserRoundPlus,
  UsersRound,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { useChatSessionListQuery } from "@/features/chat-session/chatSessionApiSlice";

const channelMeta = {
  Website: {
    icon: Globe2,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  Facebook: {
    icon: Facebook,
    className: "bg-blue-600/10 text-blue-600 dark:text-blue-400",
  },
  Instagram: {
    icon: Instagram,
    className: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  },
  WhatsApp: {
    icon: MessageCircleMore,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

const conversationsSeed = [
  {
    id: "conv-4821",
    sessionId: "#4821",
    name: "Maya Thompson",
    initials: "MT",
    avatarTone:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    lastMessage: "Yes, that’s the order. Can you update it?",
    timestamp: "2m",
    channel: "WhatsApp",
    status: "attention",
    unread: 2,
    online: true,
    owner: "AI",
    email: "maya.thompson@example.com",
    phone: "+1 (415) 555-0138",
    location: "San Francisco, CA",
    firstSeen: "May 12, 2026",
    lastSeen: "Now",
    currentPage: "/orders/track",
    leadStatus: "Qualified lead",
    historyCount: 7,
    fields: [
      ["Company", "Nimble Labs"],
      ["Plan", "Growth"],
      ["Order ID", "#AT-20481"],
    ],
    messages: [
      {
        id: 1,
        type: "customer",
        text: "Hi! I just placed an order but used my old delivery address.",
        time: "10:42 AM",
      },
      {
        id: 2,
        type: "ai",
        text: "I can help with that. Could you share your order number so I can check whether it’s still possible to update it?",
        time: "10:42 AM",
      },
      {
        id: 3,
        type: "customer",
        text: "It’s #AT-20481. The new address is already saved on my account.",
        time: "10:43 AM",
      },
      {
        id: 4,
        type: "event",
        event: "AI escalated this conversation",
        detail: "Changing a confirmed order requires approval",
        time: "10:43 AM",
      },
      {
        id: 5,
        type: "event",
        event: "Shahtaz took over the conversation",
        time: "10:44 AM",
      },
      {
        id: 6,
        type: "human",
        name: "Shahtaz",
        text: "Hi Maya, I’m Shahtaz. I’m checking the order with our fulfilment team now.",
        time: "10:45 AM",
      },
      {
        id: 7,
        type: "customer",
        text: "Yes, that’s the order. Can you update it?",
        time: "10:47 AM",
      },
    ],
  },
  {
    id: "conv-4819",
    sessionId: "#4819",
    name: "Daniel Kim",
    initials: "DK",
    avatarTone:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    lastMessage: "Do you offer SSO on the Growth plan?",
    timestamp: "8m",
    channel: "Website",
    status: "active",
    unread: 1,
    online: true,
    owner: "AI",
    email: "daniel@northstar.io",
    phone: "Not collected",
    location: "Toronto, Canada",
    firstSeen: "Aug 20, 2026",
    lastSeen: "1 min ago",
    currentPage: "/pricing",
    leadStatus: "New lead",
    historyCount: 1,
    fields: [
      ["Company size", "51–100"],
      ["Use case", "Customer support"],
    ],
    messages: [
      {
        id: 1,
        type: "customer",
        text: "Hey, I’m comparing plans for our support team.",
        time: "10:31 AM",
      },
      {
        id: 2,
        type: "ai",
        text: "Happy to help. How large is your team, and which features matter most?",
        time: "10:31 AM",
      },
      {
        id: 3,
        type: "customer",
        text: "We’re around 70 people. Do you offer SSO on the Growth plan?",
        time: "10:33 AM",
      },
    ],
  },
  {
    id: "conv-4816",
    sessionId: "#4816",
    name: "Sofia Martins",
    initials: "SM",
    avatarTone:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    lastMessage: "Perfect, thank you for the quick help!",
    timestamp: "18m",
    channel: "Instagram",
    status: "active",
    unread: 0,
    online: false,
    owner: "AI",
    email: "sofia.martins@example.com",
    phone: "Not collected",
    location: "Lisbon, Portugal",
    firstSeen: "Jul 02, 2026",
    lastSeen: "16 min ago",
    currentPage: "Instagram Direct",
    leadStatus: "Customer",
    historyCount: 3,
    fields: [
      ["Language", "English"],
      ["Plan", "Starter"],
    ],
    messages: [
      {
        id: 1,
        type: "customer",
        text: "Can I invite another teammate to my account?",
        time: "10:18 AM",
      },
      {
        id: 2,
        type: "ai",
        text: "Yes. Go to Settings → Team, then choose Invite teammate. Your Starter plan includes up to three seats.",
        time: "10:18 AM",
      },
      {
        id: 3,
        type: "customer",
        text: "Perfect, thank you for the quick help!",
        time: "10:20 AM",
      },
    ],
  },
  {
    id: "conv-4812",
    sessionId: "#4812",
    name: "Unknown visitor",
    initials: "UV",
    avatarTone:
      "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
    lastMessage: "The checkout page keeps refreshing.",
    timestamp: "27m",
    channel: "Website",
    status: "attention",
    unread: 0,
    online: false,
    owner: "Unassigned",
    email: "Not collected",
    phone: "Not collected",
    location: "Dhaka, Bangladesh",
    firstSeen: "Aug 20, 2026",
    lastSeen: "24 min ago",
    currentPage: "/checkout",
    leadStatus: "Visitor",
    historyCount: 1,
    fields: [
      ["Browser", "Chrome 140"],
      ["Device", "Desktop"],
    ],
    messages: [
      {
        id: 1,
        type: "customer",
        text: "The checkout page keeps refreshing. I can’t finish my purchase.",
        time: "10:08 AM",
      },
      {
        id: 2,
        type: "event",
        event: "AI escalated this conversation",
        detail: "Possible technical issue",
        time: "10:08 AM",
      },
    ],
  },
  {
    id: "conv-4803",
    sessionId: "#4803",
    name: "Noah Williams",
    initials: "NW",
    avatarTone:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
    lastMessage: "Refund received — all sorted now.",
    timestamp: "1h",
    channel: "Facebook",
    status: "resolved",
    unread: 0,
    online: false,
    owner: "Shahtaz",
    email: "noah.w@example.com",
    phone: "+44 7700 900128",
    location: "London, United Kingdom",
    firstSeen: "Jan 14, 2026",
    lastSeen: "1 hour ago",
    currentPage: "Facebook Messenger",
    leadStatus: "Customer",
    historyCount: 12,
    fields: [
      ["Plan", "Pro"],
      ["Refund", "RF-1902"],
    ],
    messages: [
      {
        id: 1,
        type: "human",
        name: "Shahtaz",
        text: "Your refund has been issued. It should appear within 3–5 business days.",
        time: "9:34 AM",
      },
      {
        id: 2,
        type: "customer",
        text: "Refund received — all sorted now.",
        time: "9:42 AM",
      },
      {
        id: 3,
        type: "event",
        event: "Conversation resolved by Shahtaz",
        time: "9:44 AM",
      },
    ],
  },
];

const filters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "attention", label: "Needs attention" },
  { id: "resolved", label: "Resolved" },
];

const team = ["Shahtaz", "Nadia Rahman", "Arif Hossain", "Unassigned"];

function ChannelIcon({ channel, className }) {
  const meta = channelMeta[channel] || channelMeta.Website;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full",
        meta.className,
        className,
      )}
    >
      <Icon className="size-3.5" />
    </span>
  );
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  setFilter,
  channel,
  setChannel,
  query,
  setQuery,
}) {
  const { chatbotSlug } = useCurrentChatbot();
  const { data } = useChatSessionListQuery({ chatbotSlug });
  console.log(data);
  return (
    <aside className="flex w-[330px] shrink-0 flex-col border-r bg-card xl:w-[350px]">
      <div className="border-b px-4 pb-3 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Inbox</h1>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {
                  conversationsSeed.filter((item) => item.status !== "resolved")
                    .length
                }
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Atlas Support</p>
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
            className="h-10 w-full rounded-xl border bg-muted/35 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
            placeholder="Search conversations"
          />
        </label>

        <div className="custom-scrollbar -mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                filter === item.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
              {item.id === "attention" && (
                <span className="ml-1 text-amber-500">2</span>
              )}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-2 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <span className="flex items-center gap-2">
                <Globe2 className="size-3.5" />
                {channel === "all" ? "All channels" : channel}
              </span>
              <ChevronDown className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuRadioGroup value={channel} onValueChange={setChannel}>
              <DropdownMenuRadioItem value="all">
                All channels
              </DropdownMenuRadioItem>
              {Object.keys(channelMeta).map((item) => (
                <DropdownMenuRadioItem key={item} value={item}>
                  {item}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {conversations.length ? (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
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
                    conversation.avatarTone,
                  )}
                >
                  {conversation.initials}
                </span>
                <ChannelIcon
                  channel={conversation.channel}
                  className="absolute -bottom-1 -right-1 size-5 border-2 border-card [&_svg]:size-2.5"
                />
                {conversation.online && (
                  <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <p
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm",
                      conversation.unread ? "font-bold" : "font-semibold",
                    )}
                  >
                    {conversation.name}
                  </p>
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 text-[11px]",
                      conversation.unread
                        ? "font-semibold text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {conversation.timestamp}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p
                    className={cn(
                      "min-w-0 flex-1 truncate text-xs",
                      conversation.unread
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {conversation.unread}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  {conversation.status === "attention" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                      <AlertCircle className="size-3" />
                      Needs attention
                    </span>
                  )}
                  {conversation.status === "resolved" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                      <Check className="size-3" />
                      Resolved
                    </span>
                  )}
                  {conversation.status === "active" && (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {conversation.owner === "AI"
                        ? "AI handling"
                        : `Assigned to ${conversation.owner}`}
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {conversation.sessionId}
                  </span>
                </div>
              </div>
            </button>
          ))
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
}

function MessageBubble({ message, customer }) {
  if (message.type === "event") {
    return (
      <div className="my-5 flex items-center gap-3 px-4">
        <span className="h-px flex-1 bg-border" />
        <div className="flex max-w-[80%] items-center gap-2 text-center text-[11px] text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Sparkles className="size-3" />
          </span>
          <span>
            <strong className="font-semibold text-foreground">
              {message.event}
            </strong>
            {message.detail ? ` · ${message.detail}` : ""} · {message.time}
          </span>
        </div>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  const isCustomer = message.type === "customer";
  const isAi = message.type === "ai";
  return (
    <div
      className={cn(
        "flex gap-2.5",
        isCustomer ? "justify-start" : "justify-end",
      )}
    >
      {isCustomer && (
        <span
          className={cn(
            "mt-5 flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
            customer.avatarTone,
          )}
        >
          {customer.initials}
        </span>
      )}
      <div className={cn("max-w-[72%]", !isCustomer && "items-end")}>
        <div
          className={cn(
            "mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground",
            !isCustomer && "justify-end",
          )}
        >
          {isAi && (
            <>
              <Bot className="size-3" />
              <span>Atlas AI</span>
            </>
          )}
          {message.type === "human" && (
            <>
              <span>{message.name || "You"}</span>
              <UserRound className="size-3" />
            </>
          )}
          {isCustomer && <span>{customer.name}</span>}
        </div>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
            isCustomer
              ? "rounded-tl-sm border bg-card"
              : isAi
                ? "rounded-tr-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "rounded-tr-sm bg-primary text-primary-foreground",
          )}
        >
          {message.text}
        </div>
        <p
          className={cn(
            "mt-1 text-[10px] text-muted-foreground",
            !isCustomer && "text-right",
          )}
        >
          {message.time}
          {!isCustomer && " · Delivered"}
        </p>
      </div>
    </div>
  );
}

function ChatPanel({
  conversation,
  onTakeover,
  onResolve,
  onAssign,
  onSend,
  onToggleContext,
}) {
  const [mode, setMode] = useState("reply");
  const [draft, setDraft] = useState("");

  const submitMessage = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text, mode);
    setDraft("");
  };

  return (
    <main className="flex min-w-[430px] flex-1 flex-col bg-background">
      <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-xs font-bold",
                conversation.avatarTone,
              )}
            >
              {conversation.initials}
            </span>
            {conversation.online && (
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold">
                {conversation.name}
              </h2>
              {conversation.status === "attention" && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  Needs attention
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  conversation.online
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/50",
                )}
              />
              {conversation.online
                ? "Online now"
                : `Last seen ${conversation.lastSeen}`}{" "}
              · {conversation.sessionId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden xl:flex">
                <UsersRound />
                {conversation.owner}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Assign conversation</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={conversation.owner}
                onValueChange={onAssign}
              >
                <DropdownMenuRadioItem value="AI">
                  <Bot />
                  Atlas AI
                </DropdownMenuRadioItem>
                {team.map((member) => (
                  <DropdownMenuRadioItem key={member} value={member}>
                    <UserRound />
                    {member}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={onTakeover}
            variant={conversation.owner === "AI" ? "default" : "outline"}
            size="sm"
          >
            {conversation.owner === "AI" ? (
              <>
                <UserRoundPlus />
                Take over
              </>
            ) : (
              <>
                <Bot />
                Return to AI
              </>
            )}
          </Button>
          <Button
            onClick={onResolve}
            variant="outline"
            size="icon-sm"
            aria-label={
              conversation.status === "resolved"
                ? "Reopen conversation"
                : "Resolve conversation"
            }
            title={
              conversation.status === "resolved"
                ? "Reopen conversation"
                : "Resolve conversation"
            }
          >
            {conversation.status === "resolved" ? <Archive /> : <Check />}
          </Button>
          <Button
            onClick={onToggleContext}
            variant="ghost"
            size="icon-sm"
            className="xl:hidden"
            aria-label="Show customer context"
          >
            <Info />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <UserRoundPlus />
                Assign teammate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive />
                {conversation.status === "resolved" ? "Reopen" : "Resolve"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Ban />
                Block visitor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-muted/20 px-5 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex items-center gap-3 pb-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Today
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              customer={conversation}
            />
          ))}
          {conversation.owner === "AI" &&
            conversation.status !== "resolved" && (
              <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
                <span className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <Bot className="size-3.5" />
                </span>
                <span className="rounded-full border bg-card px-3 py-1.5">
                  Atlas AI is ready to respond
                </span>
              </div>
            )}
        </div>
      </div>

      <footer className="shrink-0 border-t bg-card p-4">
        <div
          className={cn(
            "mx-auto max-w-3xl rounded-xl border bg-background shadow-sm transition focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10",
            mode === "note" &&
              "border-amber-300 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/5",
          )}
        >
          <div className="flex items-center gap-1 border-b px-2 pt-1.5">
            <button
              onClick={() => setMode("reply")}
              className={cn(
                "border-b-2 px-3 py-2 text-xs font-semibold transition",
                mode === "reply"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-1.5">
                <MessageCircleMore className="size-3.5" />
                Reply
              </span>
            </button>
            <button
              onClick={() => setMode("note")}
              className={cn(
                "border-b-2 px-3 py-2 text-xs font-semibold transition",
                mode === "note"
                  ? "border-amber-500 text-amber-700 dark:text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="size-3.5" />
                Internal note
              </span>
            </button>
            <span className="ml-auto px-2 text-[10px] text-muted-foreground">
              {mode === "reply"
                ? `via ${conversation.channel}`
                : "Only visible to your team"}
            </span>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitMessage();
              }
            }}
            className="min-h-20 w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={
              mode === "reply"
                ? `Reply to ${conversation.name.split(" ")[0]}…`
                : "Leave a note for your team…"
            }
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center">
              <Button variant="ghost" size="icon-xs" aria-label="Attach file">
                <Paperclip />
              </Button>
              <Button variant="ghost" size="icon-xs" aria-label="Insert emoji">
                <Smile />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Mention teammate"
              >
                <AtSign />
              </Button>
              {mode === "reply" && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-violet-600"
                  aria-label="Improve with AI"
                >
                  <WandSparkles />
                </Button>
              )}
            </div>
            <Button
              onClick={submitMessage}
              disabled={!draft.trim()}
              size="sm"
              className={cn(
                mode === "note" && "bg-amber-500 hover:bg-amber-600",
              )}
            >
              {mode === "reply" ? (
                <>
                  <Send />
                  Send
                </>
              ) : (
                <>
                  <FileText />
                  Add note
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ContextRow({ icon, label, value, valueClassName }) {
  const ContextIcon = icon;
  return (
    <div className="flex gap-3 py-2.5">
      <ContextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn("mt-0.5 truncate text-xs font-medium", valueClassName)}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ContextSection({ title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-bold"
      >
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
              {count}
            </span>
          )}
        </span>
        <ChevronRight
          className={cn(
            "size-3.5 text-muted-foreground transition",
            open && "rotate-90",
          )}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

function CustomerContext({ conversation, open, onClose, blocked, onBlock }) {
  return (
    <aside
      className={cn(
        "custom-scrollbar absolute inset-y-0 right-0 z-30 w-[310px] shrink-0 overflow-y-auto border-l bg-card shadow-2xl transition-transform xl:static xl:z-auto xl:block xl:w-[300px] xl:translate-x-0 xl:shadow-none 2xl:w-[330px]",
        open ? "translate-x-0" : "translate-x-full xl:translate-x-0",
      )}
    >
      <div className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b bg-card/95 px-4 backdrop-blur">
        <div>
          <h2 className="text-sm font-bold">Customer context</h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Profile and conversation data
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon-sm"
          className="xl:hidden"
          aria-label="Close customer context"
        >
          <X />
        </Button>
      </div>
      <div className="border-b px-4 py-5 text-center">
        <div className="relative mx-auto w-fit">
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-full text-sm font-bold",
              conversation.avatarTone,
            )}
          >
            {conversation.initials}
          </span>
          <ChannelIcon
            channel={conversation.channel}
            className="absolute -bottom-1 -right-1 size-6 border-2 border-card"
          />
        </div>
        <p className="mt-3 text-sm font-bold">{conversation.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {conversation.sessionId} · {conversation.channel}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600">
          <Tag className="size-3" />
          {conversation.leadStatus}
        </span>
      </div>

      <ContextSection title="Contact details">
        <ContextRow
          icon={Mail}
          label="Email"
          value={conversation.email}
          valueClassName={
            conversation.email !== "Not collected" && "text-primary"
          }
        />
        <ContextRow icon={Phone} label="Phone" value={conversation.phone} />
        <ContextRow
          icon={MapPin}
          label="Location"
          value={conversation.location}
        />
      </ContextSection>

      <ContextSection title="Activity">
        <ContextRow
          icon={Globe2}
          label="Current page"
          value={conversation.currentPage}
          valueClassName="text-primary"
        />
        <ContextRow
          icon={Clock3}
          label="First seen"
          value={conversation.firstSeen}
        />
        <ContextRow
          icon={CircleUserRound}
          label="Last seen"
          value={conversation.lastSeen}
        />
        <ContextRow
          icon={MessageCircleMore}
          label="Channel"
          value={conversation.channel}
        />
      </ContextSection>

      <ContextSection
        title="Conversation history"
        count={conversation.historyCount}
      >
        <button className="flex w-full items-center justify-between rounded-lg border bg-muted/30 p-3 text-left transition hover:border-primary/30 hover:bg-primary/5">
          <span>
            <span className="block text-xs font-semibold">
              {conversation.historyCount} conversations
            </span>
            <span className="mt-0.5 block text-[10px] text-muted-foreground">
              Last conversation 2 weeks ago
            </span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </ContextSection>

      <ContextSection title="Collected fields">
        <div className="space-y-2.5">
          {conversation.fields.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="truncate font-medium">{value}</span>
            </div>
          ))}
          <button className="flex items-center gap-1 text-[11px] font-semibold text-primary">
            <UserRoundPlus className="size-3" />
            Add field
          </button>
        </div>
      </ContextSection>

      <ContextSection title="Connected data" defaultOpen={false}>
        <div className="space-y-2">
          {["Appointments", "Orders", "Quotes", "CRM profile"].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <span>{item}</span>
              <ChevronRight className="size-3.5" />
            </button>
          ))}
        </div>
      </ContextSection>

      <div className="p-4">
        <button
          onClick={onBlock}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition",
            blocked
              ? "border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5"
              : "border-destructive/20 text-destructive hover:bg-destructive/5",
          )}
        >
          {blocked ? (
            <>
              <Check className="size-3.5" />
              Unblock visitor
            </>
          ) : (
            <>
              <Ban className="size-3.5" />
              Block visitor
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

const ChatSessionPage = () => {
  const [conversations, setConversations] = useState(conversationsSeed);
  const [selectedId, setSelectedId] = useState(conversationsSeed[0].id);
  const [filter, setFilter] = useState("all");
  const [channel, setChannel] = useState("all");
  const [query, setQuery] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const visibleConversations = useMemo(
    () =>
      conversations.filter((item) => {
        const matchesFilter = filter === "all" || item.status === filter;
        const matchesChannel = channel === "all" || item.channel === channel;
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          !normalizedQuery ||
          `${item.name} ${item.sessionId} ${item.lastMessage}`
            .toLowerCase()
            .includes(normalizedQuery);
        return matchesFilter && matchesChannel && matchesQuery;
      }),
    [conversations, filter, channel, query],
  );

  const conversation =
    conversations.find((item) => item.id === selectedId) || conversations[0];

  const updateConversation = (updates) => {
    setConversations((items) =>
      items.map((item) =>
        item.id === selectedId ? { ...item, ...updates } : item,
      ),
    );
  };

  const handleTakeover = () => {
    const takingOver = conversation.owner === "AI";
    const owner = takingOver ? "Shahtaz" : "AI";
    const event = {
      id: Date.now(),
      type: "event",
      event: takingOver
        ? "Shahtaz took over the conversation"
        : "Conversation returned to Atlas AI",
      time: "Now",
    };
    updateConversation({
      owner,
      status:
        conversation.status === "resolved" ? "active" : conversation.status,
      messages: [...conversation.messages, event],
    });
    toast.success(
      takingOver
        ? "Conversation assigned to you"
        : "Conversation returned to Atlas AI",
    );
  };

  const handleResolve = () => {
    const resolving = conversation.status !== "resolved";
    const event = {
      id: Date.now(),
      type: "event",
      event: resolving
        ? "Conversation resolved by Shahtaz"
        : "Conversation reopened by Shahtaz",
      time: "Now",
    };
    updateConversation({
      status: resolving ? "resolved" : "active",
      messages: [...conversation.messages, event],
    });
    toast.success(
      resolving ? "Conversation resolved" : "Conversation reopened",
    );
  };

  const handleAssign = (owner) => {
    const event = {
      id: Date.now(),
      type: "event",
      event:
        owner === "Unassigned"
          ? "Conversation unassigned"
          : `Conversation assigned to ${owner}`,
      time: "Now",
    };
    updateConversation({ owner, messages: [...conversation.messages, event] });
    toast.success(
      owner === "Unassigned"
        ? "Conversation unassigned"
        : `Assigned to ${owner}`,
    );
  };

  const handleSend = (text, mode) => {
    const newMessage =
      mode === "note"
        ? {
            id: Date.now(),
            type: "event",
            event: `Internal note from Shahtaz: “${text}”`,
            time: "Now",
          }
        : { id: Date.now(), type: "human", name: "Shahtaz", text, time: "Now" };
    updateConversation({
      messages: [...conversation.messages, newMessage],
      lastMessage: mode === "note" ? conversation.lastMessage : text,
      timestamp: "Now",
      owner: mode === "reply" ? "Shahtaz" : conversation.owner,
    });
    toast.success(mode === "note" ? "Internal note added" : "Reply sent");
  };

  return (
    <section className="relative -m-8 flex h-[calc(100%+4rem)] min-h-[620px] overflow-hidden rounded-2xl bg-background">
      <ConversationList
        conversations={visibleConversations}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setBlocked(false);
          setConversations((items) =>
            items.map((item) =>
              item.id === id ? { ...item, unread: 0 } : item,
            ),
          );
        }}
        filter={filter}
        setFilter={setFilter}
        channel={channel}
        setChannel={setChannel}
        query={query}
        setQuery={setQuery}
      />
      <ChatPanel
        conversation={conversation}
        onTakeover={handleTakeover}
        onResolve={handleResolve}
        onAssign={handleAssign}
        onSend={handleSend}
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
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        blocked={blocked}
        onBlock={() => {
          setBlocked((value) => !value);
          toast.success(blocked ? "Visitor unblocked" : "Visitor blocked");
        }}
      />
    </section>
  );
};

export default ChatSessionPage;
