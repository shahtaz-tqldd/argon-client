import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import { apiSlice } from "@/features/api/apiSlice";

const SESSION_TRANSITION_EVENTS = new Set([
  "session.created",
  "session.taken_over",
  "session.released",
  "session.resolved",
  "session.closed",
  "session.reopened",
  "session.transfer_requested",
  "session.transferred",
  "session.transfer_declined",
  "session.transfer_cancelled",
]);
const AI_EVENT_PREFIX = "ai.response.";
const MESSAGE_ACK_TIMEOUT_MS = 15_000;

let activeSocket;
let dashboardReady = false;
let pendingMessage;
const sessionSubscriptions = new Map();

function dashboardSocketUrl(accessToken) {
  const configuredBase =
    import.meta.env.VITE_APP_SOCKET_URL || import.meta.env.VITE_APP_BASE_URL;
  if (!configuredBase) return null;

  const base = new URL(configuredBase, window.location.origin);
  const url = new URL("/ws/dashboard/", base.origin);
  if (url.protocol === "https:") url.protocol = "wss:";
  if (url.protocol === "http:") url.protocol = "ws:";
  url.searchParams.set("token", accessToken);
  return url.toString();
}

function sendCommand(command) {
  if (!dashboardReady || activeSocket?.readyState !== WebSocket.OPEN) {
    throw new Error("Live connection is not ready. Please try again.");
  }
  activeSocket.send(JSON.stringify(command));
}

export function subscribeDashboardSession(sessionId) {
  if (!sessionId) return () => {};

  const currentCount = sessionSubscriptions.get(sessionId) || 0;
  sessionSubscriptions.set(sessionId, currentCount + 1);
  if (currentCount === 0 && dashboardReady) {
    sendCommand({ type: "session.subscribe", session_id: sessionId });
  }

  return () => {
    const nextCount = (sessionSubscriptions.get(sessionId) || 1) - 1;
    if (nextCount > 0) {
      sessionSubscriptions.set(sessionId, nextCount);
      return;
    }

    sessionSubscriptions.delete(sessionId);
    if (dashboardReady) {
      sendCommand({ type: "session.unsubscribe", session_id: sessionId });
    }
  };
}

export function sendDashboardMessage(sessionId, content, metadata = {}) {
  const normalizedContent = content?.trim();
  if (!sessionId || !normalizedContent) {
    return Promise.reject(new Error("A session and message are required."));
  }
  if (normalizedContent.length > 10_000) {
    return Promise.reject(
      new Error("Messages cannot be longer than 10,000 characters."),
    );
  }
  if (pendingMessage) {
    return Promise.reject(
      new Error("Please wait for the previous message to be accepted."),
    );
  }

  return new Promise((resolve, reject) => {
    try {
      sendCommand({
        type: "message.send",
        session_id: sessionId,
        content: normalizedContent,
        metadata,
      });
    } catch (error) {
      reject(error);
      return;
    }

    const timeout = window.setTimeout(() => {
      if (pendingMessage?.sessionId !== sessionId) return;
      pendingMessage = undefined;
      reject(
        new Error(
          "The message was not acknowledged. Refresh the conversation before trying again.",
        ),
      );
    }, MESSAGE_ACK_TIMEOUT_MS);

    pendingMessage = { sessionId, resolve, reject, timeout };
  });
}

function settlePendingMessage(error, event) {
  if (!pendingMessage) return;
  window.clearTimeout(pendingMessage.timeout);
  const { resolve, reject } = pendingMessage;
  pendingMessage = undefined;
  if (error) reject(error);
  else resolve(event);
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

function notificationCollection(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.results)) return response.data.results;
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

