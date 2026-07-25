import Department from '../models/Department.model.js';
import Employee from '../models/Employee.model.js';
import User from '../models/User.model.js';
import Role from '../models/Role.model.js';
import { recordAuditLog } from '../services/audit.service.js';
import { createNotification } from '../services/notification.service.js';

/**
 * Automatically updates user's department, branch, role, and designation when appointed as Department Head
 */
const assignDepartmentHeadDetails = async (userId, departmentObj) => {
  if (!userId) return;
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.department = departmentObj._id;
    user.branch = departmentObj.branch;
    user.designation = `${departmentObj.name} Department Head`;

    const hrRole = await Role.findOne({ name: 'HR/Admin' });
    if (hrRole && user.role?.toString() !== hrRole._id.toString()) {
      user.role = hrRole._id;
    }

    await user.save();

    const emp = await Employee.findOne({ email: user.email });
    if (emp) {
      emp.department = departmentObj._id;
      emp.branch = departmentObj.branch;
      emp.designation = user.designation;
      await emp.save();
    }

    await createNotification({
      recipient: user._id,
      title: 'Appointed as Department Head',
      message: `You have been appointed as Department Head of ${departmentObj.name}. Your system role and department context have been updated.`,
      type: 'SYSTEM',
      link: '/departments',
    });
    console.log(`[Department Controller] User ${user.email} appointed as Head of ${departmentObj.name}`);
  } catch (err) {
    console.error('[Assign Dept Head Error]:', err);
  }
};

/**
 * @route   GET /api/v1/departments
 * @desc    Get departments with employee counts
 * @access  Private
 */
export const getDepartments = async (req, res) => {
  try {
    const { branch } = req.query;
    const query = {};

    if (branch) {
      query.branch = branch;
    }

    const departments = await Department.find(query)
      .populate('branch', 'name code')
      .populate('departmentHead', 'firstName lastName email')
      .sort({ name: 1 });

    const departmentStats = await Promise.all(
      departments.map(async (d) => {
        const totalEmployees = await Employee.countDocuments({ department: d._id });
        const activeEmployees = await Employee.countDocuments({ department: d._id, status: 'ACTIVE' });
        return {
          ...d.toObject(),
          totalEmployees,
          activeEmployees,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { departments: departmentStats },
    });
  } catch (error) {
    console.error('[Department Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch departments.',
    });
  }
};

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Get department by ID
 * @access  Private
 */
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('branch')
      .populate('departmentHead', 'firstName lastName email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const totalEmployees = await Employee.countDocuments({ department: department._id });

    return res.status(200).json({
      success: true,
      data: {
        department: {
          ...department.toObject(),
          totalEmployees,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve department.' });
  }
};

/**
 * @route   POST /api/v1/departments
 * @desc    Create new department
 * @access  Private (Super Admin, HR/Admin)
 */
export const createDepartment = async (req, res) => {
  try {
    const { name, code, branch, description, departmentHead } = req.body;

    const existing = await Department.findOne({ name, branch });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists in the selected branch.',
      });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      branch,
      description: description || '',
      departmentHead: departmentHead || null,
    });

    if (departmentHead) {
      await assignDepartmentHeadDetails(departmentHead, department);
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'DEPARTMENT_CREATED',
      module: 'DEPARTMENT_MANAGEMENT',
      details: { departmentName: department.name, branchId: branch },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: { department },
    });
  } catch (error) {
    console.error('[Create Department Error]:', error);
    return res.status(500).json({ success: false, message: 'Error creating department.' });
  }
};

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department
 * @access  Private (Super Admin, HR/Admin)
 */
export const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, departmentHead, status } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (departmentHead !== undefined) {
      department.departmentHead = departmentHead || null;
      if (departmentHead) {
        await assignDepartmentHeadDetails(departmentHead, department);
      }
    }
    if (status) department.status = status;

    await department.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'DEPARTMENT_UPDATED',
      module: 'DEPARTMENT_MANAGEMENT',
      details: { departmentId: department._id, name: department.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: { department },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update department.' });
  }
};

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Delete department
 * @access  Private (Super Admin)
 */
export const deleteDepartment = async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${employeeCount} employees are assigned to this department.`,
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'DEPARTMENT_DELETED',
      module: 'DEPARTMENT_MANAGEMENT',
      details: { departmentName: department.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete department.' });
  }
};
