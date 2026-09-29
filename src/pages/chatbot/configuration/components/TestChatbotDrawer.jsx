import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Dot,
  LoaderCircle,
  MessageCircle,
  MessageCircleMore,
  Plus,
  RefreshCw,
  Send,
  Sparkle,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { ChatbotAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useTestMessageCreateMutation,
  useTestMessageListQuery,
  useTestSessionCreateMutation,
  useTestSessionListQuery,
} from "@/features/chat/chatApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/section";

const PAGE_SIZE = 100;

function unwrapList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function unwrapItem(response) {
  return response?.data?.data || response?.data || response;
}

function formatDate(value) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function SessionList({ chatbotSlug, onSelect }) {
  const sessionQuery = useTestSessionListQuery(
    { chatbotSlug, pageSize: PAGE_SIZE },
    { skip: !chatbotSlug },
  );
  const [createSession, createState] = useTestSessionCreateMutation();
  const sessions = useMemo(
    () => unwrapList(sessionQuery.currentData),
    [sessionQuery.currentData],
  );

  const handleCreate = async () => {
    if (!chatbotSlug || createState.isLoading) return;
    try {
      const response = await createSession({ chatbotSlug }).unwrap();
      const session = unwrapItem(response);
      if (!session?.id) throw new Error("Missing test session id.");
      onSelect(session);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to create a test session."),
      );
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <header className="flex py-4 shrink-0 gap-3 border-b px-5">
        <SectionTitle
          title="Test your Chatbot"
          details="Ask questions against your knowledge base to test chatbot's
            performance"
          icon={Sparkle}
        />
        <SheetClose asChild>
          <Button variant="ghost" size="icon" aria-label="Close test chatbot">
            <X />
          </Button>
        </SheetClose>
      </header>

      <div className="p-4">
        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={createState.isLoading}
        >
          {createState.isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Plus />
          )}
          {createState.isLoading
            ? "Creating session…"
            : "Start a new Chat Session"}
        </Button>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {sessionQuery.isLoading ? (
          <div className="center h-40 text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        ) : sessionQuery.isError ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Test sessions could not be loaded.
            </p>
            <Button variant="outline" size="sm" onClick={sessionQuery.refetch}>
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center px-8 text-center">
            <span className="center mb-4 size-12 rounded-full bg-muted text-muted-foreground">
              <MessageCircleMore className="size-5" />
            </span>
            <p className="font-medium">No test sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a session to try your chatbot as a visitor.
            </p>
            <Button
              className="mt-4"
              size="sm"
              onClick={handleCreate}
              disabled={createState.isLoading}
            >
              {createState.isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Plus />
              )}
              Start new test chat
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelect(session)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="center size-10 shrink-0 rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  <MessageCircle size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {String(session.id)}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground flx">
                    {formatDate(session.last_activity_at || session.created_at)}
                    <Dot /> {session.message_count || 0}{" "}
                    {session.message_count === 1 ? "message" : "messages"}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message, chatbot }) {
  const isVisitor = message.sender_type === "visitor";
  return (
    <div
      className={cn(
        "flex gap-2.5",
        isVisitor ? "justify-end" : "justify-start",
      )}
    >
      {!isVisitor && (
        <ChatbotAvatar chatbot={chatbot} size="sm" className="mt-1" />
      )}
      <div className="max-w-[78%]">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isVisitor
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-muted text-foreground",
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p
          className={cn(
            "mt-1 px-1 text-[10px] text-muted-foreground",
            isVisitor && "text-right",
          )}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator({ chatbot }) {
  return (
    <div
      className="flex items-start gap-2.5"
      aria-label="Chatbot is responding"
    >
      <ChatbotAvatar chatbot={chatbot} size="sm" className="mt-1" />
      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageThread({ chatbotSlug, chatbot, session, onBack }) {
  const [draft, setDraft] = useState("");
  const isSessionOpen =
    Boolean(session?.id) &&
    !["resolved", "closed", "ended"].includes(session?.status);
  const [pendingMessage, setPendingMessage] = useState(null);
  const bottomRef = useRef(null);
  const messageQuery = useTestMessageListQuery(
    { chatbotSlug, sessionId: session?.id, pageSize: PAGE_SIZE },
    { skip: !chatbotSlug || !session?.id },
  );
  const [createMessage, createState] = useTestMessageCreateMutation();
  const messages = useMemo(
    () =>
      [...unwrapList(messageQuery.currentData)].sort(
        (first, second) =>
          new Date(first.created_at).getTime() -
          new Date(second.created_at).getTime(),
      ),
    [messageQuery.currentData],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, pendingMessage, createState.isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || createState.isLoading) return;
    setDraft("");
    setPendingMessage({
      id: `pending-${Date.now()}`,
      sender_type: "visitor",
      content,
      created_at: new Date().toISOString(),
    });

    try {
      await createMessage({
        chatbotSlug,
        sessionId: session.id,
        payload: { content },
      }).unwrap();
      await messageQuery.refetch();
      setPendingMessage(null);
    } catch (error) {
      setPendingMessage(null);
      setDraft(content);
      toast.error(getApiErrorMessage(error, "The chatbot could not respond."));
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back to test sessions"
        >
          <ArrowLeft />
        </Button>
        <ChatbotAvatar chatbot={chatbot} size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">
            {chatbot?.chatbot_name || chatbot?.name || "Chatbot"}
          </h2>
          <p className="text-xs text-muted-foreground">Test conversation</p>
        </div>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" aria-label="Close test chatbot">
            <X />
          </Button>
        </SheetClose>
      </header>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-muted/20 px-4 py-5">
        {messageQuery.isLoading ? (
          <div className="center h-full text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        ) : messageQuery.isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              Messages could not be loaded.
            </p>
            <Button variant="outline" size="sm" onClick={messageQuery.refetch}>
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 && !pendingMessage && (
              <div className="mx-auto max-w-xs py-16 text-center">
                <span className="center mx-auto mb-4 size-12 rounded-full bg-primary/10 text-primary">
                  <MessageCircleMore className="size-5" />
                </span>
                <p className="font-medium">Start a conversation</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send a message to see how your chatbot responds.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                chatbot={chatbot}
              />
            ))}
            {pendingMessage && (
              <MessageBubble message={pendingMessage} chatbot={chatbot} />
            )}
            {createState.isLoading && <TypingIndicator chatbot={chatbot} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t bg-background p-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 pl-4 shadow-sm focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={10000}
            disabled={createState.isLoading || !isSessionOpen}
            placeholder={
              isSessionOpen ? "Type a message…" : "This session has ended"
            }
            aria-label="Test message"
            className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!draft.trim() || createState.isLoading || !isSessionOpen}
            aria-label="Send test message"
          >
            {createState.isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Send />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Test replies use your chatbot's current configuration.
        </p>
      </form>
    </div>
  );
}

const TestChatbotDrawer = ({ open, onOpenChange, chatbotSlug, chatbot }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const activeSession = selectedSession?.id ? selectedSession : null;

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setSelectedSession(null);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full max-w-full gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <SheetTitle className="sr-only">Test chatbot</SheetTitle>
        <SheetDescription className="sr-only">
          Create a test session and chat with your current chatbot
          configuration.
        </SheetDescription>
        <div className="relative h-full w-full overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none",
              activeSession ? "-translate-x-full" : "translate-x-0",
            )}
          >
            <SessionList
              chatbotSlug={chatbotSlug}
              onSelect={setSelectedSession}
            />
          </div>
          <div
            className={cn(
              "absolute inset-0 translate-x-full transition-transform duration-300 ease-out motion-reduce:transition-none",
              activeSession && "translate-x-0",
            )}
          >
            {activeSession && (
              <MessageThread
                chatbotSlug={chatbotSlug}
                chatbot={chatbot}
                session={activeSession}
                onBack={() => setSelectedSession(null)}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TestChatbotDrawer;
