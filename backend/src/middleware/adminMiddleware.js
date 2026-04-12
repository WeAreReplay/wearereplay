import jwt from 'jsonwebtoken';

/**
 * Admin Middleware
 * Verifies that the authenticated user has admin role
 * Must be used after auth middleware
 */
const admin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate.',
      });
    }

    // Check if user has admin role
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization',
    });
  }
};

export default admin;