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
      const { title, description, priority } = req.body;

      const newTask = await taskService.createTask(userId, title, description, priority);
      
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
      const { status } = req.query;

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
  }
};

module.exports = taskController;