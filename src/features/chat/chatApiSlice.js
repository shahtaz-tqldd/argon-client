import { apiSlice } from "../api/apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // SESSIONS
    chatSessionList: builder.query({
      query: ({
        chatbotSlug,
        page = 1,
        pageSize = 20,
        status,
        is_recently_active,
        requires_attention,
        is_resolved,
        channel,
        assignedTo,
        search,
      }) => ({
        url: "/chat/sessions/list/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          page,
          page_size: pageSize,
          ...(status && { status }),
          ...(channel && { channel }),
          ...(assignedTo && { assigned_to: assignedTo }),
          ...(search && { search }),
          ...(is_recently_active && { is_recently_active }),
          ...(requires_attention && { requires_attention }),
          ...(is_resolved && { is_resolved }),
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    chatSessionDetail: builder.query({
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat/sessions/details/",
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

    chatSessionMarkRead: builder.mutation({
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat/sessions/mark-read/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
      }),
      invalidatesTags: (_result, error, { chatbotSlug, sessionId }) =>
        error
          ? []
          : [
              { type: "chat-session-details", id: sessionId },
              { type: "chat-sessions", id: chatbotSlug },
            ],
    }),

    deleteChatSession: builder.mutation({
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat/sessions/delete/",
        method: "DELETE",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
      }),
      invalidatesTags: (_result, error, { chatbotSlug, sessionId }) =>
        error
          ? []
          : [
              { type: "chat-session-details", id: sessionId },
              { type: "chat-sessions", id: chatbotSlug },
            ],
    }),

    // MESSAGES
    chatMessageList: builder.query({
      query: ({ chatbotSlug, sessionId, page = 1, pageSize = 50 }) => ({
        url: "/chat/messages/list/",
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

    // TAKEOVERS
    takeOverSession: builder.mutation({
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat/takeovers/take-over/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    releaseSession: builder.mutation({
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat/takeovers/release/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          session_id: sessionId,
        },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, sessionId }) => [
        { type: "chat-session-details", id: sessionId },
        { type: "chat-sessions", id: chatbotSlug },
      ],
    }),

    // TRANSFERS
    requestSessionTransfer: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat/transfers/request/",
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
        { type: "chat-session-transfers", id: chatbotSlug },
      ],
    }),

    incomingSessionTransfers: builder.query({
      query: ({ chatbotSlug, status, page = 1, pageSize = 20 }) => ({
        url: "/chat/transfers/incoming/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          page,
          page_size: pageSize,
          ...(status && { status }),
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "chat-session-transfers", id: chatbotSlug },
      ],
    }),

    acceptSessionTransfer: builder.mutation({
      query: ({ chatbotSlug, transferId }) => ({
        url: "/chat/transfers/accept/",
        method: "POST",
        params: { chatbot_slug: chatbotSlug, transfer_id: transferId },
      }),
      invalidatesTags: (result, _error, { chatbotSlug }) => [
        { type: "chat-sessions", id: chatbotSlug },
        { type: "chat-session-transfers", id: chatbotSlug },
        ...(result?.data?.chat_session_id
          ? [
              {
                type: "chat-session-details",
                id: result.data.chat_session_id,
              },
            ]
          : []),
      ],
    }),

    declineSessionTransfer: builder.mutation({
      query: ({ chatbotSlug, transferId }) => ({
        url: "/chat/transfers/decline/",
        method: "POST",
        params: { chatbot_slug: chatbotSlug, transfer_id: transferId },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "chat-session-transfers", id: chatbotSlug },
      ],
    }),

    cancelSessionTransfer: builder.mutation({
      query: ({ chatbotSlug, transferId }) => ({
        url: "/chat/transfers/cancel/",
        method: "POST",
        params: { chatbot_slug: chatbotSlug, transfer_id: transferId },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "chat-session-transfers", id: chatbotSlug },
      ],
    }),

    resolveSession: builder.mutation({
      query: ({ chatbotSlug, sessionId, payload }) => ({
        url: "/chat/takeovers/resolve/",
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
        url: "/chat/takeovers/reopen/",
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

    // stats
    chatSessionStats: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/chat/analytics/stats/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
    }),

    chatSessionOverview: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/chat/analytics/overview/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
    }),
  }),
});

export const {
  // sessions
  useChatSessionListQuery,
  useChatSessionDetailQuery,
  useChatSessionMarkReadMutation,
  useDeleteChatSessionMutation,

  // messages
  useChatMessageListQuery,
  useLazyChatMessageListQuery,

  // takeovers
  useTakeOverSessionMutation,
  useReleaseSessionMutation,
  useRequestSessionTransferMutation,
  useIncomingSessionTransfersQuery,
  useLazyIncomingSessionTransfersQuery,
  useAcceptSessionTransferMutation,
  useDeclineSessionTransferMutation,
  useCancelSessionTransferMutation,
  useResolveSessionMutation,
  useReopenSessionMutation,

  // stats
  useChatSessionOverviewQuery,
  useChatSessionStatsQuery,
} = chatApiSlice;
