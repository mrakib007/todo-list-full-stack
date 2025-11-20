const taskModel = require('../models/taskModel');

const formatDueDateForDatabase = (value) => {
  if (!value) return null

  // If it's a string, try to match ISO/local timestamp (with T or space)
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(:(\d{2}))?$/)
    if (match) {
      const year = match[1]
      const month = match[2]
      const day = match[3]
      const hours = match[4]
      const minutes = match[5]
      const seconds = match[7] || '00'
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }

  // Otherwise, try to parse as Date
  const dateObj = new Date(value)
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid due date format')
  }

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const taskService = {
  // Create new task
  createTask: async (userId, title, description, priority, dueDate = null) => {
    if (!title || title.trim() === '') {
      throw new Error('Task title is required');
    }
    
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      throw new Error('Invalid priority. Must be: low, medium, high, or urgent');
    }

    let formattedDueDate = null
    if (dueDate) {
      formattedDueDate = formatDueDateForDatabase(dueDate)
    }

    return await taskModel.create(userId, title.trim(), description?.trim(), priority, formattedDueDate);
  },

  // Get all tasks for user
  getUserTasks: async (userId, status) => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be: pending, in_progress, completed, or cancelled');
    }

    return await taskModel.findByUserId(userId, status);
  },

  // Get single task
  getTaskById: async (taskId, userId) => {
    const task = await taskModel.findByIdAndUserId(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  },

  // Update task
  updateTask: async (taskId, userId, updates) => {
    const { title, description, priority, status, due_date } = updates;
    
    if (title !== undefined && title.trim() === '') {
      throw new Error('Task title cannot be empty');
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      throw new Error('Invalid priority. Must be: low, medium, high, or urgent');
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be: pending, in_progress, completed, or cancelled');
    }

    // Validate due date if provided
    let dueDate = due_date;
    if (dueDate !== undefined && dueDate !== null) {
      if (dueDate === '' || dueDate === null) {
        dueDate = null; // Allow clearing due date
      } else {
        dueDate = formatDueDateForDatabase(dueDate)
      }
    }

    const cleanUpdates = {
      title: title?.trim(),
      description: description !== undefined ? (description?.trim() || '') : undefined,
      priority: priority !== undefined ? priority : undefined,
      status: status !== undefined ? status : undefined,
      due_date: dueDate
    };

    const updatedTask = await taskModel.update(taskId, userId, cleanUpdates);
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    return updatedTask;
  },

  // Delete task
  deleteTask: async (taskId, userId) => {
    const deletedTask = await taskModel.delete(taskId, userId);
    if (!deletedTask) {
      throw new Error('Task not found');
    }
    return deletedTask;
  },

  // Update task status only
  updateTaskStatus: async (taskId, userId, status) => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be: pending, in_progress, completed, or cancelled');
    }

    const updatedTask = await taskModel.updateStatus(taskId, userId, status);
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    return updatedTask;
  },

  // Get task statistics
  getTaskStatistics: async (userId) => {
    return await taskModel.getTaskStatistics(userId);
  },

  // Search tasks
  searchTasks: async (userId, searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
      throw new Error('Search query is required');
    }
    return await taskModel.searchTasks(userId, searchQuery.trim());
  },

  // Get tasks with filters and sorting
  getTasksWithFilters: async (userId, filters) => {
    const { status, priority, dueDate, overdue, sortBy, sortOrder } = filters;

    if (status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be: pending, in_progress, completed, or cancelled');
      }
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        throw new Error('Invalid priority. Must be: low, medium, high, or urgent');
      }
    }

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        throw new Error('Invalid due date format');
      }
    }

    return await taskModel.findWithFilters(userId, { status, priority, dueDate, overdue, sortBy, sortOrder });
  },

  // Bulk delete tasks
  bulkDeleteTasks: async (userId, taskIds) => {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error('Task IDs array is required and must not be empty');
    }

    // Validate all IDs are numbers
    const validIds = taskIds.filter(id => Number.isInteger(Number(id)));
    if (validIds.length === 0) {
      throw new Error('No valid task IDs provided');
    }

    return await taskModel.bulkDelete(userId, validIds);
  },

  // Bulk update task status
  bulkUpdateTaskStatus: async (userId, taskIds, status) => {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw new Error('Task IDs array is required and must not be empty');
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be: pending, in_progress, completed, or cancelled');
    }

    // Validate all IDs are numbers
    const validIds = taskIds.filter(id => Number.isInteger(Number(id)));
    if (validIds.length === 0) {
      throw new Error('No valid task IDs provided');
    }

    return await taskModel.bulkUpdateStatus(userId, validIds, status);
  },

  // Get overdue tasks
  getOverdueTasks: async (userId) => {
    return await taskModel.getOverdueTasks(userId);
  }
};

module.exports = taskService;