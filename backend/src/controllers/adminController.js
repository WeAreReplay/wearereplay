import User from '../models/User.js';

/**
 * Get Admin Dashboard Data
 * GET /api/admin/dashboard
 * Protected route - requires admin privileges
 */
export const getDashboard = async (req, res) => {
  try {
    // Get statistics for admin dashboard
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data retrieved successfully',
      data: {
        statistics: {
          totalUsers,
          adminUsers,
          regularUsers,
        },
        admin: {
          id: req.userId,
          email: req.userEmail,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
    });
  }
};

/**
 * Get All Users
 * GET /api/admin/users
 * Protected route - requires admin privileges
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
};