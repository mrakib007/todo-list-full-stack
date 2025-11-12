const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { 
  getUserList, 
  updateUserStatus, 
  getUserStats 
} = require('../controllers/adminController');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with their status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/users', getUserList);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user account status (accept/ban/revoke_ban)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, active, banned]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.patch('/users/:id/status', updateUserStatus);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', getUserStats);

module.exports = router;