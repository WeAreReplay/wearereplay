import Rental from '../models/Rental.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';

/**
 * Get all rentals where current user is the borrower
 */
export const getMyBorrowedGames = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all rentals where user is the borrower
    const rentals = await Rental.find({ borrower: userId })
      .populate('listing', 'name platform consoleModel price image genre tag about hasExpansions deliveryMethod borrowDuration lender')
      .populate('lender', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Separate into active and history
    const activeRentals = rentals.filter(
      (r) => ['pending', 'delivering', 'active', 'returning', 'overdue'].includes(r.status)
    );
    const rentalHistory = rentals.filter(
      (r) => r.status === 'returned' || r.status === 'cancelled'
    );

    // Format the data to match frontend expectations
    const formatRental = (rental) => ({
      id: rental._id,
      listingId: rental.listing?._id,
      name: rental.listing?.name,
      platform: rental.listing?.platform,
      consoleModel: rental.listing?.consoleModel,
      price: rental.price,
      genre: rental.listing?.genre,
      tag: rental.listing?.tag,
      about: rental.listing?.about,
      borrowDuration: rental.borrowDuration,
      hasExpansions: rental.listing?.hasExpansions,
      deliveryMethod: rental.listing?.deliveryMethod,
      image: rental.listing?.image,
      status: rental.status,
      listedBy: rental.lender ? `${rental.lender.firstName} ${rental.lender.lastName?.charAt(0)}` : 'Unknown',
      lenderId: rental.lender?._id,
      startDate: rental.startDate,
      dueDate: rental.dueDate,
      returnedOn: rental.returnedOn,
      createdAt: rental.createdAt,
    });

    res.status(200).json({
      success: true,
      data: {
        active: activeRentals.map(formatRental),
        history: rentalHistory.map(formatRental),
        all: rentals.map(formatRental),
      },
    });
  } catch (error) {
    console.error('Get my borrowed games error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching borrowed games',
    });
  }
};

/**
 * Get all rentals where current user is the lender
 */
export const getMyRentalsAsLender = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all rentals where user is the lender
    const rentals = await Rental.find({ lender: userId })
      .populate('listing', 'name platform consoleModel price image')
      .populate('borrower', 'firstName lastName email metrics rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: { rentals },
    });
  } catch (error) {
    console.error('Get rentals as lender error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rentals',
    });
  }
};

/**
 * Create a new rental request
 */
export const createRental = async (req, res) => {
  try {
    const userId = req.userId;
    const { listingId, paymentMethod, deliveryAddress } = req.body;

    // Find the listing
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if listing is available
    if (listing.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This game is not available for rent',
      });
    }

    // Check if user is not the lender
    if (listing.lender.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rent your own game',
      });
    }

    // Check if user already has an active rental for this listing
    const existingRental = await Rental.findOne({
      listing: listingId,
      borrower: userId,
      status: { $in: ['pending', 'delivering', 'active', 'returning'] },
    });

    if (existingRental) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active rental for this game',
      });
    }

    // Get user and check borrowing limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Count user's active rentals
    const activeRentalsCount = await Rental.countDocuments({
      borrower: userId,
      status: { $in: ['pending', 'delivering', 'active', 'returning'] },
    });

    // Check borrowing limits based on subscription type
    const isPremium = user.subscriptionType === 'premium' && user.subscriptionStatus === 'active';
    const maxBorrows = isPremium ? 10 : 3;

    if (activeRentalsCount >= maxBorrows) {
      return res.status(400).json({
        success: false,
        message: isPremium
          ? 'You have reached your premium borrowing limit of 10 active rentals. Please return some games before borrowing more.'
          : 'You have reached your borrowing limit of 3 active rentals. Upgrade to Premium for up to 10 active borrows or return some games.',
      });
    }

    // Calculate deposit (50% of original price, max 80 AED)
    const depositAmount = Math.min(Math.round(listing.price * 0.5), 80);

    // Calculate protection fee with weekly increments
    // Base: 10% of deposit for Week 1
    // Additional: 2 AED per extra week
    const borrowWeeks = Math.ceil(listing.borrowDuration / 7);
    const baseProtectionFee = Math.round(depositAmount * 0.1);
    const weeklyIncrement = 2 * Math.max(0, borrowWeeks - 1);
    const protectionFee = baseProtectionFee + weeklyIncrement;

    // Calculate due date with grace period for premium users
    const gracePeriod = isPremium ? 2 : 0;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + listing.borrowDuration + gracePeriod);

    // Calculate total
    const totalAmount = listing.price + protectionFee + depositAmount;

    // Create rental
    const rental = await Rental.create({
      listing: listingId,
      lender: listing.lender,
      borrower: userId,
      status: 'pending',
      dueDate,
      price: listing.price,
      borrowDuration: listing.borrowDuration,
      protectionFee,
      depositAmount,
      totalAmount,
      borrowWeeks,
      baseProtectionFee,
      weeklyIncrement,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
      deliveryAddress: deliveryAddress || '',
      gracePeriodDays: gracePeriod,
      subscriptionType: isPremium ? 'premium' : 'standard',
    });

    // Update listing status
    listing.status = 'pending';
    await listing.save();

    res.status(201).json({
      success: true,
      message: 'Rental request created successfully',
      data: {
        rental,
        fees: {
          price: listing.price,
          protectionFee,
          depositAmount,
          totalAmount,
          borrowWeeks,
          baseProtectionFee,
          weeklyIncrement,
        },
        gracePeriodDays: gracePeriod,
        maxBorrows,
        currentBorrows: activeRentalsCount + 1,
      },
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating rental',
    });
  }
};

