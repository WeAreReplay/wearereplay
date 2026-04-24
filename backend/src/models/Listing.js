import mongoose from 'mongoose';

/**
 * Listing Schema
 * Represents a game listing created by a user (lender)
 */
const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Game name is required'],
      trim: true,
      maxlength: [100, 'Game name cannot exceed 100 characters'],
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['Xbox', 'PlayStation', 'Nintendo'],
    },
    consoleModel: {
      type: String,
      required: [true, 'Console model is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1 AED'],
    },
    genre: [{
      type: String,
      required: true,
    }],
    tag: [{
      type: String,
      required: true,
    }],
    about: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    borrowDuration: {
      type: Number,
      required: [true, 'Borrow duration is required'],
      min: [1, 'Duration must be at least 1 day'],
      max: [10, 'Duration cannot exceed 10 days'],
    },
    hasExpansions: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no',
    },
    commercialBulking: {
      type: String,
      enum: ['short-term', 'long-term', 'no'],
      default: 'no',
      required: [true, 'Commercial bulking availability is required'],
    },
    deliveryMethod: {
      type: String,
      required: [true, 'Delivery method is required'],
      enum: ['Pick-up', 'Meet-up', 'Drop-off'],
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'available', 'delivering', 'rented', 'returning', 'returned', 'rejected'],
      default: 'pending',
    },
    // Reference to the user who created the listing (lender)
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the user who rented the game (borrower) - null if not rented
    rentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Rental period dates
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    // Admin approval fields
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // Rejection fields
    rejectionReason: {
      type: String,
      default: null,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient querying
 */
listingSchema.index({ lender: 1, status: 1 });
listingSchema.index({ rentedBy: 1, status: 1 });
listingSchema.index({ status: 1, isApproved: 1 });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
