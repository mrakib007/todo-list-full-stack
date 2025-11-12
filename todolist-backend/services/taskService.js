const taskModel = require('../models/taskModel');

const taskService = {
  // Create new task
  createTask: async (userId, title, description, priority) => {
    if (!title || title.trim() === '') {
      throw new Error('Task title is required');
    }
    
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      throw new Error('Invalid priority. Must be: low, medium, high, or urgent');
    }

    return await taskModel.create(userId, title.trim(), description?.trim(), priority);
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
    const { title, description, priority, status } = updates;
    
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

    const cleanUpdates = {
      title: title?.trim(),
      description: description?.trim(),
      priority,
      status
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
    const { status, priority, sortBy, sortOrder } = filters;

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

    return await taskModel.findWithFilters(userId, { status, priority, sortBy, sortOrder });
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
  }
};

module.exports = taskService;