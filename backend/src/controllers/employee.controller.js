import Employee from '../models/Employee.model.js';
import User from '../models/User.model.js';
import Role from '../models/Role.model.js';
import { calculateEmployeeStatus, syncEmployeeLifecycles } from '../services/lifecycle.service.js';
import { recordAuditLog } from '../services/audit.service.js';
import { generateEmployeeId } from '../services/idGenerator.service.js';

/**
 * @route   GET /api/v1/employees
 * @desc    Get paginated, sorted, filtered employee list with advanced search
 * @access  Private
 */
export const getEmployees = async (req, res) => {
  try {
    // Run automated lifecycle check first
    await syncEmployeeLifecycles();

    const {
      page = 1,
      limit = 10,
      search = '',
      branch = '',
      department = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Branch Access Filter for non-Super Admin users
    if (req.user.role?.name !== 'Super Admin' && req.user.branch) {
      query.branch = req.user.branch;
    } else if (branch) {
      query.branch = branch;
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { designation: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Retrieve employees from User database as single source of truth
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('branch', 'name code city')
        .populate('department', 'name code')
        .populate('role', 'name description')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(query),
    ]);

    // Format users into employee records structure expected by UI
    const employees = users.map((u) => {
      const obj = u.toObject();
      return {
        _id: obj._id,
        employeeId: obj.employeeId,
        firstName: obj.firstName,
        lastName: obj.lastName,
        email: obj.email,
        phone: obj.phone || '',
        avatarUrl: obj.avatarUrl || '',
        designation: obj.designation || 'Staff Member',
        branch: obj.branch,
        department: obj.department,
        role: obj.role,
        joiningDate: obj.joiningDate || obj.createdAt,
        noticePeriodDays: obj.noticePeriodDays || 30,
        status: obj.status || 'ACTIVE',
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('[Employee Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee directory.',
    });
  }
};

/**
 * @route   GET /api/v1/employees/:id
 * @desc    Get employee details by ID
 * @access  Private
 */
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('branch')
      .populate('department')
      .populate('lifecycleHistory.updatedBy', 'firstName lastName email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee details.',
    });
  }
};

/**
 * @route   POST /api/v1/employees
 * @desc    Create new employee record
 * @access  Private (HR/Admin, Super Admin)
 */
export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      avatarUrl,
      designation,
      department,
      branch,
      joiningDate,
      noticePeriodDays,
      terminationDate,
      // Optional: system login credentials for unified provisioning
      role,
      password,
      status: statusOverride,
    } = req.body;

    // ── 1. Check for duplicate email ──────────────────────────────────────
    const existingEmp = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists.',
      });
    }

    // ── 2. Resolve role for ID generation ─────────────────────────────────
    //    If role is provided, use its name. Otherwise default to 'Employee'.
    let roleDoc = null;
    let roleName = 'Employee';
    if (role) {
      roleDoc = await Role.findById(role);
      if (roleDoc) roleName = roleDoc.name;
    }

    // ── 3. Auto-generate Employee ID ──────────────────────────────────────
    const employeeId = await generateEmployeeId(roleName);
    console.log(`[ID Generator] Employee Directory add → ID: ${employeeId}  (role: ${roleName})`);

    // ── 4. Build and create Employee record ───────────────────────────────
    const empData = {
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      avatarUrl: avatarUrl || '',
      designation: designation || 'Staff Member',
      department: department || null,
      branch: branch || null,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      noticePeriodDays: noticePeriodDays ? parseInt(noticePeriodDays, 10) : 30,
      terminationDate: terminationDate ? new Date(terminationDate) : null,
    };

    const initialStatus = calculateEmployeeStatus(empData);
    empData.status = statusOverride || initialStatus;
    empData.lifecycleHistory = [
      {
        status: empData.status,
        date: new Date(),
        reason: 'Initial Employee Onboarding Record',
        updatedBy: req.user._id,
      },
    ];

    const employee = await Employee.create(empData);

    // ── 5. Optionally create a linked system User account ─────────────────
    //    Triggered when the form includes a role + password (unified mode)
    let user = null;
    if (role && password) {
      try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (!existingUser) {
          user = await User.create({
            employeeId,
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            role,
            branch: branch || null,
            department: department || null,
            avatarUrl: avatarUrl || '',
            isVerified: true,
            status: 'ACTIVE',
          });
          console.log(`[Employee Controller] Linked User account created: ${email}`);
        }
      } catch (userErr) {
        // Don't block employee creation if user provisioning fails
        console.warn('[Employee Controller] User account creation skipped:', userErr.message);
      }
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'EMPLOYEE_CREATED',
      module: 'EMPLOYEE_MANAGEMENT',
      details: { employeeId: employee.employeeId, email: employee.email, linkedUser: !!user },
      req,
    });

    console.log(`[Employee Controller] [201] Employee created: ${employeeId} (${email})`);

    return res.status(201).json({
      success: true,
      message: `Employee record created successfully. ID: ${employeeId}`,
      data: { employee, user: user ? { _id: user._id, employeeId, email } : null, employeeId },
    });
  } catch (error) {
    console.error('[Create Employee Error]:', error.message || error);
    return res.status(500).json({
      success: false,
      message: 'Error creating employee record.',
    });
  }
};

