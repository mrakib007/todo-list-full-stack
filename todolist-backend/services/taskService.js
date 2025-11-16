const taskModel = require('../models/taskModel');

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

    // Validate due date if provided
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        throw new Error('Invalid due date format');
      }
    }

    return await taskModel.create(userId, title.trim(), description?.trim(), priority, dueDate);
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
        const dueDateObj = new Date(dueDate);
        if (isNaN(dueDateObj.getTime())) {
          throw new Error('Invalid due date format');
        }
        dueDate = dueDateObj.toISOString();
      }
    }

    const cleanUpdates = {
      title: title?.trim(),
      description: description?.trim(),
      priority,
      status,
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