import Attendance from '../models/Attendance.model.js';
import Employee from '../models/Employee.model.js';

export const checkInAttendance = async (req, res, next) => {
  try {
    const { employeeId, scanType = 'QR_SCAN', remarks = '' } = req.body;
    let emp = null;

    if (employeeId) {
      emp = await Employee.findOne({ employeeId });
    } else {
      emp = await Employee.findOne({ user: req.user._id });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let existing = await Attendance.findOne({
      employee: emp._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee already checked in for today.',
        data: { attendance: existing },
      });
    }

    const now = new Date();
    const isLate = now.getHours() >= 10;

    const attendance = await Attendance.create({
      employee: emp._id,
      date: now,
      checkInTime: now,
      scanType,
      status: isLate ? 'LATE' : 'PRESENT',
      remarks,
    });

    await attendance.populate('employee', 'firstName lastName employeeId designation department branch avatarUrl');

    return res.status(201).json({
      success: true,
      message: `Check-in recorded for ${emp.firstName} ${emp.lastName} (${isLate ? 'LATE' : 'ON-TIME'})`,
      data: { attendance },
    });
  } catch (err) {
    next(err);
  }
};

export const checkOutAttendance = async (req, res, next) => {
  try {
    const { employeeId } = req.body;
    let emp = null;

    if (employeeId) {
      emp = await Employee.findOne({ employeeId });
    } else {
      emp = await Employee.findOne({ user: req.user._id });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: emp._id,
      date: { $gte: todayStart },
      checkOutTime: null,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in session found for today.',
      });
    }

    const now = new Date();
    attendance.checkOutTime = now;
    const diffHours = (now - attendance.checkInTime) / (1000 * 60 * 60);
    attendance.workingHours = parseFloat(diffHours.toFixed(2));

    if (diffHours < 4) {
      attendance.status = 'HALF_DAY';
    }

    await attendance.save();
    await attendance.populate('employee', 'firstName lastName employeeId designation department branch avatarUrl');

    return res.status(200).json({
      success: true,
      message: `Check-out recorded. Total Working Hours: ${attendance.workingHours}h`,
      data: { attendance },
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceLogs = async (req, res, next) => {
  try {
    const { search, date, status } = req.query;
    let filter = {};

    if (date) {
      const selected = new Date(date);
      const start = new Date(selected.setHours(0, 0, 0, 0));
      const end = new Date(selected.setHours(23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }

    if (status) {
      filter.status = status;
    }

    const logs = await Attendance.find(filter)
      .populate('employee', 'firstName lastName employeeId designation department branch avatarUrl')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: { attendanceLogs: logs },
    });
  } catch (err) {
    next(err);
  }
};
