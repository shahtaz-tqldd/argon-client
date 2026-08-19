import { apiSlice } from "../api/apiSlice";

export const workspaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspace: builder.query({
      query: () => {
        return {
          url: `/workspaces/`,
          method: "GET",
        };
      },
      providesTags: ["workspace"],
    }),

    updateWorkspace: builder.mutation({
      query: ({ workspaceSlug, payload }) => ({
        url: `/workspaces/${workspaceSlug}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["workspace"],
    }),

    inviteWorkspaceMember: builder.mutation({
      query: ({ workspaceSlug, email }) => ({
        url: `/workspaces/${workspaceSlug}/invitations/`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["workspace-invitations"],
    }),
  }),
});

export const {
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useInviteWorkspaceMemberMutation,
} = workspaceApiSlice;
