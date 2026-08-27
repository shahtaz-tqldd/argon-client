import { apiSlice } from "../api/apiSlice";

export const knowledgeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadKnowledge: builder.mutation({
      query: ({ chatbotSlug, type, payload }) => ({
        url: "/knowledge/upload/",
        method: "POST",
        params: { chatbot: chatbotSlug, type },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "knowledge", id: chatbotSlug },
        { type: "knowledge-usage", id: chatbotSlug },
        { type: "knowledge-training-logs", id: chatbotSlug },
      ],
    }),

    knowledgeList: builder.query({
      query: ({ chatbotSlug, page = 1, pageSize = 10 }) => ({
        url: "/knowledge/list/",
        method: "GET",
        params: {
          chatbot: chatbotSlug,
          page,
          page_size: pageSize,
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "knowledge", id: chatbotSlug },
      ],
    }),

    knowledgeDetails: builder.query({
      query: ({ knowledgeBaseId }) => ({
        url: "/knowledge/details/",
        method: "GET",
        params: { knowledge_base_id: knowledgeBaseId },
      }),
      providesTags: (_result, _error, { knowledgeBaseId }) => [
        { type: "knowledge-details", id: knowledgeBaseId },
      ],
    }),

    knowledgeUsage: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/knowledge/usage/",
        method: "GET",
        params: { chatbot: chatbotSlug },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "knowledge-usage", id: chatbotSlug },
      ],
    }),

    updateKnowledge: builder.mutation({
      query: ({ knowledgeBaseId, type, payload }) => ({
        url: "/knowledge/update/",
        method: "PATCH",
        params: { knowledge_base_id: knowledgeBaseId, type },
        ...(payload === undefined ? {} : { body: payload }),
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, knowledgeBaseId }) => [
        { type: "knowledge", id: chatbotSlug },
        { type: "knowledge-details", id: knowledgeBaseId },
        { type: "knowledge-usage", id: chatbotSlug },
        { type: "knowledge-training-logs", id: chatbotSlug },
      ],
    }),

    deleteKnowledge: builder.mutation({
      query: ({ knowledgeBaseId }) => ({
        url: "/knowledge/delete/",
        method: "DELETE",
        params: { knowledge_base_id: knowledgeBaseId },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, knowledgeBaseId }) => [
        { type: "knowledge", id: chatbotSlug },
        { type: "knowledge-details", id: knowledgeBaseId },
        { type: "knowledge-usage", id: chatbotSlug },
        { type: "knowledge-training-logs", id: chatbotSlug },
      ],
    }),

    knowledgeTrainingLogs: builder.query({
      query: ({ chatbotSlug, page = 1, pageSize = 10 }) => ({
        url: "/knowledge/training-logs/",
        method: "GET",
        params: {
          chatbot: chatbotSlug,
          page,
          page_size: pageSize,
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "knowledge-training-logs", id: chatbotSlug },
      ],
    }),
  }),
});

export const {
  useUploadKnowledgeMutation,
  useKnowledgeListQuery,
  useKnowledgeDetailsQuery,
  useKnowledgeUsageQuery,
  useLazyKnowledgeDetailsQuery,
  useUpdateKnowledgeMutation,
  useDeleteKnowledgeMutation,
  useKnowledgeTrainingLogsQuery,
} = knowledgeApiSlice;
