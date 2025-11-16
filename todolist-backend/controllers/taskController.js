const taskService = require('../services/taskService');
const { validationResult } = require('express-validator');

const taskController = {
  // Create new task
  createTask: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const userId = req.user.id; // Assuming user is attached to req by auth middleware
      const { title, description, priority, due_date } = req.body;

      const newTask = await taskService.createTask(userId, title, description, priority, due_date);
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get all tasks for user 
  getTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, priority, dueDate, overdue, sortBy, sortOrder } = req.query;

      if (priority || sortBy || dueDate || overdue) {
        const tasks = await taskService.getTasksWithFilters(userId, { status, priority, dueDate, overdue, sortBy, sortOrder });
        return res.json({
          success: true,
          count: tasks.length,
          data: tasks
        });
      }

      const tasks = await taskService.getUserTasks(userId, status);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get single task
  getTaskById: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const task = await taskService.getTaskById(id, userId);
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      const statusCode = error.message === 'Task not found' ? 404 : 400;
      res.status(statusCode).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Update task
  updateTask: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const userId = req.user.id;
      const { id } = req.params;
      const updates = req.body;

      const updatedTask = await taskService.updateTask(id, userId, updates);
      
      res.json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
      });
    } catch (error) {
      const statusCode = error.message === 'Task not found' ? 404 : 400;
      res.status(statusCode).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Delete task
  deleteTask: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await taskService.deleteTask(id, userId);
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Task not found' ? 404 : 400;
      res.status(statusCode).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Update task status only
  updateTaskStatus: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const userId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      const updatedTask = await taskService.updateTaskStatus(id, userId, status);
      
      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: updatedTask
      });
    } catch (error) {
      const statusCode = error.message === 'Task not found' ? 404 : 400;
      res.status(statusCode).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get task statistics
  getTaskStatistics: async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await taskService.getTaskStatistics(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Search tasks
  searchTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ 
          success: false,
          error: 'Search query parameter "q" is required' 
        });
      }

      const tasks = await taskService.searchTasks(userId, q);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Bulk delete tasks
  bulkDeleteTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const { taskIds } = req.body;

      if (!taskIds || !Array.isArray(taskIds)) {
        return res.status(400).json({ 
          success: false,
          error: 'taskIds array is required' 
        });
      }

      const deletedTasks = await taskService.bulkDeleteTasks(userId, taskIds);
      
      res.json({
        success: true,
        message: `${deletedTasks.length} task(s) deleted successfully`,
        count: deletedTasks.length,
        data: deletedTasks
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Bulk update task status
  bulkUpdateTaskStatus: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const userId = req.user.id;
      const { taskIds, status } = req.body;

      if (!taskIds || !Array.isArray(taskIds)) {
        return res.status(400).json({ 
          success: false,
          error: 'taskIds array is required' 
        });
      }

      const updatedTasks = await taskService.bulkUpdateTaskStatus(userId, taskIds, status);
      
      res.json({
        success: true,
        message: `${updatedTasks.length} task(s) status updated successfully`,
        count: updatedTasks.length,
        data: updatedTasks
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  getOverdueTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const tasks = await taskService.getOverdueTasks(userId);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
};

module.exports = taskController;