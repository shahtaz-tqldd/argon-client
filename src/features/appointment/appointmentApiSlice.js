import { apiSlice } from "../api/apiSlice";

export const appointmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // config
    appointmentBookingConfig: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/appointments/config/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
      providesTags: ["appointment-booking-config"],
    }),

    updateAppointmentBookingConfig: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: "/appointments/config/update/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
        },
        body: payload,
      }),
      invalidatesTags: ["appointment-booking-config"],
    }),

    // schedules
    appointmentBookingSchedules: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/appointments/schedules/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
      providesTags: ["appointment-booking-schedules"],
    }),

    updateAppointmentBookingSchedules: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: "/appointments/schedules/update/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
        },
        body: payload,
      }),
      invalidatesTags: ["appointment-booking-schedules"],
    }),

    // appointments
    appointmentList: builder.query({
      query: ({ chatbotSlug, page = 1, pageSize = 20 }) => ({
        url: "/appointments/appointments/list/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
          page,
          page_size: pageSize,
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "appointments", id: chatbotSlug },
      ],
    }),

    appointmentStats: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/appointments/appointments/stats/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
      providesTags: (_result, _error, { chatbotSlug }) => [
        { type: "appointment-stats", id: chatbotSlug },
      ],
    }),

    updateAppointment: builder.mutation({
      query: ({ chatbotSlug, appointmentId, payload }) => ({
        url: "/appointments/appointments/update/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
          appointment_id: appointmentId, // assuming you might need an ID to update
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "appointments", id: chatbotSlug },
        { type: "appointment-stats", id: chatbotSlug },
      ],
    }),

    deleteAppointment: builder.mutation({
      query: ({ chatbotSlug, appointmentId }) => ({
        url: "/appointments/appointments/delete/",
        method: "DELETE",
        params: {
          chatbot_slug: chatbotSlug,
          appointment_id: appointmentId, // assuming you need an ID to delete
        },
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "appointments", id: chatbotSlug },
      ],
    }),
  }),
});

export const {
  // config
  useAppointmentBookingConfigQuery,
  useUpdateAppointmentBookingConfigMutation,

  // schedules
  useAppointmentBookingSchedulesQuery,
  useUpdateAppointmentBookingSchedulesMutation,

  // appointments
  useAppointmentListQuery,
  useAppointmentStatsQuery,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} = appointmentApiSlice;
