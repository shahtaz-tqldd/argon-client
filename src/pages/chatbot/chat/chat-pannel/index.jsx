import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowRightLeft,
  AtSign,
  Check,
  ChevronDown,
  Info,
  LoaderCircle,
  MessageCircleMore,
  Paperclip,
  Send,
  Smile,
  Sparkles,
  UserRound,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useChatSessionDetailQuery,
} from "@/features/chat/chatApiSlice";
import { useCapturedLeadDetailQuery } from "@/features/lead_captures/leadCaptureApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { subscribeDashboardSession } from "@/hooks/useDashboardSocket";
import { cn } from "@/lib/utils";
import { buildConversation } from "../lib";
import CustomerContext from "../customer-context";
import SessionDropdown from "./dropdown-menu";
import MessageDisplay from "./message-display";

function unwrapObject(payload) {
  let value = payload;
  while (value?.data && !Array.isArray(value.data)) value = value.data;
  return value && !Array.isArray(value) ? value : {};
}

const ChatPanel = ({
  conversationSummary,
  contextOpen,
  onCloseContext,
  onTakeover,
  onResolve,
  onTransfer,
  onSend,
  onDelete,
  onToggleContext,
  teamMembers = [],
  currentAgentId,
  isMembersLoading = false,
  isOwnershipUpdating = false,
  pendingTransfer,
  isTransferActionLoading = false,
  onAcceptTransfer,
  onDeclineTransfer,
  isSending = false,
  isDeleting = false,
}) => {
  const [draft, setDraft] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { chatbotSlug } = useCurrentChatbot();
  const sessionId = conversationSummary.id;
  const sessionQuery = useChatSessionDetailQuery(
    { chatbotSlug, sessionId },
    { skip: !chatbotSlug || !sessionId },
  );

  const sessionDetails = unwrapObject(sessionQuery.currentData);
  const chatbot = sessionDetails.chatbot || {};
  const chatbotName = chatbot.chatbot_name || "Argon Chatbot";
  const chatbotLogo = chatbot.logo;
  const conversation = useMemo(
    () => buildConversation(conversationSummary, sessionDetails),
    [conversationSummary, sessionDetails],
  );
  const leadId =
    conversation.lead_id ||
    conversation.captured_lead_id ||
    conversation.user_data?.lead_id ||
    conversation.lead?.id;
  const leadQuery = useCapturedLeadDetailQuery(
    { chatbotSlug, leadId },
    { skip: !chatbotSlug || !sessionId || !leadId },
  );
  const lead = unwrapObject(leadQuery.currentData);
  const isLoading =
    sessionQuery.isLoading ||
    (sessionQuery.isFetching && !sessionQuery.currentData);
  const isError = sessionQuery.isError;
  const assignedAgentId = conversation.assigned_to?.id;
  const isOwnedByCurrentAgent =
    Boolean(assignedAgentId) && assignedAgentId === currentAgentId;
  const canTakeOver = !assignedAgentId && conversation.status !== "resolved";
  const canRelease = isOwnedByCurrentAgent;

  useEffect(() => subscribeDashboardSession(sessionId), [sessionId]);

  const submitMessage = async () => {
    const text = draft.trim();
    if (!text || !onSend || isSending) return;
    const succeeded = await onSend(text);
    if (succeeded !== false) setDraft("");
  };

  const retryConversation = () => {
    sessionQuery.refetch();
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    const succeeded = await onDelete(conversation);
    if (succeeded !== false) setDeleteDialogOpen(false);
  };

  return (
    <>
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
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden xl:flex"
                  disabled={
                    !isOwnedByCurrentAgent ||
                    isMembersLoading ||
                    isOwnershipUpdating
                  }
                  title={
                    isOwnedByCurrentAgent
                      ? "Transfer this conversation"
                      : "Only the current owner can transfer this conversation"
                  }
                >
                  <UsersRound />
                  {conversation.owner}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Transfer conversation</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={assignedAgentId || ""}
                  onValueChange={(agentId) =>
                    onTransfer?.(conversation, agentId)
                  }
                >
                  {isMembersLoading && (
                    <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                      <LoaderCircle className="size-3.5 animate-spin" />
                      Loading teammates…
                    </DropdownMenuLabel>
                  )}
                  {teamMembers
                    .filter((member) => member.id !== currentAgentId)
                    .map((member) => (
                      <DropdownMenuRadioItem
                        key={member.id}
                        value={member.id}
                        disabled={!onTransfer}
                      >
                        <UserRound />
                        {member.name}
                      </DropdownMenuRadioItem>
                    ))}
                  {!isMembersLoading &&
                    teamMembers.filter((member) => member.id !== currentAgentId)
                      .length === 0 && (
                      <DropdownMenuLabel className="font-normal text-muted-foreground">
                        No teammates available
                      </DropdownMenuLabel>
                    )}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {(canTakeOver || isOwnershipUpdating) && (
              <Button
                onClick={() => onTakeover?.(conversation)}
                disabled={!onTakeover || isOwnershipUpdating}
                variant="default"
                size="sm"
              >
                {isOwnershipUpdating ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Updating
                  </>
                ) : (
                  <>
                    <UserRoundPlus />
                    Take over
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={onToggleContext}
              variant="ghost"
              size="icon-sm"
              className="xl:hidden"
              aria-label="Show customer context"
            >
              <Info />
            </Button>
            <SessionDropdown
              setDeleteDialogOpen={setDeleteDialogOpen}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>
        </header>

        {pendingTransfer && (
          <div className="flex shrink-0 items-center gap-3 border-b border-violet-500/20 bg-violet-500/[0.06] px-5 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <ArrowRightLeft className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">
                {pendingTransfer.from_agent?.name || "A teammate"} wants to
                transfer this conversation to you
              </p>
              {pendingTransfer.reason && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {pendingTransfer.reason}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isTransferActionLoading}
              onClick={() => onDeclineTransfer?.(pendingTransfer)}
            >
              Decline
            </Button>
            <Button
              size="sm"
              disabled={isTransferActionLoading}
              onClick={() => onAcceptTransfer?.(pendingTransfer)}
            >
              {isTransferActionLoading && (
                <LoaderCircle className="animate-spin" />
              )}
              Accept
            </Button>
          </div>
        )}

        <MessageDisplay
          key={sessionId}
          chatbotSlug={chatbotSlug}
          sessionId={sessionId}
          conversation={conversation}
          chatbotName={chatbotName}
          chatbotLogo={chatbotLogo}
          isConversationLoading={isLoading}
          isConversationError={isError}
          onRetryConversation={retryConversation}
        />

        {onSend &&
          isOwnedByCurrentAgent &&
          conversation.status !== "resolved" && (
            <footer className="shrink-0 border-t bg-card p-4">
              <div className="mx-auto max-w-3xl rounded-xl border bg-background shadow-sm transition focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
                <div className="flex items-center gap-1 border-b px-2 pt-1.5">
                  <button className="border-b-2 border-primary px-3 py-2 text-xs font-semibold text-primary">
                    <span className="flex items-center gap-1.5">
                      <MessageCircleMore className="size-3.5" />
                      Reply
                    </span>
                  </button>
                  <span className="ml-auto px-2 text-[10px] text-muted-foreground">
                    via {conversation.channel}
                  </span>
                </div>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submitMessage();
                    }
                  }}
                  disabled={isSending}
                  className="min-h-20 w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={`Reply to ${conversation.name.split(" ")[0]}…`}
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Attach file"
                    >
                      <Paperclip />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Insert emoji"
                    >
                      <Smile />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Mention teammate"
                    >
                      <AtSign />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
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
                      {conversation.status === "resolved" ? (
                        <Archive />
                      ) : (
                        <Check />
                      )}
                    </Button>
                    <Button
                      onClick={() => onTakeover?.(conversation)}
                      disabled={
                        !onTakeover ||
                        isOwnershipUpdating ||
                        (!canTakeOver && !canRelease)
                      }
                      variant={canTakeOver ? "default" : "outline"}
                      size="sm"
                    >
                      {isOwnershipUpdating ? (
                        <>
                          <LoaderCircle className="animate-spin" />
                          Updating
                        </>
                      ) : canRelease ? (
                        <>
                          <Sparkles />
                          Return to AI
                        </>
                      ) : (
                        <>
                          <UserRound />
                          Assigned
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={submitMessage}
                      disabled={!draft.trim() || isSending}
                      size="sm"
                    >
                      {isSending ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        <Send />
                      )}
                      {isSending ? "Sending" : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            </footer>
          )}
      </main>

      <ConfirmDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title="Delete chat?"
        description={`This will permanently delete the chat with ${conversation.name} and its message history. This action cannot be undone.`}
        confirmText="Delete chat"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      {contextOpen && (
        <button
          className="absolute inset-0 z-20 bg-black/20 xl:hidden"
          aria-label="Close customer context"
          onClick={onCloseContext}
        />
      )}
      <CustomerContext
        conversation={conversation}
        lead={lead}
        isLeadLoading={leadQuery.isLoading}
        open={contextOpen}
        onClose={onCloseContext}
      />
    </>
  );
};

export default ChatPanel;
