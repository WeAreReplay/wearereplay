import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate JWT Token
 * Creates a signed token with user ID, email, and role
 */
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Google OAuth Callback Handler
 * Called after Google authentication
 * POST /api/auth/google/callback
 */
export const googleCallback = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, profilePicture } = req.body;

    // Validate required fields
    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID and email are required',
      });
    }

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // User exists - update profile info if needed
      if (profilePicture && !user.profilePicture) {
        user.profilePicture = profilePicture;
        await user.save();
      }
    } else {
      // Check if user exists with same email (link accounts)
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing email account
        user.googleId = googleId;
        if (profilePicture && !user.profilePicture) {
          user.profilePicture = profilePicture;
        }
        user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
        await user.save();
      } else {
        // Create new user with Google credentials
        user = await User.create({
          firstName: firstName || 'User',
          lastName: lastName || '',
          email,
          googleId,
          authProvider: 'google',
          profilePicture: profilePicture || null,
          role: 'user',
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        token,
        role: user.role,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionType: user.subscriptionType,
          subscriptionExpiry: user.subscriptionExpiry,
          metrics: user.metrics,
          rating: user.rating,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider,
        },
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication',
    });
  }
};
