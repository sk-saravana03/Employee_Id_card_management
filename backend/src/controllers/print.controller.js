import PrintQueue from '../models/PrintQueue.model.js';
import PrinterHardware from '../models/PrinterHardware.model.js';
import IdCard from '../models/IdCard.model.js';
import Employee from '../models/Employee.model.js';
import Branch from '../models/Branch.model.js';
import { recordAuditLog } from '../services/audit.service.js';
import { sendPrintCompletedEmail } from '../services/email.service.js';

/**
 * @route   GET /api/v1/print/queue
 * @desc    Get print queue jobs
 * @access  Private
 */
export const getPrintQueue = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', priority = '' } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [jobs, total] = await Promise.all([
      PrintQueue.find(query)
        .populate({
          path: 'idCard',
          populate: { path: 'employee' },
        })
        .populate('employee')
        .populate('printer')
        .populate('requestedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      PrintQueue.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[Print Queue Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch print queue.' });
  }
};

/**
 * @route   GET /api/v1/print/hardware
 * @desc    Get live printer hardware telemetry list
 * @access  Private
 */
export const getPrinterHardware = async (req, res) => {
  try {
    let printers = await PrinterHardware.find().populate('branch', 'name code');

    // If database has no printers seeded, seed a default hardware unit
    if (printers.length === 0) {
      const defaultBranch = await Branch.findOne();
      if (defaultBranch) {
        const defaultPrinter = await PrinterHardware.create({
          printerName: 'HQ Master Card Printer #1',
          modelNumber: 'Evolis Primacy 2 Dual-Sided',
          branch: defaultBranch._id,
          ipAddress: '192.168.1.100',
          status: 'ONLINE',
          ribbonLevelPercent: 88,
          cardStockRemaining: 235,
          totalCardsPrinted: 142,
          isPaused: false,
        });
        printers = [await defaultPrinter.populate('branch', 'name code')];
      }
    }

    return res.status(200).json({
      success: true,
      data: { printers },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch printer status.' });
  }
};

/**
 * @route   PATCH /api/v1/print/hardware/:id/toggle-pause
 * @desc    Pause or resume printer queue
 * @access  Private (Super Admin, Printer Operator)
 */
export const togglePrinterPause = async (req, res) => {
  try {
    const printer = await PrinterHardware.findById(req.params.id);
    if (!printer) {
      return res.status(404).json({ success: false, message: 'Printer not found.' });
    }

    printer.isPaused = !printer.isPaused;
    printer.status = printer.isPaused ? 'PAUSED' : 'ONLINE';
    await printer.save();

    await recordAuditLog({
      userId: req.user._id,
      action: printer.isPaused ? 'PRINTER_PAUSED' : 'PRINTER_RESUMED',
      module: 'PRINT_MANAGEMENT',
      details: { printerName: printer.printerName, isPaused: printer.isPaused },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Printer ${printer.printerName} is now ${printer.isPaused ? 'PAUSED' : 'RESUMED (ONLINE)'}.`,
      data: { printer },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle printer state.' });
  }
};

/**
 * @route   POST /api/v1/print/jobs/:id/process
 * @desc    Process print job (QUEUED -> PROCESSING -> COMPLETED)
 * @access  Private (Printer Operator, Super Admin)
 */
export const processPrintJob = async (req, res) => {
  try {
    const job = await PrintQueue.findById(req.params.id)
      .populate('idCard')
      .populate('employee');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Print job not found.' });
    }

    let printer = await PrinterHardware.findOne();
    if (!printer) {
      const branch = await Branch.findOne();
      printer = await PrinterHardware.create({
        printerName: 'HQ Master Card Printer #1',
        branch: branch._id,
      });
    }

    if (printer.isPaused) {
      return res.status(400).json({
        success: false,
        message: 'Printer hardware is currently PAUSED. Please resume the printer to process jobs.',
      });
    }

    if (printer.cardStockRemaining <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Printer card stock is depleted (0 remaining). Refill card stock to continue.',
      });
    }

    // Complete job
    job.status = 'COMPLETED';
    job.completedAt = new Date();
    job.printer = printer._id;
    await job.save();

    // Update ID card status to PRINTED
    if (job.idCard) {
      const idCard = await IdCard.findById(job.idCard._id);
      if (idCard) {
        idCard.status = 'PRINTED';
        await idCard.save();
      }
    }

    // Update printer telemetry
    printer.cardStockRemaining = Math.max(0, printer.cardStockRemaining - 1);
    printer.ribbonLevelPercent = Math.max(0, printer.ribbonLevelPercent - 1);
    printer.totalCardsPrinted += 1;
    await printer.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'PRINT_JOB_COMPLETED',
      module: 'PRINT_MANAGEMENT',
      details: { jobId: job.jobId, employeeId: job.employee?.employeeId },
      req,
    });

    if (job.employee?.email) {
      sendPrintCompletedEmail(
        job.employee.email,
        `${job.employee.firstName} ${job.employee.lastName}`,
        job.idCard?.cardId || 'ID Badge',
        job.jobId
      );
    }

    return res.status(200).json({
      success: true,
      message: `Print Job ${job.jobId} completed successfully. Badge printed!`,
      data: { job, printer },
    });
  } catch (error) {
    console.error('[Process Print Job Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to process print job.' });
  }
};

/**
 * @route   POST /api/v1/print/reprint
 * @desc    Request card reprint for employee with reprint counter tracking
 * @access  Private (Super Admin, HR/Admin)
 */
export const requestReprint = async (req, res) => {
  try {
    const { employeeId, requestType = 'REPRINT_DAMAGED', reprintReason, priority = 'NORMAL' } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const idCard = await IdCard.findOne({ employee: employee._id }).sort({ version: -1 });
    if (!idCard) {
      return res.status(404).json({
        success: false,
        message: 'No existing ID Card record found for this employee. Generate an ID card first.',
      });
    }

    // Calculate reprint counter for this employee
    const reprintCounter = (await PrintQueue.countDocuments({ employee: employee._id })) + 1;
    const jobId = `PRN-RPT-${Math.floor(10000 + Math.random() * 90000)}`;

    const printJob = await PrintQueue.create({
      jobId,
      idCard: idCard._id,
      employee: employee._id,
      requestType,
      reprintReason: reprintReason || 'Reprint requested',
      reprintCounter,
      priority,
      status: 'QUEUED',
      requestedBy: req.user._id,
    });

    idCard.status = 'REQUESTED';
    await idCard.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'CARD_REPRINT_REQUESTED',
      module: 'PRINT_MANAGEMENT',
      details: { jobId, employeeId: employee.employeeId, reprintCounter, reason: reprintReason },
      req,
    });

    return res.status(201).json({
      success: true,
      message: `Reprint Job ${jobId} queued (Reprint Count: ${reprintCounter}).`,
      data: { printJob },
    });
  } catch (error) {
    console.error('[Request Reprint Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to request reprint.' });
  }
};
