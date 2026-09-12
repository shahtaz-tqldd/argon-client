import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  LoaderCircle,
  MessageCircleMore,
  Paperclip,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import {
  useChatMessageListQuery,
  useChatSessionMarkReadMutation,
  useLazyChatMessageListQuery,
} from "@/features/chat/chatApiSlice";
import { cn, getInitials } from "@/lib/utils";
import { ScrollContainer } from "@/components/ui/section";

const MESSAGE_PAGE_SIZE = 50;
const LOAD_MORE_THRESHOLD = 48;
const STICK_TO_BOTTOM_THRESHOLD = 96;

const markdownComponents = {
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-current/40 pl-3 opacity-90">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-black/15 px-1 py-0.5 font-mono text-[0.9em] dark:bg-black/10">
      {children}
    </code>
  ),
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-[15px] font-bold first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2.5 text-sm font-semibold first:mt-0">
      {children}
    </h3>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0">{children}</p>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-black/15 p-3 text-xs dark:bg-black/10">
      {children}
    </pre>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  table: ({ children }) => (
    <table className="my-2 w-full border-collapse text-left text-xs">
      {children}
    </table>
  ),
  td: ({ children }) => (
    <td className="border border-current/20 px-2 py-1.5">{children}</td>
  ),
  th: ({ children }) => (
    <th className="border border-current/20 px-2 py-1.5 font-semibold">
      {children}
    </th>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 first:mt-0 last:mb-0">
      {children}
    </ul>
  ),
};

function normalizeAiMarkdown(content) {
  if (typeof content !== "string") return "";

  return content
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\r\n?/g, "\n")
    .replace(/^(\s*)\\([*+-])(?=\s+)/gm, "$1$2");
}

