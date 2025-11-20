const taskService = require('../services/taskService');
const { validationResult } = require('express-validator');

// Helper function to format date from PostgreSQL to ISO string without timezone
const formatDateForResponse = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a string in the right format, return it
  if (typeof dateValue === 'string') {
    // Check if it's already in YYYY-MM-DDTHH:mm:ss format
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(dateValue)) {
      return dateValue.replace(' ', 'T');
    }
  }
  
  // If it's a Date object, format it as YYYY-MM-DDTHH:mm:ss (no timezone)
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  
  // PostgreSQL TIMESTAMP WITHOUT TIME ZONE is timezone-naive
  // The pg library returns it as a Date object, but we need to extract the UTC components
  // to get the exact stored time without timezone conversion
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Helper function to format task dates in response
const formatTaskDates = (task) => {
  if (!task) return task;
  const formatted = { ...task };
  if (task.due_date) {
    formatted.due_date = formatDateForResponse(task.due_date);
  }
  return formatted;
};

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
        data: formatTaskDates(newTask)
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
          data: tasks.map(formatTaskDates)
        });
      }

      const tasks = await taskService.getUserTasks(userId, status);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks.map(formatTaskDates)
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
        data: formatTaskDates(task)
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
        data: formatTaskDates(updatedTask)
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
        data: formatTaskDates(updatedTask)
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
        data: tasks.map(formatTaskDates)
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
        data: deletedTasks.map(formatTaskDates)
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
        data: updatedTasks.map(formatTaskDates)
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
        data: tasks.map(formatTaskDates)
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