import { apiSlice } from "../api/apiSlice";

export const vectorStoreApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    recordList: builder.query({
      query: ({
        page = 1,
        page_size = 10,
        source_type = "",
        destination_id = "",
        source_id = "",
      }) => {
        return {
          url: "/admin/vector-store/records/",
          method: "GET",
          params: {
            page,
            page_size,
            ...(source_type && { source_type }),
            ...(destination_id && { destination_id }),
            ...(source_id && { source_id }),
          },
        };
      },
      providesTags: ["record-list"],
    }),

    searchRecord: builder.query({
      query: ({
        query,
        source_type = null,
        destination_id = null,
        limit = 10,
      }) => {
        return {
          url: "/admin/vector-store/search/",
          method: "GET",
          params: {
            query,
            limit,
            ...(destination_id && { destination_id }),
            ...(source_type && { source_type }),
          },
        };
      },
      providesTags: ["record-list"],
    }),

    deleteRecord: builder.mutation({
      query: ({ recordId }) => {
        return {
          url: `/admin/vector-store/records/${recordId}/delete/`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["record-list"],
    }),

    deleteBulkRecord: builder.mutation({
      query: ({ payload, ids }) => {
        return {
          url: `/admin/vector-store/records/bulk-delete/`,
          method: "POST",
          body: payload || { ids },
        };
      },
      invalidatesTags: ["record-list"],
    }),
  }),
});

export const {
  useRecordListQuery,
  useSearchRecordQuery,
  useDeleteRecordMutation,
  useDeleteBulkRecordMutation,
} = vectorStoreApiSlice;
