import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import { apiSlice } from "@/features/api/apiSlice";

const CHAT_SESSION_EVENT_PREFIX = "session.";
const AI_EVENT_PREFIX = "ai.response.";

function dashboardSocketUrl(accessToken) {
  const configuredBase =
    import.meta.env.VITE_APP_SOCKET_URL || import.meta.env.VITE_APP_BASE_URL;
  if (!configuredBase) return null;

  const base = new URL(configuredBase, window.location.origin);
  const url = new URL("/ws/notifications/", base.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", accessToken);
  return url.toString();
}

function queryEntries(store, endpointName, predicate = () => true) {
  const apiState = store.getState()[apiSlice.reducerPath];
  return Object.values(apiState?.queries || {}).filter(
    (query) =>
      query?.endpointName === endpointName &&
      query.originalArgs &&
      predicate(query.originalArgs),
  );
}

function messageCollection(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return null;
}

function compareMessages(first, second) {
  const firstTime = new Date(first.created_at || first.updated_at || 0).getTime();
  const secondTime = new Date(
    second.created_at || second.updated_at || 0,
  ).getTime();
  if (firstTime !== secondTime) return firstTime - secondTime;
  return String(first.id).localeCompare(String(second.id));
}

function upsertMessage(dispatch, store, sessionId, message) {
  queryEntries(
    store,
    "chatMessageList",
    (args) => args.sessionId === sessionId,
  ).forEach(({ originalArgs }) => {
    dispatch(
      apiSlice.util.updateQueryData(
        "chatMessageList",
        originalArgs,
        (response) => {
          const messages = messageCollection(response);
          if (!messages) return;

          const existingIndex = messages.findIndex(
            (candidate) => candidate.id === message.id,
          );
          if (existingIndex === -1) messages.push(message);
          else messages[existingIndex] = message;
          messages.sort(compareMessages);
        },
      ),
    );
  });
}

function updateConversationPreviews(dispatch, store, sessionId, message) {
  queryEntries(store, "chatSessionList").forEach(({ originalArgs }) => {
    dispatch(
      apiSlice.util.updateQueryData(
        "chatSessionList",
        originalArgs,
        (response) => {
          const sessions = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : null;
          const session = sessions?.find((item) => item.id === sessionId);
          if (!session) return;

          session.last_message = {
            sender: message.sender_type,
            content: message.content,
          };
          session.last_activity_at = message.created_at || message.updated_at;
          session.is_recently_active = true;
        },
      ),
    );
  });
}

function refreshRealtimeData(dispatch) {
  dispatch(
    apiSlice.util.invalidateTags([
      "notifications",
      "chat-sessions",
      "chat-session-details",
      "chat-messages",
      "chat-session-transfers",
    ]),
  );
}

function routeDashboardEvent(event, dispatch, store) {
  if (event?.type === "message.created" && event.session_id && event.data?.id) {
    upsertMessage(dispatch, store, event.session_id, event.data);
    updateConversationPreviews(dispatch, store, event.session_id, event.data);
    dispatch(apiSlice.util.invalidateTags(["chat-sessions"]));
    return;
  }

  if (
    event?.type?.startsWith(CHAT_SESSION_EVENT_PREFIX) ||
    event?.type?.startsWith(AI_EVENT_PREFIX)
  ) {
    dispatch(
      apiSlice.util.invalidateTags([
        "chat-sessions",
        "chat-session-details",
        "chat-session-transfers",
      ]),
    );
    return;
  }

  if (event?.event) {
    dispatch(apiSlice.util.invalidateTags(["notifications"]));
  }
}

export default function useDashboardSocket() {
  const dispatch = useDispatch();
  const store = useStore();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return undefined;

    const url = dashboardSocketUrl(accessToken);
    if (!url) return undefined;

    let socket;
    let reconnectTimer;
    let reconnectAttempt = 0;
    let disposed = false;

    const scheduleReconnect = () => {
      if (disposed || reconnectTimer) return;
      const baseDelay = Math.min(1000 * 2 ** reconnectAttempt, 30_000);
      const delay = baseDelay + Math.round(Math.random() * 500);
      reconnectAttempt += 1;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, delay);
    };

    const connect = () => {
      if (disposed || socket?.readyState === WebSocket.OPEN) return;
      socket = new WebSocket(url);

      socket.addEventListener("open", () => {
        reconnectAttempt = 0;
        refreshRealtimeData(dispatch);
      });

      socket.addEventListener("message", (rawEvent) => {
        try {
          routeDashboardEvent(JSON.parse(rawEvent.data), dispatch, store);
        } catch {
          // Ignore malformed or non-JSON events without interrupting the socket.
        }
      });

      socket.addEventListener("close", (closeEvent) => {
        socket = undefined;
        if (closeEvent.code !== 4401) scheduleReconnect();
      });
    };

    const reconnectWhenOnline = () => {
      if (!socket || socket.readyState === WebSocket.CLOSED) connect();
    };

    connect();
    window.addEventListener("online", reconnectWhenOnline);

    return () => {
      disposed = true;
      window.removeEventListener("online", reconnectWhenOnline);
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close(1000, "Dashboard unmounted");
    };
  }, [accessToken, dispatch, isAuthenticated, store]);
}
