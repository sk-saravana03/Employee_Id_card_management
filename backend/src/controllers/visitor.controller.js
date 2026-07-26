import Visitor from '../models/Visitor.model.js';
import Employee from '../models/Employee.model.js';
import User from '../models/User.model.js';
import { recordAuditLog } from '../services/audit.service.js';
import { sendVisitorApprovedEmail, sendVisitorRejectedEmail } from '../services/email.service.js';

/**
 * @route   GET /api/v1/visitors
 * @desc    Get visitor list with search, status filter, and pagination
 * @access  Private
 */
export const getVisitors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', purpose = '' } = req.query;
    const query = {};

    if (status) query.status = status;
    if (purpose) query.purpose = purpose;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { passNumber: searchRegex },
        { company: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [visitors, total] = await Promise.all([
      Visitor.find(query)
        .populate({
          path: 'employeeToVisit',
          populate: [{ path: 'branch' }, { path: 'department' }],
        })
        .populate('hostUser', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Visitor.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        visitors,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[Visitor Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch visitor logs.' });
  }
};

/**
 * @route   GET /api/v1/visitors/:id
 * @desc    Get visitor details by ID
 * @access  Private
 */
export const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate('employeeToVisit')
      .populate('hostUser', 'firstName lastName email');

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor record not found.' });
    }

    const plainGovtId = visitor.getDecryptedGovtId();

    return res.status(200).json({
      success: true,
      data: {
        visitor: {
          ...visitor.toObject(),
          decryptedGovtId: plainGovtId,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch visitor record.' });
  }
};

/**
 * @route   POST /api/v1/visitors/register
 * @desc    Register new visitor pass request
 * @access  Public / Private (Security Officer, Host)
 */
export const registerVisitor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      photoUrl,
      govtIdType,
      govtIdNumber,
      employeeToVisit,
      purpose = 'MEETING',
      expectedEntryTime,
      validityHours = 12, // configurable validity window (default 12h)
    } = req.body;

    let hostEmployee = null;
    if (employeeToVisit) {
      hostEmployee = await Employee.findById(employeeToVisit);
      if (!hostEmployee) {
        const hostUser = await User.findById(employeeToVisit);
        if (hostUser) {
          hostEmployee = await Employee.findOne({ email: hostUser.email.toLowerCase() });
          if (!hostEmployee) {
            hostEmployee = await Employee.create({
              employeeId: hostUser.employeeId,
              firstName: hostUser.firstName,
              lastName: hostUser.lastName,
              email: hostUser.email.toLowerCase(),
              phone: hostUser.phone || '',
              designation: hostUser.designation || 'Staff Member',
              branch: hostUser.branch || null,
              department: hostUser.department || null,
              joiningDate: hostUser.joiningDate || new Date(),
              status: hostUser.status || 'ACTIVE',
            });
          }
        } else {
          hostEmployee = await Employee.findOne({
            $or: [{ employeeId: String(employeeToVisit).toUpperCase() }, { email: String(employeeToVisit).toLowerCase() }],
          });
        }
      }
    }

    if (!hostEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Target host employee not found. Please select a valid employee from the list.',
      });
    }

    const passNumber = `VIS-${Math.floor(100000 + Math.random() * 900000)}`;
    const expected = expectedEntryTime ? new Date(expectedEntryTime) : new Date();
    const hours = Math.min(Math.max(parseInt(validityHours, 10) || 12, 1), 72); // clamp 1–72h
    const expiry = new Date(expected.getTime() + hours * 60 * 60 * 1000);
    // Auto-delete 24 hours after expiry (MongoDB TTL)
    const autoDeleteAt = new Date(expiry.getTime() + 24 * 60 * 60 * 1000);

    const qrCodeData = JSON.stringify({
      passNumber,
      visitor: fullName,
      host: `${hostEmployee.firstName} ${hostEmployee.lastName}`,
      exp: expiry.toISOString(),
    });
    const barcodeValue = `*${passNumber}*`;

    const visitor = new Visitor({
      passNumber,
      fullName,
      email: email.toLowerCase(),
      phone,
      company: company || 'Independent Visitor',
      photoUrl: photoUrl || '',
      govtIdType: govtIdType || 'Driver License',
      employeeToVisit: hostEmployee._id,
      purpose,
      status: 'PENDING_APPROVAL',
      expectedEntryTime: expected,
      expiryTime: expiry,
      autoDeleteAt,
      qrCodeData,
      barcodeValue,
      createdBy: req.user?._id || null,
    });

    if (govtIdNumber) {
      visitor.setSensitiveGovtId(govtIdNumber);
    }

    await visitor.save();

    await recordAuditLog({
      userId: req.user?._id || null,
      action: 'VISITOR_REGISTERED',
      module: 'VISITOR_MANAGEMENT',
      details: {
        passNumber,
        visitorName: fullName,
        hostEmployee: hostEmployee.employeeId,
        validityHours: hours,
        autoDeleteAt,
        createdByRole: req.user?.role?.name || 'Unknown',
      },
      req,
    });

    console.log(`[Visitor Controller] [201] Pass ${passNumber} registered by ${req.user?.email} — expires ${expiry.toISOString()} — auto-delete ${autoDeleteAt.toISOString()}`);

    return res.status(201).json({
      success: true,
      message: `Visitor Pass ${passNumber} registered and pending Security approval. Valid for ${hours} hours.`,
      data: { visitor },
    });
  } catch (error) {
    console.error('[Register Visitor Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to register visitor pass.' });
  }
};

