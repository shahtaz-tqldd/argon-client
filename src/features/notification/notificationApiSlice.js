import { apiSlice } from "../api/apiSlice";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    notificationList: builder.query({
      query: ({ pageSize = 8 } = {}) => ({
        url: "/notifications/",
        method: "GET",
        params: { page_size: pageSize },
      }),
      providesTags: ["notifications"],
    }),

    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read/`,
        method: "PATCH",
      }),
      invalidatesTags: ["notifications"],
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all/",
        method: "PATCH",
      }),
      invalidatesTags: ["notifications"],
    }),
  }),
});

export const {
  useNotificationListQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApiSlice;
