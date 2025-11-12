const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const query = 'SELECT id, email, name, user_type, status, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [decoded.userId]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // Check if user account is banned
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Account has been banned. Please contact administrator.',
      });
    }

    // Allow pending users to access basic endpoints but restrict others
    if (user.status === 'pending' && user.user_type !== 'super_admin') {
      // route restrictions if needed for later use
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = {
  authenticateToken,
};