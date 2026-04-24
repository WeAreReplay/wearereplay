import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Defines the structure for user documents in MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Subscription fields
    subscriptionStatus: {
      type: String,
      enum: ['inactive', 'active'],
      default: 'inactive',
    },
    subscriptionType: {
      type: String,
      enum: ['regular', 'premium'],
      default: 'regular',
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    // User metrics (admin-controlled)
    metrics: {
      damageReports: { type: Number, default: 0 },
      successfulReturns: { type: Number, default: 0 },
      lateReturns: { type: Number, default: 0 },
      lends: { type: Number, default: 0 },
      borrows: { type: Number, default: 0 },
      totalListings: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      responseTime: { type: String, default: '< 24 Hours' },
    },
    // Admin-assigned rating (1-5 stars)
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // Profile picture URL/path
    profilePicture: {
      type: String,
      default: null,
    },
    // User contacts (additional contact methods)
    contacts: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['phone', 'whatsapp', 'discord', 'telegram', 'instagram', 'other'],
          required: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        label: {
          type: String,
          trim: true,
        },
        isPublic: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false, // We don't need updatedAt for this use case
    },
  }
);

/**
 * Pre-save middleware
 * Hashes the password before saving to the database
 */
userSchema.pre('save', async function () {
  // Only hash if password is modified (or new)
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

/**
 * Instance method to compare passwords
 * Used during login to verify credentials
 * @param {string} candidatePassword - The password to compare
 * @returns {boolean} - True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Transform the user object when converting to JSON
 * Removes sensitive information
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;