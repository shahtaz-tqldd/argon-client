import { apiSlice } from "../api/apiSlice";

export const workspaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    workspaceList: builder.query({
      query: ({ page = 1, pageSize = 20 }) => {
        return {
          url: `/workspaces/list/`,
          method: "GET",
          params: {
            page,
            page_size: pageSize,
          },
        };
      },
    }),

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

    // team
    workspaceMemberList: builder.query({
      query: ({ workspaceSlug }) => ({
        url: `/workspaces/team/member-list?workspace=${workspaceSlug}`,
        method: "GET",
      }),
      providesTags: ["workspace-team"],
    }),

    inviteWorkspaceMember: builder.mutation({
      query: ({ workspaceSlug, email }) => ({
        url: `/workspaces/team/invite/?workspace=${workspaceSlug}`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["workspace-team"],
    }),

    acceptWorkspaceInvitation: builder.mutation({
      query: (payload) => ({
        url: "/workspaces/team/accept-invite/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["workspace", "workspace-team"],
    }),
  }),
});

export const {
  useWorkspaceListQuery,
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,

  // team
  useWorkspaceMemberListQuery,
  useInviteWorkspaceMemberMutation,
  useAcceptWorkspaceInvitationMutation,
} = workspaceApiSlice;
