const mindMapModel = require('../models/mindMapModel');
const { validationResult } = require('express-validator');

const mindMapController = {
  // Create a new mind map
  createMindMap: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { title, description, data } = req.body;

      const mindMapData = data || { nodes: [], edges: [] };
      const mindMap = await mindMapModel.create(userId, title, description, mindMapData);

      res.status(201).json({
        success: true,
        message: 'Mind map created successfully',
        data: mindMap
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all mind maps for the authenticated user
  getUserMindMaps: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { search } = req.query;

      let mindMaps;
      if (search) {
        mindMaps = await mindMapModel.search(userId, search);
      } else {
        mindMaps = await mindMapModel.findByUserId(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Mind maps retrieved successfully',
        data: mindMaps
      });
    } catch (error) {
      next(error);
    }
  },

  // Get a specific mind map by ID
  getMindMapById: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const mindMap = await mindMapModel.findByIdAndUserId(id, userId);

      if (!mindMap) {
        return res.status(404).json({
          success: false,
          message: 'Mind map not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Mind map retrieved successfully',
        data: mindMap
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a mind map
  updateMindMap: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const { id } = req.params;
      const { title, description, data } = req.body;

      // Check if mind map exists
      const existingMindMap = await mindMapModel.findByIdAndUserId(id, userId);
      if (!existingMindMap) {
        return res.status(404).json({
          success: false,
          message: 'Mind map not found'
        });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (data !== undefined) updates.data = data;

      const updatedMindMap = await mindMapModel.update(id, userId, updates);

      res.status(200).json({
        success: true,
        message: 'Mind map updated successfully',
        data: updatedMindMap
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a mind map
  deleteMindMap: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deletedMindMap = await mindMapModel.delete(id, userId);

      if (!deletedMindMap) {
        return res.status(404).json({
          success: false,
          message: 'Mind map not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Mind map deleted successfully',
        data: deletedMindMap
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = mindMapController;

