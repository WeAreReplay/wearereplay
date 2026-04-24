import Listing from '../models/Listing.js';
import Rental from '../models/Rental.js';

/**
 * Get all listings for the current user (as lender)
 * Includes active listings, pending listings, and listing history
 */
export const getMyListings = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all listings where user is the lender
    const listings = await Listing.find({ lender: userId })
      .populate('rentedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Separate into categories
    const pendingListings = listings.filter(
      (l) => l.status === 'pending' && !l.isApproved
    );
    const activeListings = listings.filter(
      (l) =>
        l.status === 'available' ||
        l.status === 'delivering' ||
        l.status === 'rented' ||
        l.status === 'returning'
    );
    const listingHistory = listings.filter(
      (l) => l.status === 'returned' || l.status === 'rejected'
    );

    res.status(200).json({
      success: true,
      data: {
        pending: pendingListings,
        active: activeListings,
        history: listingHistory,
        all: listings,
      },
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings',
    });
  }
};

/**
 * Get a single listing by ID
 */
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate('lender', 'firstName lastName email metrics rating profilePicture')
      .populate('rentedBy', 'firstName lastName email metrics rating profilePicture');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { listing },
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing',
    });
  }
};

/**
 * Create a new listing
 */
export const createListing = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      platform,
      consoleModel,
      price,
      genre,
      tag,
      about,
      borrowDuration,
      hasExpansions,
      deliveryMethod,
      image,
    } = req.body;

    // Debug logging
    console.log("createListing - req.file:", req.file);
    console.log("createListing - req.body:", req.body);
    console.log("createListing - image from body:", image);

    // Validate required fields
    if (!name || !platform || !consoleModel || !price || !about || !borrowDuration || !deliveryMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Handle image - use uploaded file if present, otherwise use image URL from body
    let imageUrl = null;
    if (req.file) {
      // File was uploaded via multer
      console.log("File uploaded via multer:", req.file.filename);
      imageUrl = `/uploads/listings/${req.file.filename}`;
    } else if (image && typeof image === 'string' && image.trim() !== '') {
      imageUrl = image;
    } else if (image && typeof image === 'object' && image.url) {
      imageUrl = image.url;
    }

    console.log("Final imageUrl:", imageUrl);

    // Create new listing
    const newListing = await Listing.create({
      name,
      platform,
      consoleModel,
      price: Number(price),
      genre: genre || [],
      tag: tag || [],
      about,
      borrowDuration: Number(borrowDuration),
      hasExpansions: hasExpansions || 'no',
      deliveryMethod,
      image: imageUrl,
      status: 'pending',
      isApproved: false,
      lender: userId,
    });

    // Update user's total listings count
    await User.findByIdAndUpdate(userId, {
      $inc: { 'metrics.totalListings': 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Listing created and pending admin approval',
      data: { listing: newListing },
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating listing',
    });
  }
};

/**
 * Update a listing
 */
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    // Find the listing
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if user is the lender
    if (listing.lender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing',
      });
    }

    // Check if listing can be updated (only available/pending listings)
    if (!['pending', 'available'].includes(listing.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a listing that is currently rented or in transaction',
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'name',
      'platform',
      'consoleModel',
      'price',
      'genre',
      'tag',
      'about',
      'borrowDuration',
      'hasExpansions',
      'deliveryMethod',
      'image',
    ];

    // Apply updates
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === 'price' || field === 'borrowDuration') {
          listing[field] = Number(updates[field]);
        } else if (field === 'image') {
          // Handle image - use uploaded file if present, otherwise use image from body
          if (req.file) {
            // File was uploaded via multer
            listing[field] = `/uploads/listings/${req.file.filename}`;
          } else {
            const imageVal = updates[field];
            if (imageVal && typeof imageVal === 'string' && imageVal.trim() !== '') {
              listing[field] = imageVal;
            } else if (imageVal && typeof imageVal === 'object' && imageVal.url) {
              listing[field] = imageVal.url;
            } else if (imageVal === null || imageVal === '') {
              listing[field] = null;
            }
            // If none of these, keep existing image
          }
        } else {
          listing[field] = updates[field];
        }
      }
    });

    // If listing was already approved, reset to pending for re-approval
    if (listing.isApproved) {
      listing.status = 'pending';
      listing.isApproved = false;
    }

    await listing.save();

    res.status(200).json({
      success: true,
      message: listing.isApproved ? 'Listing updated and pending re-approval' : 'Listing updated',
      data: { listing },
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing',
    });
  }
};

/**
 * Delete a listing
 */
export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find the listing
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if user is the lender
    if (listing.lender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing',
      });
    }

    // Check if listing can be deleted (only available/pending listings)
    if (!['pending', 'available'].includes(listing.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a listing that is currently rented or in transaction',
      });
    }

    await Listing.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing',
    });
  }
};

/**
 * Admin: Approve a listing
 */
export const approveListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    listing.status = 'available';
    listing.isApproved = true;
    listing.approvedAt = new Date();

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing approved successfully',
      data: { listing },
    });
  } catch (error) {
    console.error('Approve listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving listing',
    });
  }
};

