import { apiSlice } from "../api/apiSlice";

export const chatSessionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // SESSIONS
    chatSessionList: builder.query({
      query: ({
        chatbotSlug,
        page = 1,
        pageSize = 20,
        status,
        channel,
        assignedTo,
        search,
      }) => ({
        url: "/chat-sessions/sessions/list/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          page,
          page_size: pageSize,
          ...(status && { status }),
          ...(channel && { channel }),
          ...(assignedTo && { assigned_to: assignedTo }),
          ...(search && { search }),
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    chatSessionDetail: builder.query({
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat-sessions/sessions/details/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
      }),
      providesTags: (_result, _error, { sessionId }) => [
        { type: "chat-session-details", id: sessionId },
      ],
    }),

    // MESSAGES
    chatMessageList: builder.query({
      query: ({ chatbotSlug, sessionId, page = 1, pageSize = 50 }) => ({
        url: "/chat-sessions/messages/list/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
          page,
          page_size: pageSize,
        },
      }),
      providesTags: (_result, _error, { sessionId }) => [
        { type: "chat-messages", id: sessionId },
      ],
    }),

    sendChatMessage: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat-sessions/messages/send/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-messages", id: sessionId },
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    // TAKEOVERS
    takeOverSession: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat-sessions/takeovers/take-over/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    reassignSession: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat-sessions/takeovers/reassign/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    releaseSession: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat-sessions/takeovers/release/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    resolveSession: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat-sessions/takeovers/resolve/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    reopenSession: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat-sessions/takeovers/reopen/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),
  }),
});

export const {
  // sessions
  useChatSessionListQuery,
  useLazyChatSessionListQuery,
  useChatSessionDetailQuery,
  useLazyChatSessionDetailQuery,

  // messages
  useChatMessageListQuery,
  useLazyChatMessageListQuery,
  useSendChatMessageMutation,

  // takeovers
  useTakeOverSessionMutation,
  useReassignSessionMutation,
  useReleaseSessionMutation,
  useResolveSessionMutation,
  useReopenSessionMutation,
} = chatSessionApiSlice;
