const { getAllUsers } = require('../models/userModel');

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

module.exports = {
  getUserList,
};