import User from '../models/User.model.js';
import Employee from '../models/Employee.model.js';
import Role from '../models/Role.model.js';
import { recordAuditLog } from '../services/audit.service.js';
import { generateEmployeeId } from '../services/idGenerator.service.js';
import { createNotification } from '../services/notification.service.js';
import { sendWelcomeCredentialsEmail } from '../services/email.service.js';

/**
 * Computes predefined password: First 4 letters of name + Last 4 digits of phone number
 */
const generatePredefinedPasswordServer = (firstName = '', phone = '') => {
  const cleanName = (firstName || 'User').trim().replace(/[^a-zA-Z]/g, '');
  let namePart = cleanName.slice(0, 4);
  if (namePart.length < 4) {
    namePart = (namePart + 'User').slice(0, 4);
  }
  const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
  const digitsOnly = (phone || '').replace(/\D/g, '');
  const phonePart = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : '1234';
  return `${formattedName}${phonePart}`;
};

/**
 * @route   GET /api/v1/users
 * @desc    Get paginated, searchable list of system users
 * @access  Private (Super Admin, HR/Admin)
 */
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('role', 'name description')
        .populate('branch', 'name code')
        .populate('department', 'name code')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[User Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user list.' });
  }
};

/**
 * @route   GET /api/v1/users/roles
 * @desc    Get system roles list for dropdowns
 * @access  Private
 */
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: { roles },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch roles.' });
  }
};

/**
 * @route   POST /api/v1/users
 * @desc    Create new system user & unified employee record
 * @access  Private (Super Admin, HR/Admin)
 */
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,           // ObjectId of the Role document
      branch,
      department,
      phone,
      designation,
      avatarUrl,
      joiningDate,
      noticePeriodDays,
      bloodGroup,
      emergencyContact,
      address,
      status,
    } = req.body;

    // ── 1. Resolve role name for ID generation ──────────────────────────────
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected. Please choose a valid system role.',
      });
    }

    // ── 2. Predefined Password (First 4 letters of name + Last 4 digits of phone) ─
    const finalPassword = password && password.trim().length >= 6
      ? password.trim()
      : generatePredefinedPasswordServer(firstName, phone);

    // ── 3. Auto-generate Employee ID: [3-LETTER-CODE][YY][6-DIGIT-SEQ] ────
    const employeeId = await generateEmployeeId(roleDoc.name);

    console.log(`[ID Generator] Generated Employee ID: ${employeeId}  (role: ${roleDoc.name}, password: ${finalPassword})`);

    // ── 4. Guard against duplicates (email uniqueness) ──────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email already exists.',
      });
    }

    const parsedJoiningDate = joiningDate ? new Date(joiningDate) : new Date();
    const isFutureJoining = parsedJoiningDate > new Date();
    const computedStatus = isFutureJoining ? 'PRE_ACTIVATE' : (status || 'ACTIVE');

    // ── 5. Create System User with Full Details ──────────────────────────────
    const user = new User({
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: finalPassword,
      role,
      branch: branch || null,
      department: department || null,
      phone: phone || '',
      designation: designation || 'Staff Member',
      joiningDate: parsedJoiningDate,
      noticePeriodDays: noticePeriodDays ? parseInt(noticePeriodDays, 10) : 30,
      bloodGroup: bloodGroup || '',
      emergencyContact: emergencyContact || '',
      address: address || '',
      isVerified: true,
      status: computedStatus,
      avatarUrl: avatarUrl || '',
    });

    await user.save();

    // ── 6. Synchronize Unified Employee Record ──────────────────────────────
    const employee = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      avatarUrl: avatarUrl || '',
      designation: designation || 'Staff Member',
      branch: branch || null,
      department: department || null,
      joiningDate: parsedJoiningDate,
      noticePeriodDays: noticePeriodDays ? parseInt(noticePeriodDays, 10) : 30,
      status: computedStatus,
      lifecycleHistory: [
        {
          status: computedStatus,
          date: new Date(),
          reason: isFutureJoining ? 'Awaiting user portal manual activation (PRE_ACTIVATE state)' : 'Unified System User Account Provisioning',
          updatedBy: req.user._id,
        },
      ],
    });

    await recordAuditLog({
      userId: req.user._id,
      action: 'UNIFIED_USER_EMPLOYEE_CREATED',
      module: 'USER_MANAGEMENT',
      details: { email: user.email, role: roleDoc.name, employeeId },
      req,
    });

    // Send module notification & Real-time industrial email
    await createNotification({
      targetRole: 'HR/Admin',
      title: 'New User Account Provisioned',
      message: `User ${firstName} ${lastName} (${employeeId}) provisioned with role ${roleDoc.name}.`,
      type: 'USER_PROVISIONED',
      link: '/users',
    });

    sendWelcomeCredentialsEmail(
      user.email,
      `${firstName} ${lastName}`,
      employeeId,
      finalPassword,
      roleDoc.name
    );

    const userObj = user.toObject();
    delete userObj.password;

    console.log(`[User Controller] [201] User & Employee created: ${employeeId} (${email})`);

    return res.status(201).json({
      success: true,
      message: `Unified User & Employee account created successfully. ID: ${employeeId}. Predefined Password: ${finalPassword}`,
      data: { user: userObj, employee, employeeId, predefinedPassword: finalPassword },
    });
  } catch (error) {
    console.error('[Create User Error]:', error.message || error);
    return res.status(500).json({ success: false, message: 'Error creating user and employee account.' });
  }
};

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update system user details & role
 * @access  Private (Super Admin)
 */
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, role, branch, department, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (branch !== undefined) user.branch = branch || null;
    if (department !== undefined) user.department = department || null;
    if (status) user.status = status;

    await user.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'USER_UPDATED',
      module: 'USER_MANAGEMENT',
      details: { userId: user._id, email: user.email },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'User account updated successfully.',
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user account.' });
  }
};

/**
 * @route   POST /api/v1/users/:id/reset-password
 * @desc    Admin resets password for target user
 * @access  Private (Super Admin)
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.password = newPassword;
    await user.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'ADMIN_RESET_USER_PASSWORD',
      module: 'USER_MANAGEMENT',
      details: { targetUser: user.email },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.email}.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};
