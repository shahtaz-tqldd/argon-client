import { useMemo, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { toast } from "sonner";

import {
  useAcceptSessionTransferMutation,
  useDeclineSessionTransferMutation,
  useIncomingSessionTransfersQuery,
  useReleaseSessionMutation,
  useRequestSessionTransferMutation,
  useSendChatMessageMutation,
  useTakeOverSessionMutation,
} from "@/features/chat-session/chatSessionApiSlice";
import { useChatbotMemberListQuery } from "@/features/chatbot/chatbotApiSlice";
import useAuth from "@/hooks/useAuth";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import ChatPanel from "./chat-pannel";
import ConversationList from "./conversation-list";

function EmptyConversation() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center bg-muted/10 px-6 text-center">
      <div>
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircleMore className="size-6" />
        </span>
        <h2 className="mt-4 text-sm font-bold">Select a conversation</h2>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Choose a conversation from the inbox to view its session, lead, and
          message history.
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
  const { user } = useAuth();
  const sessionId = selected?.id;
  const { data: memberResponse, isLoading: isMembersLoading } =
    useChatbotMemberListQuery(
      { chatbotSlug, pageSize: 100 },
      { skip: !chatbotSlug },
    );
  const [takeOverSession, takeoverState] = useTakeOverSessionMutation();
  const [releaseSession, releaseState] = useReleaseSessionMutation();
  const [requestSessionTransfer, transferState] =
    useRequestSessionTransferMutation();
  const [sendChatMessage, sendMessageState] = useSendChatMessageMutation();
  const { data: incomingTransferResponse } = useIncomingSessionTransfersQuery(
    { chatbotSlug, status: "pending" },
    { skip: !chatbotSlug },
  );
  const [acceptSessionTransfer, acceptTransferState] =
    useAcceptSessionTransferMutation();
  const [declineSessionTransfer, declineTransferState] =
    useDeclineSessionTransferMutation();

  const teamMembers = useMemo(
    () =>
      (Array.isArray(memberResponse?.data) ? memberResponse.data : [])
        .filter((member) => member.is_active && member.user)
        .map((member) => ({
          id: member.id,
          name: member.user.name?.trim() || member.user.email,
          email: member.user.email,
          avatar: member.user.avatar,
        })),
    [memberResponse],
  );
  const currentAgentId = teamMembers.find(
    (member) =>
      member.email?.toLowerCase() === String(user?.email || "").toLowerCase(),
  )?.id;
  const isOwnershipUpdating =
    takeoverState.isLoading || releaseState.isLoading || transferState.isLoading;
  const incomingTransfers = Array.isArray(incomingTransferResponse?.data)
    ? incomingTransferResponse.data
    : [];
  const pendingTransfer = incomingTransfers.find(
    (transfer) => transfer.chat_session_id === sessionId,
  );
  const isTransferActionLoading =
    acceptTransferState.isLoading || declineTransferState.isLoading;

  const handleOwnershipChange = async (conversation) => {
    const assignedAgentId = conversation.assigned_to?.id;

    try {
      const response = assignedAgentId
        ? await releaseSession({ chatbotSlug, sessionId: conversation.id }).unwrap()
        : await takeOverSession({
            chatbotSlug,
            sessionId: conversation.id,
          }).unwrap();

      toast.success(
        response?.message ||
          (assignedAgentId
            ? "Conversation returned to AI."
            : "Conversation assigned to you."),
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update conversation ownership."),
      );
    }
  };

  const handleTransfer = async (conversation, toAgentId) => {
    if (!toAgentId || toAgentId === conversation.assigned_to?.id) return;

    const recipient = teamMembers.find((member) => member.id === toAgentId);
    try {
      const response = await requestSessionTransfer({
        chatbotSlug,
        sessionId: conversation.id,
        payload: {
          to_agent_id: toAgentId,
          reason: "Handoff requested from the customer support inbox.",
        },
      }).unwrap();
      toast.success(
        response?.message ||
          `Transfer request sent to ${recipient?.name || "your teammate"}.`,
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to request this transfer."),
      );
    }
  };

  const handleIncomingTransfer = async (transfer, action) => {
    const mutation =
      action === "accept" ? acceptSessionTransfer : declineSessionTransfer;

    try {
      const response = await mutation({
        chatbotSlug,
        transferId: transfer.id,
      }).unwrap();
      toast.success(
        response?.message ||
          (action === "accept"
            ? "Conversation transfer accepted."
            : "Conversation transfer declined."),
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, `Unable to ${action} this transfer.`),
      );
    }
  };

  const handleSendMessage = async (content) => {
    if (!sessionId) return false;

    try {
      await sendChatMessage({
        chatbotSlug,
        sessionId,
        payload: { content },
      }).unwrap();
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to send this message."));
      return false;
    }
  };

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

      {!selected ? (
        <EmptyConversation />
      ) : (
        <ChatPanel
          conversationSummary={selected}
          teamMembers={teamMembers}
          currentAgentId={currentAgentId}
          isMembersLoading={isMembersLoading}
          isOwnershipUpdating={isOwnershipUpdating}
          onTakeover={handleOwnershipChange}
          onTransfer={handleTransfer}
          pendingTransfer={pendingTransfer}
          isTransferActionLoading={isTransferActionLoading}
          onAcceptTransfer={(transfer) =>
            handleIncomingTransfer(transfer, "accept")
          }
          onDeclineTransfer={(transfer) =>
            handleIncomingTransfer(transfer, "decline")
          }
          onSend={handleSendMessage}
          isSending={sendMessageState.isLoading}
          contextOpen={contextOpen}
          onToggleContext={() => setContextOpen(true)}
          onCloseContext={() => setContextOpen(false)}
        />
      )}
    </section>
  );
};

export default ChatSessionPage;
