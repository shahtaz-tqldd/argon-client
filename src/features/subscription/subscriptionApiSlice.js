import { apiSlice } from "../api/apiSlice";

const subscriptionTag = (chatbotSlug) => [
  { type: "subscription", id: chatbotSlug },
];

export const subscriptionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    planList: builder.query({
      query: () => ({
        url: "/subscriptions/plans/",
        method: "GET",
      }),
    }),

    planDetails: builder.query({
      query: ({ planSlug }) => ({
        url: "/subscriptions/plans/details/",
        method: "GET",
        params: { plan: planSlug },
      }),
    }),

    currentSubscription: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/subscriptions/current/",
        method: "GET",
        params: { chatbot: chatbotSlug },
      }),
      providesTags: (_result, _error, { chatbotSlug }) =>
        subscriptionTag(chatbotSlug),
    }),

    subscriptionPayments: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/subscriptions/payments/",
        method: "GET",
        params: { chatbot: chatbotSlug },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "subscription-payments", id: chatbotSlug },
      ],
    }),

    createSubscriptionCheckout: builder.mutation({
      query: ({ chatbotSlug, planPriceId }) => ({
        url: "/subscriptions/checkout/",
        method: "POST",
        params: { chatbot: chatbotSlug },
        body: { plan_price_id: planPriceId },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) =>
        subscriptionTag(chatbotSlug),
    }),

    activateFreeSubscription: builder.mutation({
      query: ({ chatbotSlug, planPriceId }) => ({
        url: "/subscriptions/activate-free/",
        method: "POST",
        params: { chatbot: chatbotSlug },
        body: { plan_price_id: planPriceId },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        ...subscriptionTag(chatbotSlug),
        { type: "subscription-payments", id: chatbotSlug },
      ],
    }),

    createBillingPortal: builder.mutation({
      query: ({ chatbotSlug }) => ({
        url: "/subscriptions/billing-portal/",
        method: "POST",
        params: { chatbot: chatbotSlug },
      }),
    }),

    updateSubscriptionCancellation: builder.mutation({
      query: ({ chatbotSlug, cancelAtPeriodEnd }) => ({
        url: "/subscriptions/cancellation/",
        method: "POST",
        params: { chatbot: chatbotSlug },
        body: { cancel_at_period_end: cancelAtPeriodEnd },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) =>
        subscriptionTag(chatbotSlug),
    }),
  }),
});

export const {
  usePlanListQuery,
  usePlanDetailsQuery,
  useCurrentSubscriptionQuery,
  useSubscriptionPaymentsQuery,
  useCreateSubscriptionCheckoutMutation,
  useActivateFreeSubscriptionMutation,
  useCreateBillingPortalMutation,
  useUpdateSubscriptionCancellationMutation,
} = subscriptionApiSlice;
