const express = require('express');
const { body } = require('express-validator');
const mindMapController = require('../controllers/mindMapController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createMindMapValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

const updateMindMapValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

router.use(authenticateToken);

// Create a new mind map
router.post('/', createMindMapValidation, mindMapController.createMindMap);

// Get all mind maps for the authenticated user
router.get('/', mindMapController.getUserMindMaps);

// Get a specific mind map by ID
router.get('/:id', mindMapController.getMindMapById);

// Update a mind map
router.put('/:id', updateMindMapValidation, mindMapController.updateMindMap);

// Delete a mind map
router.delete('/:id', mindMapController.deleteMindMap);

module.exports = router;

