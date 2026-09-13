import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  byChatbotId: {},
};

const normalizeVersion = (version) => {
  const parsedVersion = Number(version);
  return Number.isFinite(parsedVersion) ? parsedVersion : null;
};

const getChatbotPresence = (state, chatbotId) => {
  const id = String(chatbotId);
  state.byChatbotId[id] ??= {
    snapshotVersion: null,
    onlineMemberIds: {},
    transitions: {},
  };
  return state.byChatbotId[id];
};

const presenceSlice = createSlice({
  name: "chatbotPresence",
  initialState,
  reducers: {
    chatbotPresenceSnapshotReceived: (state, action) => {
      const { chatbot_id: chatbotId, member_ids: memberIds, version } =
        action.payload || {};
      const nextVersion = normalizeVersion(version);
      if (!chatbotId || !Array.isArray(memberIds) || nextVersion === null) {
        return;
      }

      const presence = getChatbotPresence(state, chatbotId);
      if (
        presence.snapshotVersion !== null &&
        nextVersion <= presence.snapshotVersion
      ) {
        return;
      }

      const newerTransitions = Object.fromEntries(
        Object.entries(presence.transitions).filter(
          ([, transition]) => transition.version > nextVersion,
        ),
      );
      const onlineMemberIds = Object.fromEntries(
        memberIds.map((memberId) => [String(memberId), true]),
      );

      Object.entries(newerTransitions).forEach(([memberId, transition]) => {
        if (transition.isOnline) onlineMemberIds[memberId] = true;
        else delete onlineMemberIds[memberId];
      });

      presence.snapshotVersion = nextVersion;
      presence.onlineMemberIds = onlineMemberIds;
      presence.transitions = newerTransitions;
    },
    chatbotMemberPresenceChanged: (state, action) => {
      const {
        chatbotId,
        memberId,
        version,
        isOnline = false,
      } = action.payload || {};
      const nextVersion = normalizeVersion(version);
      if (!chatbotId || !memberId || nextVersion === null) return;

      const presence = getChatbotPresence(state, chatbotId);
      const previousTransitionVersion =
        presence.transitions[String(memberId)]?.version ?? -1;
      const applicableVersion = Math.max(
        presence.snapshotVersion ?? -1,
        previousTransitionVersion,
      );
      if (nextVersion <= applicableVersion) return;

      const normalizedMemberId = String(memberId);
      presence.transitions[normalizedMemberId] = {
        isOnline,
        version: nextVersion,
      };
      if (isOnline) presence.onlineMemberIds[normalizedMemberId] = true;
      else delete presence.onlineMemberIds[normalizedMemberId];
    },
    chatbotPresenceCleared: () => initialState,
  },
});

export const {
  chatbotPresenceSnapshotReceived,
  chatbotMemberPresenceChanged,
  chatbotPresenceCleared,
} = presenceSlice.actions;

export default presenceSlice.reducer;
