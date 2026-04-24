import mongoose from 'mongoose';

/**
 * Report Schema
 * Represents a user report (e.g., for late returns, damages, etc.)
 */
const reportSchema = new mongoose.Schema(
  {
    // The user who submitted the report
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The user being reported
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Related listing (if applicable)
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
    },
    // Related rental (if applicable)
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      default: null,
    },
    // Report category/type
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Game Return Issue',
        'Communication Problems',
        'Legal & Policy Violations',
        'Platform Misuse',
        'Fraud & Trust Issues',
        'Safety & Harassment',
        'Damage',
        'Late Return',
        'Other',
      ],
    },
    // Detailed reason
    reason: {
      type: String,
      required: [true, 'Reason is required'],
    },
    // Full description
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // Report status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending',
    },
    // Admin response/resolution
    resolution: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
reportSchema.index({ reportedBy: 1, status: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
