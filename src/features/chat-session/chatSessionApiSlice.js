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

    chatSessionMarkRead: builder.mutation({
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat-sessions/sessions/mark-read/",
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
      query: ({ chatbotSlug, sessionId }) => ({
        url: "/chat-sessions/takeovers/take-over/",
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
        url: "/chat-sessions/takeovers/release/",
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
        url: "/chat-sessions/transfers/request/",
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
        url: "/chat-sessions/transfers/incoming/",
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
        url: "/chat-sessions/transfers/accept/",
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
        url: "/chat-sessions/transfers/decline/",
        method: "POST",
        params: { chatbot_slug: chatbotSlug, transfer_id: transferId },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "chat-session-transfers", id: chatbotSlug },
      ],
    }),

    cancelSessionTransfer: builder.mutation({
      query: ({ chatbotSlug, transferId }) => ({
        url: "/chat-sessions/transfers/cancel/",
        method: "POST",
        params: { chatbot_slug: chatbotSlug, transfer_id: transferId },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "chat-session-transfers", id: chatbotSlug },
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
  useChatSessionMarkReadMutation,

  // messages
  useChatMessageListQuery,
  useLazyChatMessageListQuery,
  useSendChatMessageMutation,

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

} = chatSessionApiSlice;
