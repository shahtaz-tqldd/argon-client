import { apiSlice } from "../api/apiSlice";

export const appointmentBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // config
    appointmentBookingConfig: builder.query({
      query: ({ chatbotSlug }) => ({
        url: "/appointment-bookings/config/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
      providesTags: ["appointment-booking-config"],
    }),

    updateAppointmentBookingConfig: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: "/appointment-bookings/config/update/",
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
        url: "/appointment-bookings/schedules/",
        method: "GET",
        params: {
          chatbot_slug: chatbotSlug,
        },
      }),
      providesTags: ["appointment-booking-schedules"],
    }),

    updateAppointmentBookingSchedules: builder.mutation({
      query: ({ chatbotSlug, payload }) => ({
        url: "/appointment-bookings/schedules/update/",
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
        url: "/appointment-bookings/appointments/list/",
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

    updateAppointment: builder.mutation({
      query: ({ chatbotSlug, appointmentId, payload }) => ({
        url: "/appointment-bookings/appointments/update/",
        method: "PATCH",
        params: {
          chatbot_slug: chatbotSlug,
          appointment_id: appointmentId, // assuming you might need an ID to update
        },
        body: payload,
      }),
      invalidatesTags: (_result, _error, { chatbotSlug }) => [
        { type: "appointments", id: chatbotSlug },
      ],
    }),

    deleteAppointment: builder.mutation({
      query: ({ chatbotSlug, appointmentId }) => ({
        url: "/appointment-bookings/appointments/delete/",
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
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} = appointmentBookingApiSlice;
