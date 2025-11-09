const { getUserById, updateUserProfile: updateUserProfileModel } = require('../models/userModel');

const getUserProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove password from response
    const { password, ...userProfile } = user;
    
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user: userProfile },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name or email) is required',
      });
    }

    const updatedUser = await updateUserProfileModel(userId, { name, email });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove password from response
    const { password, ...userProfile } = updatedUser;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userProfile },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};