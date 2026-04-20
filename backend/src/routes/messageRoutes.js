import { Router } from 'express';
import { body } from 'express-validator';
import {
  sendMessage,
  getMyConversation,
  getAllConversations,
  getConversationByUserId,
  adminReply,
  getUnreadCount,
  checkAdminExists,
} from '../controllers/messageController.js';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = Router();

/**
 * Validation rules for sending messages
 */
const messageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message cannot exceed 5000 characters'),
];

const adminReplyValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message cannot exceed 5000 characters'),
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
];

/**
 * @route   POST /api/messages
 * @desc    Send a message (User -> Admin)
 * @access  Private (Authenticated users)
 */
router.post('/', protect, messageValidation, sendMessage);

/**
 * @route   GET /api/messages/my-conversation
 * @desc    Get current user's conversation with admin
 * @access  Private (Authenticated users)
 */
router.get('/my-conversation', protect, getMyConversation);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all user conversations (for admin)
 * @access  Private (Admin only)
 */
router.get('/conversations', protect, admin, getAllConversations);

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get specific conversation by user ID
 * @access  Private (Admin only)
 */
router.get('/conversation/:userId', protect, admin, getConversationByUserId);

/**
 * @route   POST /api/messages/admin-reply
 * @desc    Admin reply to user
 * @access  Private (Admin only)
 */
router.post('/admin-reply', protect, admin, adminReplyValidation, adminReply);

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get unread message count
 * @access  Private (Admin only)
 */
router.get('/unread-count', protect, admin, getUnreadCount);

/**
 * @route   GET /api/messages/check-admin
 * @desc    Debug - Check if admin exists
 * @access  Public
 */
router.get('/check-admin', checkAdminExists);

export default router;
