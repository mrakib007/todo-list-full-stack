import { apiSlice } from './apiSlice'

export const mindMapApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMindMaps: builder.query({
      query: (search = '') => {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        return `/mindmaps?${params.toString()}`
      },
      providesTags: ['MindMap'],
    }),
    getMindMapById: builder.query({
      query: (id) => `/mindmaps/${id}`,
      providesTags: (result, error, id) => [{ type: 'MindMap', id }],
    }),
    createMindMap: builder.mutation({
      query: (mindMap) => ({
        url: '/mindmaps',
        method: 'POST',
        body: mindMap,
      }),
      invalidatesTags: ['MindMap'],
    }),
    updateMindMap: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/mindmaps/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'MindMap', id }, 'MindMap'],
    }),
    deleteMindMap: builder.mutation({
      query: (id) => ({
        url: `/mindmaps/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MindMap'],
    }),
  }),
})

export const {
  useGetMindMapsQuery,
  useGetMindMapByIdQuery,
  useCreateMindMapMutation,
  useUpdateMindMapMutation,
  useDeleteMindMapMutation,
} = mindMapApi

