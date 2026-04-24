import express from 'express';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import {
  uploadListingImage,
  handleListingUploadError,
} from '../middleware/listingImageUpload.js';

import {
  getMyListings,
  getListingById,
  getPublicListingById,
  createListing,
  updateListing,
  deleteListing,
  approveListing,
  rejectListing,
  getAllListings,
  getPendingListings,
  getAdminAllListings,
} from '../controllers/listingController.js';

import {
  getMyBorrowedGames,
  getMyRentalsAsLender,
  createRental,
  updateRentalStatus,
  getRentalById,
  cancelRental,
} from '../controllers/rentalController.js';

import {
  getMyReports,
  getReportsAgainstMe,
  getAllReports,
  createReport,
  getReportById,
  resolveReport,
  dismissReport,
} from '../controllers/reportController.js';

const router = express.Router();

// Public Routes (no authentication required)
// Get all approved/available listings for public catalog
router.get('/listings/public', getAllListings);
// Get a single listing by ID (public - only approved/available listings)
router.get('/listings/:id/public', getPublicListingById);

// All routes below are protected - require authentication
router.use((req, res, next) => protect(req, res, next));

// Listing Routes
router.get('/listings/my', getMyListings);
router.post('/listings', uploadListingImage, handleListingUploadError, createListing);
router.get('/listings/pending', getPendingListings);
router.get('/listings/:id', getListingById);
router.put('/listings/:id', uploadListingImage, handleListingUploadError, updateListing);
router.delete('/listings/:id', deleteListing);

// Rental/Borrowed Games Routes
router.get('/rentals/my-borrowed', getMyBorrowedGames);
router.get('/rentals/my-lent', getMyRentalsAsLender);
router.post('/rentals', createRental);
router.get('/rentals/:id', getRentalById);
router.patch('/rentals/:id/status', updateRentalStatus);
router.delete('/rentals/:id', cancelRental);

// Report Routes
router.get('/reports/my', getMyReports);
router.get('/reports/against-me', getReportsAgainstMe);
router.post('/reports', createReport);
router.get('/reports/:id', getReportById);

// Admin Routes
router.get('/listings/admin/all', admin, getAdminAllListings);
router.get('/listings', admin, getAllListings);
router.patch('/listings/:id/approve', admin, approveListing);
router.patch('/listings/:id/reject', admin, rejectListing);

router.get('/reports', admin, getAllReports);
router.patch('/reports/:id/resolve', admin, resolveReport);
router.patch('/reports/:id/dismiss', admin, dismissReport);

export default router;
