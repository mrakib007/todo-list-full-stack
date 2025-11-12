import { apiSlice } from './apiSlice'

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation({
      query: (updates) => ({
        url: '/users/profile',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (passwords) => ({
        url: '/users/password',
        method: 'PUT',
        body: passwords,
      }),
    }),
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
  }),
})

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetAllUsersQuery,
} = userApi

