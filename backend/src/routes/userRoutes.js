import { Router } from 'express';
import {
  subscribe,
  unsubscribe,
  getUserProfile,
  updateUserMetrics,
  updateUserRating,
  updateUserSubscription,
  getAllUsers,
  uploadProfilePicture,
  deleteProfilePicture,
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminMiddleware.js';
import {
  uploadProfilePicture as uploadProfilePictureMiddleware,
  handleProfileUploadError,
} from '../middleware/profilePictureUpload.js';

const router = Router();

// Protected routes (any authenticated user)
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.get('/profile', protect, getUserProfile);

// Profile picture routes
router.post(
  '/profile-picture',
  protect,
  uploadProfilePictureMiddleware,
  handleProfileUploadError,
  uploadProfilePicture
);
router.delete('/profile-picture', protect, deleteProfilePicture);

// Admin only routes
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:userId/metrics', protect, adminOnly, updateUserMetrics);
router.put('/:userId/rating', protect, adminOnly, updateUserRating);
router.put('/:userId/subscription', protect, adminOnly, updateUserSubscription);

export default router;