function AiMessageContent({ content }) {
  return (
    <div className="break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {normalizeAiMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

function unwrapMessages(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function paginationMeta(payload) {
  return payload?.meta || payload?.data?.meta || {};
}

function hasPageAfter(payload, page, pageMessages) {
  const meta = paginationMeta(payload);
  const pageCount = Number(
    meta.num_pages ?? meta.total_pages ?? meta.page_count,
  );
  if (Number.isFinite(pageCount)) return page < pageCount;

  const total = Number(meta.count ?? meta.total ?? meta.total_count);
  if (Number.isFinite(total)) return page * MESSAGE_PAGE_SIZE < total;

  if (typeof meta.has_next === "boolean") return meta.has_next;
  if (meta.next !== undefined) return Boolean(meta.next);
  if (payload?.next !== undefined) return Boolean(payload.next);
  return pageMessages.length === MESSAGE_PAGE_SIZE;
}

function messageIdentity(message, index) {
  return (
    message.id ||
    `${message.created_at || message.updated_at || message.time || "message"}:${
      message.sender_type || message.type || "unknown"
    }:${message.content || message.text || index}`
  );
}

function mergeMessages(...collections) {
  const messagesById = new Map();
  collections.flat().forEach((message, index) => {
    messagesById.set(messageIdentity(message, index), message);
  });
  return [...messagesById.values()].sort((first, second) => {
    const firstTime = new Date(first.created_at || first.updated_at).getTime();
    const secondTime = new Date(
      second.created_at || second.updated_at,
    ).getTime();
    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) return 0;
    return firstTime - secondTime;
  });
}

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Previous messages";

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
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

function messageSequenceKey(message) {
  const senderType = message.sender_type || message.type;
  if (senderType === "system" || senderType === "event") return "";
  if (senderType === "visitor" || senderType === "customer") return "customer";
  if (senderType === "ai") return "ai";

  if (senderType === "agent" || senderType === "human") {
    const sender =
      typeof message.sender === "object" && message.sender
        ? message.sender
        : {};
    const identity =
      sender.id ||
      sender.user_id ||
      sender.email ||
      sender.name ||
      message.sender_name ||
      message.metadata?.sender_name ||
      message.name ||
      "agent";
    return `agent:${identity}`;
  }

  return `sender:${senderType || "unknown"}`;
}

function messagesShareSequence(first, second) {
  if (!first || !second) return false;
  const firstKey = messageSequenceKey(first);
  const secondKey = messageSequenceKey(second);
  if (!firstKey || firstKey !== secondKey) return false;

  const firstTime =
    messageTime(first.created_at || first.updated_at) || first.time;
  const secondTime =
    messageTime(second.created_at || second.updated_at) || second.time;
  return Boolean(firstTime) && firstTime === secondTime;
}

function groupMessages(messages) {
  return messages.reduce((groups, message) => {
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

function MessageAvatar({ src, name, alt }) {
  return (
    <span className="mt-5 size-8 center shrink-0 overflow-hidden rounded-full bg-primary/10 text-[10px] font-bold text-primary">
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

function ChatbotAvatar({ src, alt }) {
  return src ? (
    <span className="mt-5 size-8 center shrink-0 overflow-hidden rounded-full bg-primary/10">
      <img src={src} alt={alt} className="size-full object-contain p-1" />
    </span>
  ) : (
    <span className="mt-5 size-8 center shrink-0 overflow-hidden rounded-full bg-primary">
      <img
        src="/logo-dark.png"
        alt={alt}
        className="size-full object-cover p-1"
      />
    </span>
  );
}

function MessageBubble({
  message,
  customer,
  chatbotName,
  chatbotLogo,
  isSequenceStart = true,
  isSequenceEnd = true,
}) {
  const senderType = message.sender_type;
  const isSystem = senderType === "system";
  const content = message?.content;
  const time = messageTime(message.created_at);

  if (isSystem) {
    return (
      <div className="my-5 flex items-center gap-3 px-4">
        <span className="h-px flex-1 bg-border" />
        <div className="flex max-w-[80%] items-center gap-2 text-center text-[11px] text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Sparkles className="size-3" />
          </span>
          <span>
            <strong className="font-semibold text-foreground">{content}</strong>
            {message.detail ? ` · ${message.detail}` : ""}
            {time ? ` · ${time}` : ""}
          </span>
        </div>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  const isCustomer = senderType === "visitor";
  const isAi = senderType === "ai";
  const isAgent = senderType === "agent";
  const senderName = message.sender?.name || "Support Assistant";
  const senderAvatar = message.sender?.avatar_url;

  return (
    <div
      className={cn(
        "flex gap-2.5",
        isSequenceStart ? "mt-4" : "mt-1",
        isCustomer ? "justify-start" : "justify-end",
      )}
    >
      {isCustomer && isSequenceStart ? (
        <span
          className={cn(
            "mt-5 size-8 center shrink-0 rounded-full text-[10px] font-bold",
            customer.avatarTone,
          )}
        >
          {customer.initials}
        </span>
      ) : isCustomer ? (
        <span className="size-8 shrink-0" aria-hidden="true" />
      ) : null}

      <div className={cn("max-w-[72%]", !isCustomer && "items-end")}>
        {isSequenceStart && (
          <div
            className={cn(
              "relative mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground",
              !isCustomer && "justify-end",
            )}
          >
            {isAi && <span>{chatbotName}</span>}
            {isAgent && <span>{senderName}</span>}
            {isCustomer && <span>{customer.name}</span>}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
            isCustomer
              ? "bg-primary/10"
              : isAi
                ? "bg-primary text-white"
                : "bg-slate-700 dark:bg-slate-100 text-white",
            isSequenceStart && (isCustomer ? "rounded-tl-sm" : "rounded-tr-sm"),
          )}
        >
          {isAi ? (
            <AiMessageContent content={content} />
          ) : (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          )}
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
                  {attachment.name ||
                    attachment.filename ||
                    `Attachment ${index + 1}`}
                </a>
              ))}
            </div>
          )}
        </div>
        {isSequenceEnd && (
          <p
            className={cn(
              "mt-1 text-[10px] text-muted-foreground",
              !isCustomer && "text-right",
            )}
          >
            {time}
            {!isCustomer && message.status ? ` · ${message.status}` : ""}
          </p>
        )}
      </div>

      {!isCustomer && isSequenceStart && isAi ? (
        <ChatbotAvatar src={chatbotLogo} alt={`${chatbotName} logo`} />
      ) : !isCustomer && isSequenceStart && isAgent ? (
        <MessageAvatar
          src={senderAvatar}
          name={senderName}
          alt={`${senderName} avatar`}
        />
      ) : !isCustomer && (isAi || isAgent) ? (
        <span className="size-8 shrink-0" aria-hidden="true" />
      ) : null}
    </div>
  );
}

const MessageDisplay = ({
  chatbotSlug,
  sessionId,
  conversation,
  chatbotName,
  chatbotLogo,
  isConversationLoading = false,
  isConversationError = false,
  onRetryConversation,
}) => {
  const scrollContainerRef = useRef(null);
  const initialScrollDoneRef = useRef(false);
  const shouldStickToBottomRef = useRef(true);
  const pendingScrollAdjustmentRef = useRef(null);
  const isFetchingOlderRef = useRef(false);
  const initializedPaginationRef = useRef(false);
  const markedSessionRef = useRef(null);
  const [olderMessages, setOlderMessages] = useState([]);
  const [nextPage, setNextPage] = useState(2);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [olderMessagesError, setOlderMessagesError] = useState(false);

  const messageQuery = useChatMessageListQuery(
    { chatbotSlug, sessionId, page: 1, pageSize: MESSAGE_PAGE_SIZE },
    { skip: !chatbotSlug || !sessionId },
  );
  const [fetchMessagePage] = useLazyChatMessageListQuery();
  const [markSessionRead] = useChatSessionMarkReadMutation();
  const currentMessages = useMemo(
    () => unwrapMessages(messageQuery.currentData),
    [messageQuery.currentData],
  );
  const messages = useMemo(
    () => mergeMessages(olderMessages, currentMessages),
    [currentMessages, olderMessages],
  );
  const messageGroups = useMemo(() => groupMessages(messages), [messages]);
  const latestVisitorMessageId = [...messages]
    .reverse()
    .find((message) =>
      ["visitor", "customer"].includes(message.sender_type || message.type),
    )?.id;
  const isLoading =
    isConversationLoading ||
    messageQuery.isLoading ||
    (messageQuery.isFetching && !messageQuery.currentData);
  const isError = isConversationError || messageQuery.isError;

  useEffect(() => {
    if (!messageQuery.currentData || initializedPaginationRef.current) return;
    initializedPaginationRef.current = true;
    setHasMore(hasPageAfter(messageQuery.currentData, 1, currentMessages));
  }, [currentMessages, messageQuery.currentData]);

  useEffect(() => {
    if (!chatbotSlug || !sessionId) return;
    const readKey = `${sessionId}:${latestVisitorMessageId || "opened"}`;
    if (markedSessionRef.current === readKey) return;
    markedSessionRef.current = readKey;
    markSessionRead({ chatbotSlug, sessionId });
  }, [chatbotSlug, latestVisitorMessageId, markSessionRead, sessionId]);

  const loadOlderMessages = useCallback(async () => {
    const container = scrollContainerRef.current;
    if (
      !container ||
      !hasMore ||
      isFetchingOlderRef.current ||
      !chatbotSlug ||
      !sessionId
    ) {
      return;
    }

    isFetchingOlderRef.current = true;
    setIsLoadingOlder(true);
    setOlderMessagesError(false);
    pendingScrollAdjustmentRef.current = {
      height: container.scrollHeight,
      top: container.scrollTop,
    };

    try {
      const response = await fetchMessagePage({
        chatbotSlug,
        sessionId,
        page: nextPage,
        pageSize: MESSAGE_PAGE_SIZE,
      }).unwrap();
      const pageMessages = unwrapMessages(response);
      setOlderMessages((existing) => mergeMessages(pageMessages, existing));
      setHasMore(hasPageAfter(response, nextPage, pageMessages));
      setNextPage((page) => page + 1);
    } catch {
      pendingScrollAdjustmentRef.current = null;
      setOlderMessagesError(true);
    } finally {
      isFetchingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [chatbotSlug, fetchMessagePage, hasMore, nextPage, sessionId]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoading) return;

    const pending = pendingScrollAdjustmentRef.current;
    if (pending) {
      container.scrollTop =
        container.scrollHeight - pending.height + pending.top;
      pendingScrollAdjustmentRef.current = null;
      return;
    }

    if (!initialScrollDoneRef.current || shouldStickToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      initialScrollDoneRef.current = true;
    }
  }, [isLoading, messages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (
      !container ||
      isLoading ||
      isLoadingOlder ||
      !hasMore ||
      container.scrollHeight > container.clientHeight
    ) {
      return;
    }
    void loadOlderMessages();
  }, [hasMore, isLoading, isLoadingOlder, loadOlderMessages, messages.length]);

  const handleScroll = (event) => {
    const container = event.currentTarget;
    shouldStickToBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      STICK_TO_BOTTOM_THRESHOLD;
    if (container.scrollTop <= LOAD_MORE_THRESHOLD) {
      void loadOlderMessages();
    }
  };

  const retryConversation = () => {
    onRetryConversation?.();
    messageQuery.refetch();
  };

  return (
    <ScrollContainer
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 px-5 py-6"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading conversation…
          </div>
        ) : isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <AlertCircle className="size-7 text-destructive/70" />
            <p className="mt-3 text-sm font-semibold">
              Couldn’t load this conversation
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please try again.
            </p>
            <Button
              className="mt-4"
              size="sm"
              variant="outline"
              onClick={retryConversation}
            >
              Try again
            </Button>
          </div>
        ) : messageGroups.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center text-muted-foreground">
            <MessageCircleMore className="size-7 opacity-50" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No messages yet
            </p>
            <p className="mt-1 text-xs">New messages will appear here.</p>
          </div>
        ) : (
          <>
            {(isLoadingOlder || olderMessagesError) && (
              <div className="flex justify-center pb-1 text-[11px] text-muted-foreground">
                {isLoadingOlder ? (
                  <span className="flex items-center gap-2">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Loading older messages…
                  </span>
                ) : (
                  <Button size="xs" variant="ghost" onClick={loadOlderMessages}>
                    Couldn’t load older messages. Try again
                  </Button>
                )}
              </div>
            )}
            {messageGroups.map((group, groupIndex) => (
              <section key={`${group.key}-${groupIndex}`}>
                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                {group.messages.map((message, messageIndex) => {
                  const previousMessage = group.messages[messageIndex - 1];
                  const nextMessage = group.messages[messageIndex + 1];
                  return (
                    <MessageBubble
                      key={messageIdentity(message, messageIndex)}
                      message={message}
                      customer={conversation}
                      chatbotName={chatbotName}
                      chatbotLogo={chatbotLogo}
                      isSequenceStart={
                        !messagesShareSequence(previousMessage, message)
                      }
                      isSequenceEnd={
                        !messagesShareSequence(message, nextMessage)
                      }
                    />
                  );
                })}
              </section>
            ))}
          </>
        )}

        {conversation.owner === "AI" && conversation.status !== "resolved" && (
          <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
            {chatbotLogo ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                <img
                  src={chatbotLogo}
                  alt={`${chatbotName} logo`}
                  className="p-1 size-full rounded-full object-cover"
                />
              </span>
            ) : (
              <span className="center size-7 rounded-full bg-primary">
                <img
                  src={"/logo-dark.png"}
                  alt={`${chatbotName} logo`}
                  className="p-1 object-cover"
                />
              </span>
            )}

            <span className="rounded-full border bg-card px-3 py-1.5">
              {chatbotName} is ready to respond
            </span>
          </div>
        )}
      </div>
    </ScrollContainer>
  );
};

export default MessageDisplay;
