import { apiSlice } from './apiSlice'

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: ({ status, priority, dueDate, overdue, sortBy, sortOrder } = {}) => {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        if (priority) params.append('priority', priority)
        if (dueDate) params.append('dueDate', dueDate)
        if (overdue) params.append('overdue', overdue)
        if (sortBy) params.append('sortBy', sortBy)
        if (sortOrder) params.append('sortOrder', sortOrder)
        return `/tasks?${params.toString()}`
      },
      providesTags: ['Task'],
    }),
    getTaskById: builder.query({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Task', 'Stats'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }, 'Task', 'Stats'],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Stats'],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }, 'Task', 'Stats'],
    }),
    searchTasks: builder.query({
      query: (query) => `/tasks/search?q=${encodeURIComponent(query)}`,
      providesTags: ['Task'],
    }),
    getTaskStats: builder.query({
      query: () => '/tasks/stats',
      providesTags: ['Stats'],
    }),
    bulkDeleteTasks: builder.mutation({
      query: (taskIds) => ({
        url: '/tasks/bulk',
        method: 'DELETE',
        body: { taskIds },
      }),
      invalidatesTags: ['Task', 'Stats'],
    }),
    bulkUpdateTaskStatus: builder.mutation({
      query: ({ taskIds, status }) => ({
        url: '/tasks/bulk/status',
        method: 'PATCH',
        body: { taskIds, status },
      }),
      invalidatesTags: ['Task', 'Stats'],
    }),
    getOverdueTasks: builder.query({
      query: () => '/tasks/overdue',
      providesTags: ['Task'],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchTasksQuery,
  useGetTaskStatsQuery,
  useBulkDeleteTasksMutation,
  useBulkUpdateTaskStatusMutation,
  useGetOverdueTasksQuery,
} = taskApi

