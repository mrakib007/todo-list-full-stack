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
  }
};

module.exports = taskService;