function upsertNotification(dispatch, store, notification) {
  queryEntries(store, "notificationList").forEach(({ originalArgs }) => {
    dispatch(
      apiSlice.util.updateQueryData(
        "notificationList",
        originalArgs,
        (response) => {
          const notifications = notificationCollection(response);
          if (!notifications) return;

          const existingIndex = notifications.findIndex(
            (candidate) => candidate.id === notification.id,
          );
          if (existingIndex === -1) {
            notifications.unshift(notification);
            const pageSize = Number(originalArgs?.pageSize);
            if (pageSize > 0) notifications.splice(pageSize);
            if (response?.meta && !notification.is_read) {
              response.meta.unread_count =
                Number(response.meta.unread_count || 0) + 1;
            }
          } else {
            notifications[existingIndex] = notification;
          }
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
  if (event?.type === "message.accepted" && event.session_id) {
    if (pendingMessage?.sessionId === event.session_id) {
      settlePendingMessage(null, event);
    }
    return;
  }

  if (event?.type === "message.created" && event.session_id && event.data?.id) {
    upsertMessage(dispatch, store, event.session_id, event.data);
    updateConversationPreviews(dispatch, store, event.session_id, event.data);
    dispatch(apiSlice.util.invalidateTags(["chat-sessions"]));
    return;
  }

  if (event?.type === "notification.created" && event.data?.id) {
    upsertNotification(dispatch, store, event.data);
    return;
  }

  if (
    SESSION_TRANSITION_EVENTS.has(event?.type) ||
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

  if (event?.type === "error") {
    settlePendingMessage(
      new Error(event.message || "The live connection rejected the command."),
    );
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
    let heartbeatTimer;
    let reconnectTimer;
    let reconnectAttempt = 0;
    let hasConnected = false;
    let disposed = false;

    const clearHeartbeat = () => {
      if (heartbeatTimer) window.clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    };

    const scheduleReconnect = () => {
      if (disposed || reconnectTimer) return;
      const baseDelay = Math.min(1000 * 2 ** reconnectAttempt, 30_000);
      const jitter = Math.round(Math.random() * Math.min(baseDelay / 2, 1000));
      reconnectAttempt += 1;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, baseDelay + jitter);
    };

    const connect = () => {
      if (
        disposed ||
        socket?.readyState === WebSocket.OPEN ||
        socket?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const currentSocket = new WebSocket(url);
      socket = currentSocket;
      activeSocket = currentSocket;
      dashboardReady = false;

      currentSocket.addEventListener("message", (rawEvent) => {
        try {
          const event = JSON.parse(String(rawEvent.data));
          if (event?.type === "connection.ready") {
            dashboardReady = true;
            reconnectAttempt = 0;
            clearHeartbeat();

            const heartbeatSeconds = Number(
              event.data?.heartbeat_interval_seconds,
            );
            if (heartbeatSeconds > 0) {
              heartbeatTimer = window.setInterval(() => {
                if (currentSocket.readyState === WebSocket.OPEN) {
                  currentSocket.send(
                    JSON.stringify({ type: "presence.heartbeat" }),
                  );
                }
              }, heartbeatSeconds * 1000);
            }

            sessionSubscriptions.forEach((_count, sessionId) => {
              sendCommand({ type: "session.subscribe", session_id: sessionId });
            });
            if (hasConnected) refreshRealtimeData(dispatch);
            hasConnected = true;
          }

          routeDashboardEvent(event, dispatch, store);
        } catch {
          // Ignore malformed or non-JSON events without interrupting the socket.
        }
      });

      currentSocket.addEventListener("close", (closeEvent) => {
        clearHeartbeat();
        if (activeSocket === currentSocket) {
          activeSocket = undefined;
          dashboardReady = false;
        }
        if (socket === currentSocket) socket = undefined;
        settlePendingMessage(
          new Error(
            "The live connection closed. Refresh the conversation before retrying an unacknowledged message.",
          ),
        );

        if (closeEvent.code === 4401) {
          dispatch(
            apiSlice.endpoints.selfDetails.initiate(undefined, {
              forceRefetch: true,
              subscribe: false,
            }),
          );
          return;
        }
        if (closeEvent.code !== 1000) scheduleReconnect();
      });

      currentSocket.addEventListener("error", () => {
        // The close event owns retry scheduling and pending-command cleanup.
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
      clearHeartbeat();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (activeSocket === socket) {
        activeSocket = undefined;
        dashboardReady = false;
      }
      socket?.close(1000, "Dashboard unmounted");
    };
  }, [accessToken, dispatch, isAuthenticated, store]);
}
