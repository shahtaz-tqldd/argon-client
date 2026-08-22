import { apiSlice } from "../api/apiSlice";

export const chatbotApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    chatbotList: builder.query({
      query: () => {
        return {
          url: `/chatbots/list/`,
          method: "GET",
        };
      },
      providesTags: ["chatbots"],
    }),

    chatbotDetails: builder.query({
      query: ({ chatbotSlug }) => {
        return {
          url: `/chatbots/details/?chatbot=${chatbotSlug}`,
          method: "GET",
        };
      },
      providesTags: ["chatbot-details"],
    }),

    chatbotShortDetails: builder.query({
      query: ({ chatbotSlug }) => {
        return {
          url: `/chatbots/short-details/?chatbot=${chatbotSlug}`,
          method: "GET",
        };
      },
      providesTags: ["chatbot-short-details"],
    }),

    createChatbot: builder.mutation({
      query: ({ payload }) => ({
        url: `/chatbots/create/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["chatbots"],
    }),

    updateChatbot: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: `/chatbots/update/?chatbot=${chatbotSlug}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["chatbots"],
    }),

    deleteChatbot: builder.mutation({
      query: ({ chatbotSlug }) => ({
        url: `/chatbots/delete/?chatbot=${chatbotSlug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["chatbots"],
    }),

    // chatbot members
    chatbotMemberList: builder.query({
      query: ({ chatbotSlug, page = 1, pageSize = 20 }) => {
        return {
          url: `/chatbots/team/list/`,
          method: "GET",
          params: {
            chatbot: chatbotSlug,
            page,
            page_size: pageSize,
          },
        };
      },
      providesTags: ["chatbot-team"],
    }),

    chatbotMemberDetails: builder.query({
      query: ({ chatbotSlug, memberEmail }) => {
        return {
          url: `/chatbots/team/details?chatbot=${chatbotSlug}&member_email=${memberEmail}`,
          method: "GET",
        };
      },
      providesTags: ["chatbot-team-member-details"],
    }),

    inviteChatbotMember: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: `/chatbots/team/invite/?chatbot=${chatbotSlug}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["chatbot-team"],
    }),

    acceptChatbotInvite: builder.mutation({
      query: (payload) => ({
        url: "/chatbots/team/accept-invite/",
        method: "POST",
        body: payload,
      }),
    }),

    removeChatbotMember: builder.mutation({
      query: ({ chatbotSlug, memberEmail }) => ({
        url: `/chatbots/team/remove-member?chatbot=${chatbotSlug}&member_email=${memberEmail}`,
        method: "DELETE",
      }),
      invalidatesTags: ["chatbot-team"],
    }),
  }),
});

export const {
  useChatbotListQuery,
  useChatbotDetailsQuery,
  useChatbotShortDetailsQuery,
  useCreateChatbotMutation,
  useUpdateChatbotMutation,
  useDeleteChatbotMutation,

  // chatbot members
  useChatbotMemberListQuery,
  useChatbotMemberDetailsQuery,
  useInviteChatbotMemberMutation,
  useAcceptChatbotInviteMutation,
  useRemoveChatbotMemberMutation,
} = chatbotApiSlice;
