import Report from '../models/Report.js';
import User from '../models/User.js';
import Rental from '../models/Rental.js';
import Listing from '../models/Listing.js';

/**
 * Get all reports submitted by the current user
 */
export const getMyReports = async (req, res) => {
  try {
    const userId = req.userId;

    const reports = await Report.find({ reportedBy: userId })
      .populate('reportedUser', 'firstName lastName email')
      .populate('listing', 'name platform price image')
      .sort({ createdAt: -1 });

    // Format the data to match frontend expectations
    const formattedReports = reports.map((report) => ({
      id: report._id,
      submittedOn: report.createdAt,
      firstName: report.reportedUser?.firstName,
      lastName: report.reportedUser?.lastName,
      email: report.reportedUser?.email,
      category: report.category,
      reason: report.reason,
      description: report.description,
      status: report.status,
      listing: report.listing,
    }));

    res.status(200).json({
      success: true,
      count: reports.length,
      data: { reports: formattedReports },
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
    });
  }
};

/**
 * Get all reports where current user is being reported
 */
export const getReportsAgainstMe = async (req, res) => {
  try {
    const userId = req.userId;

    const reports = await Report.find({ reportedUser: userId })
      .populate('reportedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: { reports },
    });
  } catch (error) {
    console.error('Get reports against me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
    });
  }
};

/**
 * Get all reports (Admin only)
 */
export const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUser', 'firstName lastName email')
      .populate('listing', 'name platform')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: { reports },
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
    });
  }
};

/**
 * Create a new report
 */
export const createReport = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      reportedUserId,
      listingId,
      rentalId,
      category,
      reason,
      description,
    } = req.body;

    // Validate required fields
    if (!reportedUserId || !category || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: 'Reported user not found',
      });
    }

    // Cannot report yourself
    if (reportedUserId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report yourself',
      });
    }

    // Create report
    const report = await Report.create({
      reportedBy: userId,
      reportedUser: reportedUserId,
      listing: listingId || null,
      rental: rentalId || null,
      category,
      reason,
      description,
      status: 'pending',
    });

    // Update user's damage reports count if category is damage-related
    if (['Game Return Issue', 'Damage', 'Late Return'].includes(category)) {
      await User.findByIdAndUpdate(reportedUserId, {
        $inc: { 'metrics.damageReports': 1 },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report },
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating report',
    });
  }
};

/**
 * Get report by ID
 */
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const report = await Report.findById(id)
      .populate('reportedBy', 'firstName lastName email')
      .populate('reportedUser', 'firstName lastName email')
      .populate('listing', 'name platform price image')
      .populate('rental')
      .populate('resolvedBy', 'firstName lastName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Check if user is authorized to view this report
    const isReporter = report.reportedBy._id.toString() === userId;
    const isReported = report.reportedUser._id.toString() === userId;

    if (!isReporter && !isReported && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report',
      });
    }

    res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report',
    });
  }
};

/**
 * Admin: Resolve a report
 */
export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;
    const { resolution, action } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = 'resolved';
    report.resolution = resolution;
    report.resolvedAt = new Date();
    report.resolvedBy = adminId;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report resolved successfully',
      data: { report },
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resolving report',
    });
  }
};

/**
 * Admin: Dismiss a report
 */
export const dismissReport = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;
    const { reason } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = 'dismissed';
    report.resolution = reason || 'Report dismissed';
    report.resolvedAt = new Date();
    report.resolvedBy = adminId;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report dismissed',
      data: { report },
    });
  } catch (error) {
    console.error('Dismiss report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while dismissing report',
    });
  }
};

