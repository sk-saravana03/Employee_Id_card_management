import Branch from '../models/Branch.model.js';
import Employee from '../models/Employee.model.js';
import User from '../models/User.model.js';
import { recordAuditLog } from '../services/audit.service.js';

/**
 * @route   GET /api/v1/branches
 * @desc    Get all branches with employee counts
 * @access  Private
 */
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate('branchAdmin', 'firstName lastName email')
      .sort({ name: 1 });

    // Attach total active employee counts
    const branchStats = await Promise.all(
      branches.map(async (b) => {
        const totalEmployees = await Employee.countDocuments({ branch: b._id });
        const activeEmployees = await Employee.countDocuments({ branch: b._id, status: 'ACTIVE' });
        return {
          ...b.toObject(),
          totalEmployees,
          activeEmployees,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { branches: branchStats },
    });
  } catch (error) {
    console.error('[Branch Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch branch list.',
    });
  }
};

/**
 * @route   GET /api/v1/branches/:id
 * @desc    Get single branch by ID
 * @access  Private
 */
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('branchAdmin', 'firstName lastName email');
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    const totalEmployees = await Employee.countDocuments({ branch: branch._id });

    return res.status(200).json({
      success: true,
      data: {
        branch: {
          ...branch.toObject(),
          totalEmployees,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve branch details.' });
  }
};

/**
 * @route   POST /api/v1/branches
 * @desc    Create new branch
 * @access  Private (Super Admin)
 */
export const createBranch = async (req, res) => {
  try {
    const { name, code, city, country, address, branchAdmin } = req.body;

    const existingCode = await Branch.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Branch code already in use.' });
    }

    const branch = await Branch.create({
      name,
      code: code.toUpperCase(),
      city: city || '',
      country: country || 'Global',
      address: address || '',
      branchAdmin: branchAdmin || null,
    });

    await recordAuditLog({
      userId: req.user._id,
      action: 'BRANCH_CREATED',
      module: 'BRANCH_MANAGEMENT',
      details: { branchName: branch.name, code: branch.code },
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Branch created successfully.',
      data: { branch },
    });
  } catch (error) {
    console.error('[Create Branch Error]:', error);
    return res.status(500).json({ success: false, message: 'Error creating branch.' });
  }
};

/**
 * @route   PUT /api/v1/branches/:id
 * @desc    Update branch details
 * @access  Private (Super Admin)
 */
export const updateBranch = async (req, res) => {
  try {
    const { name, city, country, address, branchAdmin, status } = req.body;
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    if (name) branch.name = name;
    if (city !== undefined) branch.city = city;
    if (country !== undefined) branch.country = country;
    if (address !== undefined) branch.address = address;
    if (branchAdmin !== undefined) branch.branchAdmin = branchAdmin || null;
    if (status) branch.status = status;

    await branch.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'BRANCH_UPDATED',
      module: 'BRANCH_MANAGEMENT',
      details: { branchId: branch._id, name: branch.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Branch updated successfully.',
      data: { branch },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update branch.' });
  }
};

/**
 * @route   DELETE /api/v1/branches/:id
 * @desc    Delete branch if empty
 * @access  Private (Super Admin)
 */
export const deleteBranch = async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments({ branch: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete branch. ${employeeCount} employees are currently assigned to this branch.`,
      });
    }

    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'BRANCH_DELETED',
      module: 'BRANCH_MANAGEMENT',
      details: { branchName: branch.name },
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Branch removed successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete branch.' });
  }
};
