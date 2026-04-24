import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

/**
 * Subscribe user to premium
 * POST /api/users/subscribe
 * Protected route
 */
export const subscribe = async (req, res) => {
  try {
    const userId = req.userId;
    const { months = 1 } = req.body;

    // Calculate expiry date (1 month from now by default)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionStatus: 'active',
        subscriptionType: 'premium',
        subscriptionExpiry: expiryDate,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionType: user.subscriptionType,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during subscription',
    });
  }
};

/**
 * Unsubscribe user from premium
 * POST /api/users/unsubscribe
 * Protected route
 */
export const unsubscribe = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionStatus: 'inactive',
        subscriptionType: 'regular',
        subscriptionExpiry: null,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionType: user.subscriptionType,
      },
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during unsubscription',
    });
  }
};

/**
 * Get user profile with metrics
 * GET /api/users/profile
 * Protected route
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
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
          contacts: user.contacts || [],
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * Update user metrics (Admin only)
 * PUT /api/users/:userId/metrics
 * Protected route - requires admin
 */
export const updateUserMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      damageReports,
      successfulReturns,
      lateReturns,
      lends,
      borrows,
      completionRate,
      responseTime,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        metrics: {
          damageReports: damageReports ?? 0,
          successfulReturns: successfulReturns ?? 0,
          lateReturns: lateReturns ?? 0,
          lends: lends ?? 0,
          borrows: borrows ?? 0,
          completionRate: completionRate ?? 0,
          responseTime: responseTime ?? '< 24 Hours',
        },
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User metrics updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          metrics: user.metrics,
          rating: user.rating,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionType: user.subscriptionType,
        },
      },
    });
  } catch (error) {
    console.error('Update metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating metrics',
    });
  }
};

/**
 * Update user rating (Admin only)
 * PUT /api/users/:userId/rating
 * Protected route - requires admin
 */
export const updateUserRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { rating },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User rating updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          rating: user.rating,
        },
      },
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating rating',
    });
  }
};

/**
 * Update user subscription (Admin only)
 * PUT /api/users/:userId/subscription
 * Protected route - requires admin
 */
export const updateUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscriptionStatus, subscriptionType, months = 1 } = req.body;

    let expiryDate = null;
    if (subscriptionStatus === 'active' && subscriptionType === 'premium') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionStatus,
        subscriptionType,
        subscriptionExpiry: expiryDate,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User subscription updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionType: user.subscriptionType,
          subscriptionExpiry: user.subscriptionExpiry,
        },
      },
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating subscription',
    });
  }
};

/**
 * Get all users with full details (Admin only)
 * GET /api/users
 * Protected route - requires admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => ({
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
          createdAt: user.createdAt,
        })),
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

/**
 * Upload profile picture
 * POST /api/users/profile-picture
 * Protected route
 */
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Get the user to check for old profile picture
    const user = await User.findById(userId);
    if (!user) {
      // Delete the uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(process.cwd(), user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update user with new profile picture path
    const pictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: pictureUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: pictureUrl,
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    // Delete uploaded file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while uploading profile picture',
    });
  }
};

/**
 * Delete profile picture
 * DELETE /api/users/profile-picture
 * Protected route
 */
export const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPicturePath = path.join(process.cwd(), user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update user to remove profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: null },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting profile picture',
    });
  }
};

/**
 * Add a contact to user profile
 * POST /api/users/contacts
 * Protected route
 */
export const addContact = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, value, label, isPublic = true } = req.body;

    // Validate required fields
    if (!type || !value) {
      return res.status(400).json({
        success: false,
        message: 'Contact type and value are required',
      });
    }

    // Validate contact type
    const validTypes = ['phone', 'whatsapp', 'discord', 'telegram', 'instagram', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid contact type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check for duplicate contact value
    const existingContact = user.contacts.find(
      (contact) => contact.value.toLowerCase() === value.toLowerCase()
    );
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'A contact with this value already exists',
      });
    }

    // Generate unique ID for contact
    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add new contact
    const newContact = {
      id: contactId,
      type,
      value,
      label: label || '',
      isPublic,
      createdAt: new Date(),
    };

    user.contacts.push(newContact);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      data: {
        contact: newContact,
        contacts: user.contacts,
      },
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding contact',
    });
  }
};

/**
 * Remove a contact from user profile
 * DELETE /api/users/contacts/:contactId
 * Protected route
 */
export const removeContact = async (req, res) => {
  try {
    const userId = req.userId;
    const { contactId } = req.params;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find and remove contact
    const contactIndex = user.contacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Remove contact
    user.contacts.splice(contactIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contact removed successfully',
      data: {
        contacts: user.contacts,
      },
    });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing contact',
    });
  }
};

/**
 * Get public contacts for a user (for viewing on listings)
 * GET /api/users/:userId/contacts
 * Public route - no authentication required
 */
export const getPublicContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Filter only public contacts
    const publicContacts = user.contacts.filter((contact) => contact.isPublic);

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        contacts: publicContacts,
      },
    });
  } catch (error) {
    console.error('Get public contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts',
    });
  }
};
