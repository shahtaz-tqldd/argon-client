import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useChatbotMemberListQuery } from "@/features/chatbot/chatbotApiSlice";

const EMPTY_PRESENCE = {
  onlineMemberIds: {},
  snapshotVersion: null,
  transitions: {},
};

const memberCollection = (response) =>
  Array.isArray(response?.data) ? response.data : [];

const normalizeMember = (member) => ({
  ...member,
  name: member.user?.name?.trim() || member.user?.email || "Team member",
  email: member.user?.email || "",
  avatar: member.user?.avatar_url || member.user?.avatar || "",
});

export default function useActiveChatbotMembers({
  chatbotId,
  chatbotSlug,
} = {}) {
  const query = useChatbotMemberListQuery(
    { chatbotSlug, page: 1, pageSize: 100 },
    { skip: !chatbotSlug },
  );
  const presenceByChatbotId = useSelector(
    (state) => state.chatbotPresence.byChatbotId,
  );

  const members = useMemo(
    () =>
      memberCollection(query.data)
        .filter((member) => member.is_active && member.user)
        .map(normalizeMember),
    [query.data],
  );
  const presence = useMemo(() => {
    const exactPresence = chatbotId
      ? presenceByChatbotId[String(chatbotId)]
      : null;
    if (exactPresence) return exactPresence;

    const memberIds = new Set(
      memberCollection(query.data).map((member) => String(member.id)),
    );
    const presenceEntries = Object.values(presenceByChatbotId);
    const matchingPresence = presenceEntries.find((candidate) =>
      Object.keys(candidate.onlineMemberIds).some((memberId) =>
        memberIds.has(memberId),
      ),
    );

    if (matchingPresence) return matchingPresence;
    if (presenceEntries.length === 1) return presenceEntries[0];
    return EMPTY_PRESENCE;
  }, [chatbotId, presenceByChatbotId, query.data]);
  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) => presence.onlineMemberIds[String(member.id)],
      ),
    [members, presence.onlineMemberIds],
  );

  return {
    ...query,
    members,
    activeMembers,
    onlineMemberIds: Object.keys(presence.onlineMemberIds),
    isPresenceReady:
      presence.snapshotVersion !== null ||
      Object.keys(presence.transitions).length > 0 ||
      Object.values(presenceByChatbotId).some(
        (candidate) => candidate.snapshotVersion !== null,
      ),
  };
}
