import { useState } from "react";
import {
  Archive,
  AtSign,
  Ban,
  Bot,
  Check,
  ChevronDown,
  FileText,
  Info,
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
const ChatPanel = ({
  conversation,
  onTakeover,
  onResolve,
  onAssign,
  onSend,
  onToggleContext,
}) => {
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
};

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

export default ChatPanel;
