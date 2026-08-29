// lead-captures
import { apiSlice } from "../api/apiSlice";

export const leadCaptureApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const { useLeadCaptureConfigureQuery } = leadCaptureApiSlice;

// Keep the existing public hook name while using mutation semantics for PATCH.
export const useUpdateLeadCaptureConfigQuery =
  leadCaptureApiSlice.endpoints.updateLeadCaptureConfig.useMutation;
