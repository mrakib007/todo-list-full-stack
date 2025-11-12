const { getAllUsers, findUserById, updateUser, updateUserPassword, comparePassword } = require('../models/userModel');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const getUserList = async (req, res) => {
  try {
    // Check if user is super_admin (this will be set by auth middleware)
    if (req.user.user_type !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const users = await getAllUsers();
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        total: users.length,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await findUserById(userId);
      if (existingUser.email !== email) {
        const emailCheck = await require('../models/userModel').findUserByEmail(email);
        if (emailCheck && emailCheck.id !== userId) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
        }
      }
    }

    const updatedUser = await updateUser(userId, { name, email });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await require('../config/database').query(userQuery, [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(userId, hashedPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getUserList,
  getUserProfile,
  updateUserProfile,
  changePassword,
};