/**
 * @route   DELETE /api/v1/visitors/cleanup-expired
 * @desc    Manually mark and purge PENDING/APPROVED passes past their expiryTime
 * @access  Private (Super Admin, HR/Admin)
 */
export const cleanupExpiredVisitors = async (req, res) => {
  try {
    const now = new Date();
    // Mark un-exited passes as EXPIRED first
    const markResult = await Visitor.updateMany(
      {
        expiryTime: { $lte: now },
        status: { $in: ['PENDING_APPROVAL', 'APPROVED', 'CHECKED_IN'] },
      },
      { $set: { status: 'EXPIRED' } }
    );

    // Hard-delete EXPIRED + CHECKED_OUT passes that are past autoDeleteAt
    const deleteResult = await Visitor.deleteMany({
      autoDeleteAt: { $lte: now },
      status: { $in: ['EXPIRED', 'CHECKED_OUT', 'REJECTED'] },
    });

    console.log(`[Visitor Cleanup] Marked ${markResult.modifiedCount} expired, deleted ${deleteResult.deletedCount} purged`);

    return res.status(200).json({
      success: true,
      message: `Cleanup complete. ${markResult.modifiedCount} passes marked EXPIRED, ${deleteResult.deletedCount} records permanently purged.`,
      data: { marked: markResult.modifiedCount, deleted: deleteResult.deletedCount },
    });
  } catch (error) {
    console.error('[Visitor Cleanup Error]:', error);
    return res.status(500).json({ success: false, message: 'Cleanup failed.' });
  }
};

/**
 * @route   PATCH /api/v1/visitors/:id/approval
 * @desc    Approve or reject visitor pass
 * @access  Private (Security Officer, HR/Admin, Super Admin)
 */
export const updateVisitorApproval = async (req, res) => {
  try {
    const { status, approvalNotes } = req.body; // APPROVED or REJECTED
    const visitor = await Visitor.findById(req.params.id).populate('employeeToVisit');

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor record not found.' });
    }

    visitor.status = status;
    visitor.approvalNotes = approvalNotes || '';
    visitor.hostUser = req.user._id;
    await visitor.save();

    await recordAuditLog({
      userId: req.user._id,
      action: status === 'APPROVED' ? 'VISITOR_APPROVED' : 'VISITOR_REJECTED',
      module: 'VISITOR_MANAGEMENT',
      details: { passNumber: visitor.passNumber, status, approvalNotes },
      req,
    });

    const hostName = visitor.employeeToVisit
      ? `${visitor.employeeToVisit.firstName} ${visitor.employeeToVisit.lastName}`
      : 'Enterprise Host';

    if (status === 'APPROVED') {
      sendVisitorApprovedEmail(visitor.email, visitor.fullName, visitor.passNumber, hostName, visitor.expectedEntryTime);
    } else if (status === 'REJECTED') {
      sendVisitorRejectedEmail(visitor.email, visitor.fullName, visitor.passNumber, approvalNotes);
    }

    return res.status(200).json({
      success: true,
      message: `Visitor Pass ${visitor.passNumber} ${status.toLowerCase()}.`,
      data: { visitor },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update visitor approval status.' });
  }
};

/**
 * @route   POST /api/v1/visitors/:id/check-in
 * @desc    Check-in visitor at security gate
 * @access  Private (Security Officer, Super Admin)
 */
export const checkInVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor record not found.' });
    }

    if (visitor.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in visitor with status '${visitor.status}'. Pass must be APPROVED.`,
      });
    }

    visitor.status = 'CHECKED_IN';
    visitor.entryTime = new Date();
    await visitor.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'VISITOR_CHECKED_IN',
      module: 'VISITOR_MANAGEMENT',
      details: { passNumber: visitor.passNumber, entryTime: visitor.entryTime },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Visitor ${visitor.fullName} (${visitor.passNumber}) checked in successfully.`,
      data: { visitor },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to check-in visitor.' });
  }
};

/**
 * @route   POST /api/v1/visitors/:id/check-out
 * @desc    Check-out visitor at security gate
 * @access  Private (Security Officer, Super Admin)
 */
export const checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor record not found.' });
    }

    visitor.status = 'CHECKED_OUT';
    visitor.exitTime = new Date();
    await visitor.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'VISITOR_CHECKED_OUT',
      module: 'VISITOR_MANAGEMENT',
      details: { passNumber: visitor.passNumber, exitTime: visitor.exitTime },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Visitor ${visitor.fullName} checked out successfully.`,
      data: { visitor },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to check-out visitor.' });
  }
};
