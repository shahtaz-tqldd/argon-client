import { apiSlice } from "../api/apiSlice";

export const chatbotApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    chatbotList: builder.query({
      query: () => {
        return {
          url: `/chatbots/`,
          method: "GET",
        };
      },
      providesTags: ["chatbots"],
    }),

    createChatbot: builder.mutation({
      query: ({ payload }) => ({
        url: `/chatbots/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["chatbots"],
    }),

    updateChatbot: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: `/chatbots/${chatbotSlug}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["chatbots"],
    }),

    inviteChatbotMember: builder.mutation({
      query: ({ chatbotSlug, email }) => ({
        url: `/chatbots/${chatbotSlug}/invitations/`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["chatbot-invitations"],
    }),
  }),
});

export const {
  useChatbotListQuery,
  useCreateChatbotMutation,
  useUpdateChatbotMutation,
  useInviteChatbotMemberMutation,
} = chatbotApiSlice;
