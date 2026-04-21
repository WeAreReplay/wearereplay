import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * Send a message (User -> Admin or Admin -> User)
 * POST /api/messages
 * Protected route
 */
export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const senderId = req.userId;

    // Validate that either content or attachments are provided
    const hasContent = content && content.trim().length > 0;
    const hasAttachments = req.files && req.files.length > 0;

    if (!hasContent && !hasAttachments) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain either text content or attachments',
      });
    }

    // Determine conversation ID (the user's ID - non-admin)
    const sender = await User.findById(senderId);
    let receiver;

    // If receiverId provided, use it; otherwise find an admin
    if (receiverId) {
      receiver = await User.findById(receiverId);
    }

    // If no receiver found or sender is admin, find an admin user
    if (!receiver || sender.role === 'admin') {
      if (sender.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Admin must specify a user to message',
        });
      }

      // Find any admin user
      receiver = await User.findOne({ role: 'admin' });

      console.log('🔍 Looking for admin user...');
      console.log('Sender role:', sender.role);
      console.log('ReceiverId provided:', receiverId);
      console.log('Found receiver:', receiver ? { id: receiver._id, email: receiver.email, role: receiver.role } : null);

      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: 'No admin available to receive messages. Please try again later.',
        });
      }
    }

    // Conversation ID is always the non-admin user's ID
    // If sender is admin, conversation is with receiver (user)
    // If sender is user, conversation is with sender (user)
    const conversationId = sender.role === 'admin' ? receiver._id : senderId;

    // Process attachments if any files were uploaded
    const attachments = req.files
      ? req.files.map((file) => ({
          url: `/uploads/messages/${file.filename}`,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        }))
      : [];

    // Create the message
    const message = await Message.create({
      sender: senderId,
      receiver: receiver._id,
      content: content.trim(),
      conversationId,
      attachments,
    });

    // Populate sender and receiver info for the response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email role')
      .populate('receiver', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message',
    });
  }
};

/**
 * Get user's conversation with admin
 * GET /api/messages/my-conversation
 * Protected route (for users)
 */
export const getMyConversation = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all messages where this user is either sender or receiver
    // and the conversationId is the user's ID (1-to-1 with admin)
    const messages = await Message.find({
      conversationId: userId,
    })
      .populate('sender', 'firstName lastName email role')
      .populate('receiver', 'firstName lastName email role')
      .sort({ createdAt: 1 });

    // Mark messages from admin as read
    await Message.updateMany(
      {
        conversationId: userId,
        receiver: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: {
        messages,
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversation',
    });
  }
};

/**
 * Get all conversations (for admin)
 * GET /api/messages/conversations
 * Protected route - Admin only
 */
export const getAllConversations = async (req, res) => {
  try {
    console.log('🔍 getAllConversations called by user:', req.userId, 'role:', req.userRole);

    // Get all unique conversation IDs with their latest message
    const conversations = await Message.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isRead', false] }, { $ne: ['$sender', '$conversationId'] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    console.log('📊 Raw conversations found:', conversations.length);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select('firstName lastName email createdAt');
        console.log('👤 Looking up user for conversation:', conv._id, 'found:', user ? user.email : 'NOT FOUND');
        return {
          conversationId: conv._id,
          user,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      })
    );

    console.log('✅ Returning', populatedConversations.length, 'conversations');

    res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: {
        conversations: populatedConversations,
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations',
    });
  }
};

/**
 * Get specific conversation by user ID (for admin)
 * GET /api/messages/conversation/:userId
 * Protected route - Admin only
 */
export const getConversationByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the user exists
    const user = await User.findById(userId).select('firstName lastName email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get all messages in this conversation
    const messages = await Message.find({
      conversationId: userId,
    })
      .populate('sender', 'firstName lastName email role')
      .populate('receiver', 'firstName lastName email role')
      .sort({ createdAt: 1 });

    // Mark messages from user as read (admin is viewing them)
    await Message.updateMany(
      {
        conversationId: userId,
        sender: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: {
        user,
        messages,
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversation',
    });
  }
};

/**
 * Send message to specific user (for admin)
 * POST /api/messages/admin-reply
 * Protected route - Admin only
 */
export const adminReply = async (req, res) => {
  try {
    const { content, userId } = req.body;
    const adminId = req.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create the message (admin -> user)
    const message = await Message.create({
      sender: adminId,
      receiver: userId,
      content: content.trim(),
      conversationId: userId, // Conversation is identified by the user's ID
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email role')
      .populate('receiver', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    console.error('Admin reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending reply',
    });
  }
};

/**
 * Get unread message count (for admin dashboard)
 * GET /api/messages/unread-count
 * Protected route - Admin only
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      isRead: false,
      sender: { $ne: req.userId }, // Messages not from admin
    });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved',
      data: { count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count',
    });
  }
};

/**
 * Debug endpoint - Check if admin exists (public)
 * GET /api/messages/check-admin
 * Public route - for debugging
 */
export const checkAdminExists = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('email firstName lastName role');
    const allUsers = await User.find().select('email firstName lastName role');

    res.status(200).json({
      success: true,
      data: {
        adminFound: !!admin,
        admin: admin,
        allUsers: allUsers,
        totalUsers: allUsers.length,
      },
    });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
