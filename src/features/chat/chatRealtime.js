import { apiSlice } from "@/features/api/apiSlice";

const SESSION_STATE_FIELDS = [
  "status",
  "ai_enabled",
  "assigned_to",
  "has_pending_transfer",
  "transfer_requested_to",
];

function queryEntries(store, endpointName) {
  const apiState = store.getState()[apiSlice.reducerPath];
  return Object.values(apiState?.queries || {}).filter(
    (query) => query?.endpointName === endpointName && query.originalArgs,
  );
}

function sessionCollection(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return null;
}

function sessionDetails(response) {
  let value = response;
  while (value?.data && !Array.isArray(value.data)) value = value.data;
  return value && !Array.isArray(value) ? value : null;
}

function patchStableState(session, update) {
  SESSION_STATE_FIELDS.forEach((field) => {
    if (Object.hasOwn(update, field)) session[field] = update[field];
  });
}

function isSession(session, sessionId) {
  return String(session.id || session.session_id) === String(sessionId);
}

function currentMembershipId(store, chatbotSlug) {
  const currentEmail = String(
    store.getState().auth?.user?.email || "",
  ).toLowerCase();
  if (!currentEmail) return null;

  for (const { originalArgs, data } of queryEntries(
    store,
    "chatbotMemberList",
  )) {
    if (originalArgs.chatbotSlug !== chatbotSlug) continue;
    const members = sessionCollection(data);
    const membership = members?.find(
      (member) =>
        String(member.user?.email || "").toLowerCase() === currentEmail,
    );
    if (membership?.id) return membership.id;
  }

  return null;
}

function noLongerMatchesList(args, update, membershipId) {
  if (args.status && update.status !== args.status) return true;
  if (args.is_resolved && update.status !== "resolved") return true;

  if (args.assignedTo === "mine" && membershipId) {
    return String(update.assigned_to?.id || "") !== String(membershipId);
  }
  if (args.assignedTo && args.assignedTo !== "mine") {
    return String(update.assigned_to?.id || "") !== String(args.assignedTo);
  }

  return false;
}

function mayHaveEnteredFilteredList(args, update, membershipId) {
  if (args.status) return update.status === args.status;
  if (args.is_resolved) return update.status === "resolved";
  if (args.assignedTo === "mine") {
    return (
      !membershipId ||
      String(update.assigned_to?.id || "") === String(membershipId)
    );
  }
  if (args.assignedTo) {
    return String(update.assigned_to?.id || "") === String(args.assignedTo);
  }
  return false;
}

function patchSessionLists(event, dispatch, store) {
  const chatbotSlugsToRefetch = new Set();

  queryEntries(store, "chatSessionList").forEach(({ originalArgs }) => {
    let foundSession = false;
    let removedSession = false;
    const membershipId =
      originalArgs.assignedTo === "mine"
        ? currentMembershipId(store, originalArgs.chatbotSlug)
        : null;

    dispatch(
      apiSlice.util.updateQueryData(
        "chatSessionList",
        originalArgs,
        (response) => {
          const sessions = sessionCollection(response);
          if (!sessions) return;

          const index = sessions.findIndex((session) =>
            isSession(session, event.session_id),
          );
          if (index === -1) return;

          foundSession = true;
          if (
            noLongerMatchesList(originalArgs, event.data, membershipId)
          ) {
            sessions.splice(index, 1);
            removedSession = true;
            return;
          }

          patchStableState(sessions[index], event.data);
        },
      ),
    );

    const needsAuthoritativeList =
      removedSession ||
      (originalArgs.assignedTo === "mine" && !membershipId) ||
      (!foundSession &&
        mayHaveEnteredFilteredList(originalArgs, event.data, membershipId));
    if (needsAuthoritativeList && originalArgs.chatbotSlug) {
      chatbotSlugsToRefetch.add(originalArgs.chatbotSlug);
    }
  });

  if (chatbotSlugsToRefetch.size) {
    dispatch(
      apiSlice.util.invalidateTags(
        [...chatbotSlugsToRefetch].map((chatbotSlug) => ({
          type: "chat-sessions",
          id: chatbotSlug,
        })),
      ),
    );
  }
}

function patchSessionDetails(event, dispatch, store) {
  queryEntries(store, "chatSessionDetail").forEach(({ originalArgs }) => {
    if (String(originalArgs.sessionId) !== String(event.session_id)) return;

    dispatch(
      apiSlice.util.updateQueryData(
        "chatSessionDetail",
        originalArgs,
        (response) => {
          const session = sessionDetails(response);
          if (session) patchStableState(session, event.data);
        },
      ),
    );
  });
}

export function applySessionManagementUpdate(event, dispatch, store) {
  if (
    event?.type !== "session.updated" ||
    !event.session_id ||
    !event.data
  ) {
    return false;
  }

  patchSessionLists(event, dispatch, store);
  patchSessionDetails(event, dispatch, store);
  dispatch(apiSlice.util.invalidateTags(["chat-session-transfers"]));
  return true;
}
