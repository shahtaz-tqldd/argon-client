import { apiSlice } from "../api/apiSlice";

export const leadCaptureApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // LEAD CONFIG
    leadCaptureConfigure: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/lead-captures/config/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
      providesTags: ["lead-config"],
    }),

    updateLeadCaptureConfig: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: "/lead-captures/config/update/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
        },
        body: payload,
      }),
      invalidatesTags: ["lead-config"],
    }),

    // LEADS
    capturedLeadList: builder.query({
      query: ({ chatbotSlug, page = 1, pageSize = 20 }) => ({
        url: "/lead-captures/leads/list/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          page,
          page_size: pageSize,
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "leads", id: chatbotSlug },
      ],
    }),

    capturedLeadDetail: builder.query({
      query: ({ chatbotSlug, leadId }) => ({
        url: "/lead-captures/leads/details/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          lead_id: leadId,
        },
      }),
      providesTags: (_result, _error, { leadId }) => [
        { type: "lead-details", id: leadId },
      ],
    }),

    updateCapturedLead: builder.mutation({
      query: ({ chatbotSlug, leadId, payload }) => ({
        url: "/lead-captures/leads/update/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
          lead_id: leadId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, leadId }) => [
        { type: "leads", id: chatbotSlug },
        { type: "lead-details", id: leadId },
      ],
    }),

    // LEAD NOTES
    leadNoteList: builder.query({
      query: ({ chatbotSlug, leadId, page = 1, pageSize = 20 }) => ({
        url: "/lead-captures/notes/list/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          lead_id: leadId,
          page,
          page_size: pageSize,
        },
      }),
      providesTags: (_result, _error, { leadId }) => [
        { type: "lead-notes", id: leadId },
      ],
    }),

    createLeadNote: builder.mutation({
      query: ({ chatbotSlug, leadId, payload }) => ({
        url: "/lead-captures/notes/create/",
        method: "POST",
        params: {
          chatbot_slug: chatbotSlug,
          lead_id: leadId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, leadId }) => [
        { type: "lead-notes", id: leadId },
        { type: "leads", id: chatbotSlug },
      ],
    }),

    leadNoteDetail: builder.query({
      query: ({ chatbotSlug, leadId, noteId }) => ({
        url: "/lead-captures/notes/details/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          lead_id: leadId,
          note_id: noteId,
        },
      }),
      providesTags: (_result, _error, { noteId }) => [
        { type: "lead-note-details", id: noteId },
      ],
    }),

    updateLeadNote: builder.mutation({
      query: ({ chatbotSlug, leadId, noteId, payload }) => ({
        url: "/lead-captures/notes/update/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
          lead_id: leadId,
          note_id: noteId,
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { leadId, noteId }) => [
        { type: "lead-notes", id: leadId },
        { type: "lead-note-details", id: noteId },
      ],
    }),

    deleteLeadNote: builder.mutation({
      query: ({ chatbotSlug, noteId, leadId }) => ({
        url: "/lead-captures/notes/delete/",
        method: "DELETE",
        params: {
          chatbot_slug: chatbotSlug,
          lead_id: leadId,
          note_id: noteId,
        },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug, leadId, noteId }) => [
        { type: "lead-notes", id: leadId },
        { type: "lead-note-details", id: noteId },
        { type: "leads", id: chatbotSlug },
      ],
    }),
  }),
});

export const {
  // config
  useLeadCaptureConfigureQuery,
  useUpdateLeadCaptureConfigMutation,

  // leads
  useCapturedLeadListQuery,
  useCapturedLeadDetailQuery,
  useUpdateCapturedLeadMutation,

  // lead notes
  useLeadNoteListQuery,
  useCreateLeadNoteMutation,
  useLeadNoteDetailQuery,
  useUpdateLeadNoteMutation,
  useDeleteLeadNoteMutation,
} = leadCaptureApiSlice;