/**
 * @route   PUT /api/v1/employees/:id
 * @desc    Update employee information
 * @access  Private (HR/Admin, Super Admin)
 */
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    const fieldsToUpdate = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'avatarUrl',
      'designation',
      'department',
      'branch',
      'noticePeriodDays',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    });

    if (req.body.joiningDate) {
      employee.joiningDate = new Date(req.body.joiningDate);
    }

    if (req.body.terminationDate !== undefined) {
      employee.terminationDate = req.body.terminationDate ? new Date(req.body.terminationDate) : null;
    }

    // Recalculate status based on potential date updates
    const newStatus = calculateEmployeeStatus(employee);
    if (newStatus !== employee.status) {
      employee.status = newStatus;
      employee.lifecycleHistory.push({
        status: newStatus,
        date: new Date(),
        reason: 'Status updated via details modification',
        updatedBy: req.user._id,
      });
    }

    await employee.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'EMPLOYEE_UPDATED',
      module: 'EMPLOYEE_MANAGEMENT',
      details: { employeeId: employee.employeeId },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      data: { employee },
    });
  } catch (error) {
    console.error('[Update Employee Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee details.',
    });
  }
};

/**
 * @route   PATCH /api/v1/employees/:id/status
 * @desc    Manually override employee status (e.g. Move to ARCHIVED or NOTICE_PERIOD)
 * @access  Private (Super Admin, HR/Admin)
 */
export const updateEmployeeStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    employee.status = status;
    employee.lifecycleHistory.push({
      status,
      date: new Date(),
      reason: reason || 'Manual status change by administrator',
      updatedBy: req.user._id,
    });

    await employee.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'EMPLOYEE_STATUS_CHANGED',
      module: 'EMPLOYEE_MANAGEMENT',
      details: { employeeId: employee.employeeId, newStatus: status, reason },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Employee status updated to ${status}.`,
      data: { employee },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update status.',
    });
  }
};

/**
 * @route   POST /api/v1/employees/bulk-import
 * @desc    Bulk import employees from JSON dataset parsed from CSV
 * @access  Private (Super Admin, HR/Admin)
 */
export const bulkImportEmployees = async (req, res) => {
  try {
    const { employees = [] } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid employee dataset provided for bulk import.',
      });
    }

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < employees.length; i++) {
      const item = employees[i];
      try {
        if (!item.employeeId || !item.firstName || !item.lastName || !item.email || !item.branch || !item.department) {
          errors.push(`Row ${i + 1}: Missing required fields (Employee ID, Name, Email, Branch, Department).`);
          continue;
        }

        const existing = await Employee.findOne({
          $or: [{ employeeId: item.employeeId.toUpperCase() }, { email: item.email.toLowerCase() }],
        });

        if (existing) {
          errors.push(`Row ${i + 1}: Employee ID '${item.employeeId}' or Email '${item.email}' already exists.`);
          continue;
        }

        const empData = {
          employeeId: item.employeeId.toUpperCase(),
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email.toLowerCase(),
          phone: item.phone || '',
          designation: item.designation || 'Staff Member',
          department: item.department,
          branch: item.branch,
          joiningDate: item.joiningDate ? new Date(item.joiningDate) : new Date(),
          noticePeriodDays: item.noticePeriodDays ? parseInt(item.noticePeriodDays, 10) : 30,
        };

        const initialStatus = calculateEmployeeStatus(empData);
        empData.status = initialStatus;
        empData.lifecycleHistory = [
          {
            status: initialStatus,
            date: new Date(),
            reason: 'Bulk CSV Batch Import',
            updatedBy: req.user._id,
          },
        ];

        await Employee.create(empData);
        successCount++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'EMPLOYEE_BULK_IMPORT',
      module: 'EMPLOYEE_MANAGEMENT',
      details: { totalAttempted: employees.length, successCount, errorCount: errors.length },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Bulk import processed. ${successCount} employees created successfully.`,
      data: {
        totalAttempted: employees.length,
        successCount,
        errorCount: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error('[Bulk Import Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process bulk employee import.',
    });
  }
};

/**
 * @route   DELETE /api/v1/employees/:id
 * @desc    Delete/Archive employee record
 * @access  Private (Super Admin)
 */
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      userId: req.user._id,
      action: 'EMPLOYEE_DELETED',
      module: 'EMPLOYEE_MANAGEMENT',
      details: { employeeId: employee.employeeId },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Employee record removed.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete employee.',
    });
  }
};
