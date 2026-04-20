import mongoose from 'mongoose';

/**
 * Message Schema
 * Defines the structure for message documents in MongoDB
 * Each conversation is between a user and the admin
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Conversation ID is the user's ID for user-admin conversations
    // This ensures all messages between a specific user and admin are grouped
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Conversation ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of conversations
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

/**
 * Transform the message object when converting to JSON
 */
messageSchema.methods.toJSON = function () {
  const message = this.toObject();
  delete message.__v;
  return message;
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
