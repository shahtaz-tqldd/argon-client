import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  AlertCircle,
  AtSign,
  Ban,
  Bot,
  Check,
  ChevronDown,
  FileText,
  Info,
  LoaderCircle,
  MessageCircleMore,
  MoreHorizontal,
  Paperclip,
  Send,
  Smile,
  Sparkles,
  UserRound,
  UserRoundPlus,
  UsersRound,
  WandSparkles,
} from "lucide-react";

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

const team = ["Shahtaz", "Nadia Rahman", "Arif Hossain", "Unassigned"];

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Previous messages";

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );
  if (dayDifference === 0) return "Today";
  if (dayDifference === 1) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(date);
}

function messageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function groupMessages(messages) {
  const sorted = [...messages].sort((first, second) => {
    const firstTime = new Date(first.created_at || first.updated_at).getTime();
    const secondTime = new Date(second.created_at || second.updated_at).getTime();
    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) return 0;
    return firstTime - secondTime;
  });

  return sorted.reduce((groups, message) => {
    const createdAt = message.created_at || message.updated_at;
    const key = dateKey(createdAt);
    const lastGroup = groups.at(-1);
    if (lastGroup?.key === key) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ key, label: dateLabel(createdAt), messages: [message] });
    }
    return groups;
  }, []);
}

const ChatPanel = ({
  conversation,
  messages = [],
  isLoading = false,
  isError = false,
  onRetry,
  onTakeover,
  onResolve,
  onAssign,
  onSend,
  onToggleContext,
}) => {
  const [mode, setMode] = useState("reply");
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);
  const messageGroups = useMemo(() => groupMessages(messages), [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const submitMessage = () => {
    const text = draft.trim();
    if (!text || !onSend) return;
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
                disabled={!onAssign}
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
            disabled={!onTakeover}
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
            disabled={!onResolve}
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
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading conversation…
            </div>
          ) : isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <AlertCircle className="size-7 text-destructive/70" />
              <p className="mt-3 text-sm font-semibold">Couldn’t load this conversation</p>
              <p className="mt-1 text-xs text-muted-foreground">Please try again.</p>
              <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>
                Try again
              </Button>
            </div>
          ) : messageGroups.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center text-muted-foreground">
              <MessageCircleMore className="size-7 opacity-50" />
              <p className="mt-3 text-sm font-semibold text-foreground">No messages yet</p>
              <p className="mt-1 text-xs">New messages will appear here.</p>
            </div>
          ) : (
            messageGroups.map((group, groupIndex) => (
              <section key={`${group.key}-${groupIndex}`} className="space-y-4">
                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                {group.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} customer={conversation} />
                ))}
              </section>
            ))
          )}
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      {onSend && <footer className="shrink-0 border-t bg-card p-4">
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
      </footer>}
    </main>
  );
};

function MessageBubble({ message, customer }) {
  const senderType = message.sender_type || message.type;
  const isSystem = senderType === "system" || senderType === "event";
  const content =
    message.content ||
    message.text ||
    message.event ||
    message.metadata?.message ||
    "System update";
  const time = messageTime(message.created_at || message.updated_at) || message.time;

  if (isSystem) {
    return (
      <div className="my-5 flex items-center gap-3 px-4">
        <span className="h-px flex-1 bg-border" />
        <div className="flex max-w-[80%] items-center gap-2 text-center text-[11px] text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Sparkles className="size-3" />
          </span>
          <span>
            <strong className="font-semibold text-foreground">
              {content}
            </strong>
            {message.detail ? ` · ${message.detail}` : ""}
            {time ? ` · ${time}` : ""}
          </span>
        </div>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  const isCustomer = senderType === "visitor" || senderType === "customer";
  const isAi = senderType === "ai";
  const isAgent = senderType === "agent" || senderType === "human";
  const senderName =
    (typeof message.sender === "string" ? message.sender : message.sender?.name) ||
    message.sender_name ||
    message.metadata?.sender_name ||
    message.name ||
    "Agent";
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
          {isAgent && (
            <>
              <span>{senderName}</span>
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
          <p className="whitespace-pre-wrap break-words">{content}</p>
          {message.attachments?.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-current/15 pt-2">
              {message.attachments.map((attachment, index) => (
                <a
                  key={attachment.id || attachment.url || index}
                  className="flex items-center gap-1.5 text-xs underline underline-offset-2"
                  href={attachment.url || attachment.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Paperclip className="size-3" />
                  {attachment.name || attachment.filename || `Attachment ${index + 1}`}
                </a>
              ))}
            </div>
          )}
        </div>
        <p
          className={cn(
            "mt-1 text-[10px] text-muted-foreground",
            !isCustomer && "text-right",
          )}
        >
          {time}
          {!isCustomer && message.status ? ` · ${message.status}` : ""}
        </p>
      </div>
    </div>
  );
}

export default ChatPanel;
