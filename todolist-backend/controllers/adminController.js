const { 
  getAllUsers, 
  updateUserStatus: updateUserStatusModel,
  getUserById,
  getUserStats: getUserStatsModel,
  deleteUser: deleteUserModel
} = require('../models/userModel');

const getUserList = async (req, res) => {
  try {
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

const updateUserStatus = async (req, res) => {
  try {
    if (req.user.user_type !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'active', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, active, or banned',
      });
    }

    // Check if user exists
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from changing their own status
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own account status',
      });
    }

    // Update user status
    const updatedUser = await updateUserStatusModel(id, status);

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    if (req.user.user_type !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const stats = await getUserStatsModel();
    
    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.user_type !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { id } = req.params;

    // Check if user exists
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    // Delete user (tasks will be deleted automatically due to CASCADE)
    const deletedUser = await deleteUserModel(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        user: deletedUser,
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getUserList,
  updateUserStatus,
  getUserStats,
  deleteUser,
};