/**
 * Admin: Reject a listing
 */
export const rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    listing.status = 'rejected';
    listing.rejectionReason = reason || null;
    listing.rejectedAt = new Date();

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing rejected',
      data: { listing },
    });
  } catch (error) {
    console.error('Reject listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting listing',
    });
  }
};

/**
 * Get a single listing by ID (public - no auth required)
 * Only returns approved and available listings
 */
export const getPublicListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate('lender', 'firstName lastName email metrics rating profilePicture role subscriptionType')
      .populate('rentedBy', 'firstName lastName email metrics rating profilePicture');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Only return approved and available listings
    if (!listing.isApproved || listing.status !== 'available') {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { listing },
    });
  } catch (error) {
    console.error('Get public listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing',
    });
  }
};

/**
 * Get all listings (for public browse/catalogue)
 */
export const getAllListings = async (req, res) => {
  try {
    const { platform, genre, status = 'available' } = req.query;

    // Build query
    const query = { status, isApproved: true };
    if (platform) query.platform = platform;
    if (genre) query.genre = { $in: [genre] };

    const listings = await Listing.find(query)
      .populate('lender', 'firstName lastName email metrics rating profilePicture')
      .sort({ createdAt: -1 });

    // Format for frontend
    const formattedListings = listings.map((listing) => ({
      _id: listing._id,
      name: listing.name,
      platform: listing.platform,
      consoleModel: listing.consoleModel,
      price: listing.price,
      genre: listing.genre,
      tag: listing.tag,
      about: listing.about,
      borrowDuration: listing.borrowDuration,
      hasExpansions: listing.hasExpansions,
      deliveryMethod: listing.deliveryMethod,
      image: listing.image,
      status: listing.status,
      createdAt: listing.createdAt,
      lender: listing.lender,
      listedBy: listing.lender
        ? `${listing.lender.firstName} ${listing.lender.lastName?.charAt(0)}`
        : 'Unknown',
    }));

    res.status(200).json({
      success: true,
      count: formattedListings.length,
      data: { listings: formattedListings },
    });
  } catch (error) {
    console.error('Get all listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings',
    });
  }
};

/**
 * Get pending listings (for admin approval)
 */
export const getPendingListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'pending', isApproved: false })
      .populate('lender', 'firstName lastName email _id')
      .sort({ createdAt: -1 });

    // Format for frontend
    const formattedListings = listings.map((listing) => ({
      id: listing._id,
      name: listing.name,
      platform: listing.platform,
      consoleModel: listing.consoleModel,
      price: listing.price,
      genre: listing.genre,
      tag: listing.tag,
      about: listing.about,
      borrowDuration: listing.borrowDuration,
      hasExpansions: listing.hasExpansions,
      deliveryMethod: listing.deliveryMethod,
      image: listing.image,
      startDate: listing.startDate,
      dueDate: listing.dueDate,
      submittedOn: listing.createdAt,
      submittedBy: {
        id: listing.lender?._id,
        name: listing.lender ? `${listing.lender.firstName} ${listing.lender.lastName?.charAt(0)}` : 'Unknown',
        email: listing.lender?.email,
      },
    }));

    res.status(200).json({
      success: true,
      count: formattedListings.length,
      data: { listings: formattedListings },
    });
  } catch (error) {
    console.error('Get pending listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending listings',
    });
  }
};

/**
 * Get all listings for admin (includes all statuses with full details)
 */
export const getAdminAllListings = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query - admin sees everything
    const query = {};
    if (status) query.status = status;

    const listings = await Listing.find(query)
      .populate('lender', 'firstName lastName email _id')
      .populate('rentedBy', 'firstName lastName email _id')
      .sort({ createdAt: -1 });

    // Format for frontend
    const formattedListings = listings.map((listing) => ({
      id: listing._id,
      name: listing.name,
      platform: listing.platform,
      consoleModel: listing.consoleModel,
      price: listing.price,
      genre: listing.genre,
      tag: listing.tag,
      about: listing.about,
      borrowDuration: listing.borrowDuration,
      hasExpansions: listing.hasExpansions,
      deliveryMethod: listing.deliveryMethod,
      image: listing.image,
      status: listing.status,
      isApproved: listing.isApproved,
      startDate: listing.startDate,
      dueDate: listing.dueDate,
      approvedAt: listing.approvedAt,
      rejectedAt: listing.rejectedAt,
      rejectionReason: listing.rejectionReason,
      createdAt: listing.createdAt,
      owner: {
        id: listing.lender?._id,
        name: listing.lender ? `${listing.lender.firstName} ${listing.lender.lastName?.charAt(0)}` : 'Unknown',
        email: listing.lender?.email,
      },
      rentedBy: listing.rentedBy ? {
        id: listing.rentedBy._id,
        name: `${listing.rentedBy.firstName} ${listing.rentedBy.lastName?.charAt(0)}`,
        email: listing.rentedBy.email,
      } : null,
    }));

    res.status(200).json({
      success: true,
      count: formattedListings.length,
      data: { listings: formattedListings },
    });
  } catch (error) {
    console.error('Get admin all listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings',
    });
  }
};
