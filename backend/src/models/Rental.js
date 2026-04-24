import mongoose from 'mongoose';

/**
 * Rental Schema
 * Represents a borrowing transaction between a lender and borrower
 */
const rentalSchema = new mongoose.Schema(
  {
    // Reference to the listing being rented
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    // The lender (owner of the game)
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The borrower (person renting the game)
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Rental status
    status: {
      type: String,
      enum: ['pending', 'delivering', 'active', 'returning', 'returned', 'overdue', 'cancelled'],
      default: 'pending',
    },
    // Rental period
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnedOn: {
      type: Date,
      default: null,
    },
    // Rental details (copied from listing at time of rental)
    price: {
      type: Number,
      required: true,
    },
    borrowDuration: {
      type: Number,
      required: true,
    },
    // Fees and charges
    protectionFee: {
      type: Number,
      default: 6,
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Payment and delivery details
    paymentMethod: {
      type: String,
      enum: ['cod', 'card'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    // Premium user benefits
    gracePeriodDays: {
      type: Number,
      default: 0,
    },
    // Tracking dates
    deliveredAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
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
rentalSchema.index({ borrower: 1, status: 1 });
rentalSchema.index({ lender: 1, status: 1 });
rentalSchema.index({ listing: 1 });

const Rental = mongoose.model('Rental', rentalSchema);

export default Rental;

