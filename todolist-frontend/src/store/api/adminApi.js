import { apiSlice } from './apiSlice'

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['User', 'Stats'],
    }),
    getAdminStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
  }),
})

export const {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useGetAdminStatsQuery,
} = adminApi

