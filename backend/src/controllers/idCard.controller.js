import IdCard from '../models/IdCard.model.js';
import Employee from '../models/Employee.model.js';
import PrintQueue from '../models/PrintQueue.model.js';
import { recordAuditLog } from '../services/audit.service.js';
import { sendIdCardGeneratedEmail } from '../services/email.service.js';

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
 * @route   POST /api/v1/id-cards/generate
 * @desc    Generate / Request new ID Card for employee
 * @access  Private (Super Admin, HR/Admin)
 */
export const generateIdCard = async (req, res) => {
  try {
    const { employeeId, template = 'EXECUTIVE_CORPORATE', expiryYears = 3 } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Check if card already exists
    let existingCard = await IdCard.findOne({ employee: employee._id }).sort({ version: -1 });

    const cardId = existingCard
      ? existingCard.cardId
      : `IDC-${employee.employeeId}-${Math.floor(100 + Math.random() * 900)}`;

    const version = existingCard ? existingCard.version + 1 : 1;
    const issueDate = new Date();
    const expiryDate = new Date(Date.now() + expiryYears * 365 * 24 * 60 * 60 * 1000);

    const qrCodeData = JSON.stringify({
      cardId,
      empId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      issueDate: issueDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      v: version,
    });

    const barcodeValue = `*${employee.employeeId}*`;
    const digitalAccessUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/digital-id/${cardId}`;

    let idCard;
    if (existingCard) {
      existingCard.version = version;
      existingCard.template = template;
      existingCard.qrCodeData = qrCodeData;
      existingCard.barcodeValue = barcodeValue;
      existingCard.issueDate = issueDate;
      existingCard.expiryDate = expiryDate;
      existingCard.digitalAccessUrl = digitalAccessUrl;
      existingCard.status = 'REQUESTED';
      existingCard.versionHistory.push({
        version,
        template,
        issuedAt: issueDate,
        reason: 'Re-issuance request',
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
        status: 'REQUESTED',
        versionHistory: [
          {
            version: 1,
            template,
            issuedAt: issueDate,
            reason: 'Initial ID Card Generation',
            createdBy: req.user._id,
          },
        ],
      });
    }

    // Automatically send to Print Queue
    const jobId = `PRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const reprintCounter = await PrintQueue.countDocuments({ employee: employee._id });

    await PrintQueue.create({
      jobId,
      idCard: idCard._id,
      employee: employee._id,
      requestType: existingCard ? 'REPRINT_UPDATED_INFO' : 'NEW_ISSUE',
      reprintCounter,
      priority: 'NORMAL',
      status: 'QUEUED',
      requestedBy: req.user._id,
    });

    await recordAuditLog({
      userId: req.user._id,
      action: 'ID_CARD_GENERATED',
      module: 'ID_CARD_MANAGEMENT',
      details: { cardId, employeeId: employee.employeeId, version },
      req,
    });

    // Send email notification
    sendIdCardGeneratedEmail(employee.email, `${employee.firstName} ${employee.lastName}`, cardId);

    return res.status(201).json({
      success: true,
      message: `ID Card ${cardId} (v${version}) generated and queued for printing.`,
      data: { idCard },
    });
  } catch (error) {
    console.error('[Generate ID Card Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate ID card.' });
  }
};

/**
 * @route   PATCH /api/v1/id-cards/:id/status
 * @desc    Update ID card status
 * @access  Private (Super Admin, HR/Admin, Printer Operator)
 */
export const updateIdCardStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const idCard = await IdCard.findById(req.params.id).populate('employee');

    if (!idCard) {
      return res.status(404).json({ success: false, message: 'ID card not found.' });
    }

    idCard.status = status;
    await idCard.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'ID_CARD_STATUS_UPDATED',
      module: 'ID_CARD_MANAGEMENT',
      details: { cardId: idCard.cardId, newStatus: status },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `ID Card status updated to ${status}.`,
      data: { idCard },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update ID card status.' });
  }
};
