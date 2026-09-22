import { useEffect, useMemo, useState } from "react";
import {
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
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/dialog/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useChatSessionDetailQuery,
  useResolveSessionMutation,
} from "@/features/chat/chatApiSlice";
import { useCapturedLeadDetailQuery } from "@/features/lead_captures/leadCaptureApiSlice";
import useActiveChatbotMembers from "@/hooks/useActiveChatbotMembers";
import { subscribeDashboardSession } from "@/hooks/useDashboardSocket";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { buildConversation } from "../lib";
import CustomerContext from "../customer-context";
import SessionDropdown from "./dropdown-menu";
import MessageDisplay from "./message-display";

function unwrapObject(payload) {
  let value = payload;
  while (value?.data && !Array.isArray(value.data)) value = value.data;
  return value && !Array.isArray(value) ? value : {};
}

const TransferMemberAvatar = ({ member }) => (
  <span className="center size-5 overflow-hidden rounded-full bg-primary/10 text-[10px] font-bold text-primary">
    {member.avatar ? (
      <img
        src={member.avatar}
        alt={`${member.name} avatar`}
        className="size-full object-cover"
      />
    ) : (
      getInitials(member.name, true)
    )}
  </span>
);

const ChatPanel = ({
  chatbotId,
  chatbotSlug,
  conversationSummary,
  contextOpen,
  onCloseContext,
  onTakeover,
  onTransfer,
  onSend,
  onDelete,
  onToggleContext,
  currentAgentId,
  isMembersLoading = false,
  isOwnershipUpdating = false,
  pendingTransfer,
  isTransferStatusLoading = false,
  isTransferActionLoading = false,
  onAcceptTransfer,
  onDeclineTransfer,
  onCancelTransfer,
  onForceTakeover,
  isSending = false,
  isDeleting = false,
}) => {
  const [draft, setDraft] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forceTakeoverDialogOpen, setForceTakeoverDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [takeoverReason, setTakeoverReason] = useState("");
  const sessionId = conversationSummary.id;
  const sessionQuery = useChatSessionDetailQuery(
    { chatbotSlug, sessionId },
    { skip: !chatbotSlug || !sessionId },
  );

  const sessionDetails = unwrapObject(sessionQuery.currentData);
  const [resolveSession, resolveState] = useResolveSessionMutation();
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
    Boolean(assignedAgentId) &&
    String(assignedAgentId) === String(currentAgentId);
  const canTransferConversation = !assignedAgentId || isOwnedByCurrentAgent;
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

  const handleResolve = async () => {
    if (resolveState.isLoading) return;

    try {
      const response = await resolveSession({
        chatbotSlug,
        sessionId,
        payload: {
          note: resolutionNote.trim(),
          resolution_type: "resolved",
        },
      }).unwrap();

      setResolveDialogOpen(false);
      setResolutionNote("");
      toast.success(response?.message || "Session resolved successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to resolve this session."));
    }
  };

  const handleForceTakeover = async () => {
    const reason = takeoverReason.trim();
    if (!reason || !onForceTakeover || isOwnershipUpdating) return;

    const succeeded = await onForceTakeover(conversation, reason);
    if (succeeded !== false) {
      setForceTakeoverDialogOpen(false);
      setTakeoverReason("");
    }
  };

  // ACTIVE MEMBERS
  const {
    members,
    isLoading: activeMemberLoading,
    isFetching,
    isError: activeMemberError,
    isPresenceReady,
    refetch,
  } = useActiveChatbotMembers({ chatbotId, chatbotSlug });
  const transferMembers = useMemo(
    () =>
      members.filter((member) => String(member.id) !== String(currentAgentId)),
    [currentAgentId, members],
  );
  const assignedMember = useMemo(() => {
    if (!assignedAgentId) return null;

    const member = members.find(
      (candidate) => String(candidate.id) === String(assignedAgentId),
    );
    if (member) return member;

    const assigned = conversation.assigned_to || {};
    return {
      id: assignedAgentId,
      name:
        assigned.name?.trim() ||
        assigned.full_name?.trim() ||
        assigned.email ||
        conversation.owner ||
        "Team member",
      email: assigned.email || "",
      avatar: assigned.avatar_url || assigned.avatar || "",
      isActive: false,
    };
  }, [assignedAgentId, conversation.assigned_to, conversation.owner, members]);
  const pendingTransferMember = useMemo(() => {
    const recipient = pendingTransfer?.to_agent;
    if (!recipient) return null;

    const member = members.find(
      (candidate) => String(candidate.id) === String(recipient.id),
    );
    if (member) return member;

    return {
      id: recipient.id,
      name: recipient.name?.trim() || recipient.email || "Team member",
      email: recipient.email || "",
      avatar: recipient.avatar_url || recipient.avatar || "",
      isActive: false,
    };
  }, [members, pendingTransfer]);
  const isPendingTransferRecipient =
    Boolean(pendingTransferMember?.id) &&
    String(pendingTransferMember.id) === String(currentAgentId);
  const isPendingTransferRequester =
    Boolean(pendingTransfer?.from_agent?.id) &&
    String(pendingTransfer.from_agent.id) === String(currentAgentId);
  const isTransferMembersLoading =
    activeMemberLoading ||
    (!activeMemberError && !isPresenceReady) ||
    (isFetching && !members.length);

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
            {isTransferStatusLoading ? (
              <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground xl:flex">
                <LoaderCircle className="size-3.5 animate-spin" />
                Checking transfer…
              </div>
            ) : pendingTransferMember ? (
              <div
                title={`Transfer requested to ${pendingTransferMember.name}`}
                className="min-w-0 max-w-52 rounded-full"
              >
                <div className="flx gap-2 min-w-0 max-w-44 border rounded-full p-2 pr-2.5 relative">
                  <span className="bg-yellow-400 absolute size-2.5 rounded-full -top-[5px] right-2.5"></span>
                  <TransferMemberAvatar member={pendingTransferMember} />
                  <span className="block truncate text-xs font-semibold">
                    {pendingTransferMember.name}
                  </span>
                </div>
              </div>
            ) : assignedAgentId && isMembersLoading ? (
              <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground xl:flex">
                <LoaderCircle className="size-3.5 animate-spin" />
                Checking owner…
              </div>
            ) : canTransferConversation ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden xl:flex"
                    disabled={isTransferMembersLoading || isOwnershipUpdating}
                    title="Transfer this conversation"
                  >
                    <UsersRound />
                    {isOwnedByCurrentAgent ? "Transfer" : "Assign"}
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-fit max-w-80">
                  <DropdownMenuLabel>
                    {isOwnedByCurrentAgent ? "Transfer" : "Assign"} conversation
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isTransferMembersLoading && (
                    <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                      <LoaderCircle className="size-3.5 animate-spin" />
                      Loading teammates…
                    </DropdownMenuLabel>
                  )}
                  {!isTransferMembersLoading &&
                    transferMembers.map((member) => (
                      <DropdownMenuItem
                        key={member.id}
                        disabled={!onTransfer}
                        className="py-2"
                        onSelect={() => onTransfer?.(conversation, member.id)}
                      >
                        <TransferMemberAvatar member={member} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold">
                            {member.name}
                          </span>
                        </span>
                        <div className="ml-4 flex items-center gap-1">
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              member.isActive
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : "bg-slate-300",
                            )}
                          />
                          <span
                            className={cn(
                              "text-[10px] font-semibold",
                              member.isActive
                                ? "text-emerald-500 dark:text-emerald-400"
                                : "text-muted-foreground",
                            )}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  {!isTransferMembersLoading && activeMemberError && (
                    <DropdownMenuLabel className="font-normal text-muted-foreground">
                      Couldn't load teammates.
                      <button
                        type="button"
                        className="ml-1 font-semibold text-primary hover:underline"
                        onClick={() => refetch()}
                      >
                        Try again
                      </button>
                    </DropdownMenuLabel>
                  )}
                  {!isTransferMembersLoading &&
                    !activeMemberError &&
                    transferMembers.length === 0 && (
                      <DropdownMenuLabel className="font-normal text-muted-foreground">
                        No teammates available
                      </DropdownMenuLabel>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : assignedMember ? (
              <div
                title={`Currently taken over by ${assignedMember.name}`}
                className="flx gap-2 min-w-0 max-w-44 border rounded-full p-2 pr-2.5"
              >
                <TransferMemberAvatar member={assignedMember} />
                <span className="block truncate text-xs font-semibold">
                  {assignedMember.name}
                </span>
              </div>
            ) : null}

            {!isTransferStatusLoading &&
              !pendingTransfer &&
              (canTakeOver || isOwnershipUpdating) && (
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
                {isPendingTransferRecipient
                  ? `${pendingTransfer.from_agent?.name || "A teammate"} wants to transfer this conversation to you`
                  : `Transfer requested to ${pendingTransfer.to_agent?.name || "a teammate"}`}
              </p>
              {pendingTransfer.reason && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {pendingTransfer.reason}
                </p>
              )}
            </div>
            {isPendingTransferRecipient && (
              <>
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
              </>
            )}
            {isPendingTransferRequester && (
              <Button
                variant="outline"
                size="sm"
                disabled={isTransferActionLoading}
                onClick={() => onCancelTransfer?.(pendingTransfer)}
              >
                {isTransferActionLoading && (
                  <LoaderCircle className="animate-spin" />
                )}
                Cancel
              </Button>
            )}
            {!isPendingTransferRecipient && !isPendingTransferRequester && (
              <Button
                variant="destructive"
                size="sm"
                disabled={!onForceTakeover || isOwnershipUpdating}
                onClick={() => setForceTakeoverDialogOpen(true)}
              >
                Force takeover
              </Button>
            )}
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
                  {/* <span className="ml-auto px-2 text-[10px] text-muted-foreground">
                    via {conversation.channel}
                  </span> */}
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
                    {conversation.requires_attention && (
                      <Button
                        onClick={() => setResolveDialogOpen(true)}
                        disabled={resolveState.isLoading}
                        variant="outline"
                        size="icon-sm"
                        aria-label="Resolve session"
                        title="Resolve session"
                      >
                        <Check />
                      </Button>
                    )}
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
        open={resolveDialogOpen}
        setOpen={(open) => {
          setResolveDialogOpen(open);
          if (!open && !resolveState.isLoading) setResolutionNote("");
        }}
        title="Resolve session?"
        description="Add an optional note describing how this session was resolved."
        confirmText="Resolve session"
        onConfirm={handleResolve}
        isLoading={resolveState.isLoading}
      >
        <div className="space-y-2">
          <Textarea
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            maxLength={512}
            rows={4}
            placeholder="Resolution note (optional)"
            aria-label="Resolution note"
            disabled={resolveState.isLoading}
          />
          <p className="text-right text-xs text-muted-foreground">
            {resolutionNote.length}/512
          </p>
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        open={forceTakeoverDialogOpen}
        setOpen={(open) => {
          setForceTakeoverDialogOpen(open);
          if (!open && !isOwnershipUpdating) setTakeoverReason("");
        }}
        title="Force takeover?"
        description="Explain why you need to take over this conversation. The current transfer request will be overridden."
        confirmText="Force takeover"
        confirmVariant="destructive"
        onConfirm={handleForceTakeover}
        isLoading={isOwnershipUpdating}
        confirmDisabled={!takeoverReason.trim()}
      >
        <div className="space-y-2">
          <Textarea
            value={takeoverReason}
            onChange={(event) => setTakeoverReason(event.target.value)}
            maxLength={256}
            rows={4}
            placeholder="Reason for taking over this conversation"
            aria-label="Takeover reason"
            disabled={isOwnershipUpdating}
          />
          <p className="text-right text-xs text-muted-foreground">
            {takeoverReason.length}/256
          </p>
        </div>
      </ConfirmDialog>
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
        open={contextOpen}
        onClose={onCloseContext}
      />
    </>
  );
};

export default ChatPanel;
