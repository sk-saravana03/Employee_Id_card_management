import IdCard from '../models/IdCard.model.js';
import Employee from '../models/Employee.model.js';
import PrintQueue from '../models/PrintQueue.model.js';
import { recordAuditLog } from '../services/audit.service.js';
import { sendIdCardGeneratedEmail } from '../services/email.service.js';
import { createNotification } from '../services/notification.service.js';

/**
 * @route   GET /api/v1/id-cards
 * @desc    Get paginated ID card requests & issued cards
 * @access  Private
 */
export const getIdCards = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', template = '', status = '' } = req.query;
    const query = {};

    if (template) query.template = template;
    if (status) query.status = status;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ cardId: searchRegex }, { barcodeValue: searchRegex }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [idCards, total] = await Promise.all([
      IdCard.find(query)
        .populate({
          path: 'employee',
          populate: [{ path: 'branch' }, { path: 'department' }],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      IdCard.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        idCards,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[IdCard Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch ID card list.' });
  }
};

/**
 * @route   GET /api/v1/id-cards/my-request
 * @desc    Get active live ID card request for current employee
 * @access  Private
 */
export const getMyIdCardRequest = async (req, res) => {
  try {
    const empId = req.user.employeeId;
    const employee = await Employee.findOne({ employeeId: empId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const idCard = await IdCard.findOne({ employee: employee._id })
      .populate({
        path: 'employee',
        populate: [{ path: 'branch' }, { path: 'department' }],
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: { idCard },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ID card request status.' });
  }
};

/**
 * @route   GET /api/v1/id-cards/:id
 * @desc    Get ID card by ID with version history
 * @access  Private
 */
export const getIdCardById = async (req, res) => {
  try {
    const idCard = await IdCard.findById(req.params.id)
      .populate({
        path: 'employee',
        populate: [{ path: 'branch' }, { path: 'department' }],
      })
      .populate('versionHistory.createdBy', 'firstName lastName email');

    if (!idCard) {
      return res.status(404).json({ success: false, message: 'ID card record not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { idCard },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ID card details.' });
  }
};

/**
 * @route   POST /api/v1/id-cards/request
 * @desc    Stage 1: Employee/User initiates physical ID card request
 * @access  Private
 */
export const requestPhysicalCard = async (req, res) => {
  try {
    const { template = 'EXECUTIVE_CORPORATE', reason = 'New Physical ID Card Request' } = req.body;

    const employee = await Employee.findOne({
      $or: [{ email: req.user.email.toLowerCase() }, { employeeId: req.user.employeeId }],
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    let existingCard = await IdCard.findOne({ employee: employee._id }).sort({ version: -1 });

    const cardId = existingCard
      ? existingCard.cardId
      : `IDC-${employee.employeeId}-${Math.floor(100 + Math.random() * 900)}`;

    const version = existingCard ? existingCard.version + 1 : 1;
    const issueDate = new Date();
    const expiryDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000);

    const qrCodeData = JSON.stringify({
      cardId,
      empId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      v: version,
    });

    const barcodeValue = `*${employee.employeeId}*`;
    const digitalAccessUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/digital-id/${cardId}`;

    let idCard;
    if (existingCard) {
      existingCard.version = version;
      existingCard.template = template;
      existingCard.status = 'REQUESTED_PENDING_HR';
      existingCard.approvalWorkflow = {
        hrApproval: { status: 'PENDING', comment: '' },
        adminApproval: { status: 'PENDING', comment: '' },
        printingStatus: { status: 'QUEUED' },
      };
      existingCard.versionHistory.push({
        version,
        template,
        issuedAt: issueDate,
        reason,
        createdBy: req.user._id,
      });
      idCard = await existingCard.save();
    } else {
      idCard = await IdCard.create({
        cardId,
        employee: employee._id,
        version,
        template,
        qrCodeData,
        barcodeValue,
        issueDate,
        expiryDate,
        digitalAccessUrl,
        status: 'REQUESTED_PENDING_HR',
        approvalWorkflow: {
          hrApproval: { status: 'PENDING' },
          adminApproval: { status: 'PENDING' },
          printingStatus: { status: 'QUEUED' },
        },
        versionHistory: [
          {
            version: 1,
            template,
            issuedAt: issueDate,
            reason,
            createdBy: req.user._id,
          },
        ],
      });
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'PHYSICAL_ID_CARD_REQUESTED',
      module: 'ID_CARD_MANAGEMENT',
      details: { cardId, employeeId: employee.employeeId },
      req,
    });

    await createNotification({
      targetRole: 'HR/Admin',
      title: 'New Physical ID Card Request',
      message: `Employee ${employee.firstName} ${employee.lastName} (${employee.employeeId}) submitted a physical ID card request.`,
      type: 'ID_CARD_REQUEST',
      link: '/id-cards',
    });

    return res.status(201).json({
      success: true,
      message: `Physical ID Card request submitted successfully. Waiting for Manager/HR approval.`,
      data: { idCard },
    });
  } catch (error) {
    console.error('[Request Physical Card Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit physical ID card request.' });
  }
};

/**
 * @route   PATCH /api/v1/id-cards/:id/hr-approve
 * @desc    Stage 2: Manager / HR Approves ID Card Request
 * @access  Private (HR/Admin, Super Admin)
 */
export const hrApproveCard = async (req, res) => {
  try {
    const { comment = 'HR Approved' } = req.body;
    const idCard = await IdCard.findById(req.params.id).populate('employee');

    if (!idCard) {
      return res.status(404).json({ success: false, message: 'ID Card request not found.' });
    }

    idCard.status = 'APPROVED_BY_HR';
    idCard.approvalWorkflow.hrApproval = {
      status: 'APPROVED',
      approvedBy: req.user._id,
      approvedAt: new Date(),
      comment,
    };

    await idCard.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'ID_CARD_HR_APPROVED',
      module: 'ID_CARD_MANAGEMENT',
      details: { cardId: idCard.cardId },
      req,
    });

    await createNotification({
      targetRole: 'Super Admin',
      title: 'ID Card HR Approved - Pending Admin Review',
      message: `HR approved ID card request for ${idCard.employee?.firstName} ${idCard.employee?.lastName}. Pending Admin approval.`,
      type: 'HR_APPROVAL',
      link: '/id-cards',
    });

    return res.status(200).json({
      success: true,
      message: 'ID Card request approved by HR. Sent to Admin for final authorization.',
      data: { idCard },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process HR approval.' });
  }
};

/**
 * @route   PATCH /api/v1/id-cards/:id/admin-approve
 * @desc    Stage 3: Admin Approves ID Card Request & Dispatches to Print Queue
 * @access  Private (Super Admin)
 */
export const adminApproveCard = async (req, res) => {
  try {
    const { comment = 'Admin Approved' } = req.body;
    const idCard = await IdCard.findById(req.params.id).populate('employee');

    if (!idCard) {
      return res.status(404).json({ success: false, message: 'ID Card request not found.' });
    }

    idCard.status = 'APPROVED_BY_ADMIN';
    idCard.approvalWorkflow.adminApproval = {
      status: 'APPROVED',
      approvedBy: req.user._id,
      approvedAt: new Date(),
      comment,
    };

    await idCard.save();

    // Automatically send to Print Queue for Printer Operator
    const jobId = `PRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const reprintCounter = await PrintQueue.countDocuments({ employee: idCard.employee._id });

    await PrintQueue.create({
      jobId,
      idCard: idCard._id,
      employee: idCard.employee._id,
      requestType: 'NEW_ISSUE',
      reprintCounter,
      priority: 'HIGH',
      status: 'QUEUED',
      requestedBy: req.user._id,
    });

    await recordAuditLog({
      userId: req.user._id,
      action: 'ID_CARD_ADMIN_APPROVED',
      module: 'ID_CARD_MANAGEMENT',
      details: { cardId: idCard.cardId, jobId },
      req,
    });

    await createNotification({
      targetRole: 'Printer Operator',
      title: 'New Print Job Dispatched',
      message: `Admin authorized printing for ${idCard.employee?.firstName} ${idCard.employee?.lastName} (${idCard.cardId}).`,
      type: 'ADMIN_APPROVAL',
      link: '/print-queue',
    });

    return res.status(200).json({
      success: true,
      message: 'ID Card request authorized by Admin and sent to Printer Operator queue.',
      data: { idCard },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process Admin approval.' });
  }
};

/**
 * @route   PATCH /api/v1/id-cards/:id/print
 * @desc    Stage 4: Printer Operator updates print status to PRINTING or PRINTED
 * @access  Private (Printer Operator, Super Admin)
 */
export const markCardAsPrinted = async (req, res) => {
  try {
    const { status = 'PRINTED' } = req.body;
    const idCard = await IdCard.findById(req.params.id).populate('employee');

    if (!idCard) {
      return res.status(404).json({ success: false, message: 'ID Card not found.' });
    }

    idCard.status = status;
    idCard.approvalWorkflow.printingStatus = {
      status,
      printedBy: req.user._id,
      printedAt: new Date(),
    };

    await idCard.save();

    await recordAuditLog({
      userId: req.user._id,
      action: `ID_CARD_${status}`,
      module: 'ID_CARD_MANAGEMENT',
      details: { cardId: idCard.cardId },
      req,
    });

    if (status === 'PRINTED' || status === 'DELIVERED') {
      sendIdCardGeneratedEmail(
        idCard.employee?.email,
        `${idCard.employee?.firstName} ${idCard.employee?.lastName}`,
        idCard.cardId
      );

      await createNotification({
        targetRole: 'Employee',
        title: 'Physical ID Card Ready / Issued',
        message: `Your physical ID card (${idCard.cardId}) has been successfully printed and issued!`,
        type: 'PRINT_COMPLETED',
        link: '/id-cards',
      });
    }

    return res.status(200).json({
      success: true,
      message: `ID Card print status updated to ${status}.`,
      data: { idCard },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update printing status.' });
  }
};

/**
 * @route   PATCH /api/v1/id-cards/:id/reject
 * @desc    Reject physical ID card request
 * @access  Private (HR/Admin, Super Admin)
 */
export const rejectCardRequest = async (req, res) => {
  try {
    const { reason = 'Request rejected by authority' } = req.body;
    const idCard = await IdCard.findById(req.params.id).populate('employee');

    if (!idCard) {
      return res.status(404).json({ success: false, message: 'ID Card request not found.' });
    }

    idCard.status = 'REJECTED';
    await idCard.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'ID_CARD_REJECTED',
      module: 'ID_CARD_MANAGEMENT',
      details: { cardId: idCard.cardId, reason },
      req,
    });

    await createNotification({
      targetRole: 'Employee',
      title: 'Physical ID Card Request Rejected',
      message: `Your physical ID card request (${idCard.cardId}) was rejected. Reason: ${reason}`,
      type: 'SYSTEM',
      link: '/id-cards',
    });

    return res.status(200).json({
      success: true,
      message: 'ID Card request rejected.',
      data: { idCard },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reject ID card request.' });
  }
};

/**
 * Legacy generate helper for direct admin override
 */
export const generateIdCard = async (req, res) => {
  return requestPhysicalCard(req, res);
};

export const updateIdCardStatus = async (req, res) => {
  return markCardAsPrinted(req, res);
};