/**
 * Update rental status (for delivery confirmation, return, etc.)
 */
export const updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { status } = req.body;

    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
      });
    }

    // Check if user is involved in this rental
    const isBorrower = rental.borrower.toString() === userId;
    const isLender = rental.lender.toString() === userId;

    if (!isBorrower && !isLender) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rental',
      });
    }

    const listing = await Listing.findById(rental.listing);

    // Handle different status updates
    switch (status) {
      case 'delivering':
        // Borrower confirms they're sending the game
        if (!isBorrower) {
          return res.status(403).json({ success: false, message: 'Only borrower can initiate delivery' });
        }
        rental.status = 'delivering';
        listing.status = 'delivering';
        break;

      case 'active':
        // Borrower confirms receiving the game
        if (!isBorrower) {
          return res.status(403).json({ success: false, message: 'Only borrower can confirm delivery' });
        }
        rental.status = 'active';
        rental.startDate = new Date();
        rental.deliveredAt = new Date();
        listing.status = 'rented';
        listing.startDate = rental.startDate;
        listing.dueDate = rental.dueDate;
        listing.rentedBy = rental.borrower;
        break;

      case 'returning':
        // Borrower initiates return
        if (!isBorrower) {
          return res.status(403).json({ success: false, message: 'Only borrower can initiate return' });
        }
        rental.status = 'returning';
        listing.status = 'returning';
        break;

      case 'returned':
        // Lender confirms return
        if (!isLender) {
          return res.status(403).json({ success: false, message: 'Only lender can confirm return' });
        }
        rental.status = 'returned';
        rental.returnedAt = new Date();
        rental.returnedOn = new Date();
        listing.status = 'returned';
        listing.rentedBy = null;
        listing.startDate = null;
        listing.dueDate = null;

        // Update user metrics
        await User.findByIdAndUpdate(rental.borrower, {
          $inc: { 'metrics.successfulReturns': 1, 'metrics.borrows': 1 },
        });
        await User.findByIdAndUpdate(rental.lender, {
          $inc: { 'metrics.lends': 1 },
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
    }

    await rental.save();
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Rental status updated to ${status}`,
      data: { rental },
    });
  } catch (error) {
    console.error('Update rental status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating rental status',
    });
  }
};

/**
 * Get rental by ID
 */
export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const rental = await Rental.findById(id)
      .populate('listing', '-__v')
      .populate('lender', 'firstName lastName email metrics rating profilePicture')
      .populate('borrower', 'firstName lastName email metrics rating profilePicture');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
      });
    }

    // Check if user is involved in this rental
    if (
      rental.lender._id.toString() !== userId &&
      rental.borrower._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this rental',
      });
    }

    res.status(200).json({
      success: true,
      data: { rental },
    });
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental',
    });
  }
};

/**
 * Cancel a rental request
 */
export const cancelRental = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
      });
    }

    // Only borrower or lender can cancel
    if (
      rental.borrower.toString() !== userId &&
      rental.lender.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this rental',
      });
    }

    // Can only cancel pending or delivering rentals
    if (!['pending', 'delivering'].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel rental at this stage',
      });
    }

    // Update listing status back to available
    const listing = await Listing.findById(rental.listing);
    if (listing) {
      listing.status = 'available';
      listing.rentedBy = null;
      await listing.save();
    }

    rental.status = 'cancelled';
    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling rental',
    });
  }
};
