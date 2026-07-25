import Document from '../models/Document.model.js';
import Employee from '../models/Employee.model.js';

export const getDocuments = async (req, res, next) => {
  try {
    const { employeeId, category } = req.query;
    let filter = {};

    if (employeeId) {
      const emp = await Employee.findOne({ employeeId });
      if (emp) filter.employee = emp._id;
    }

    if (category) {
      filter.category = category;
    }

    const docs = await Document.find(filter)
      .populate('employee', 'firstName lastName employeeId designation avatarUrl')
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { documents: docs },
    });
  } catch (err) {
    next(err);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const { employeeId, title, category, fileUrl, expiryDate, version } = req.body;

    let emp = null;
    if (employeeId) {
      emp = await Employee.findOne({ employeeId });
    } else {
      emp = await Employee.findOne({ user: req.user._id });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Target employee record not found.' });
    }

    const doc = await Document.create({
      employee: emp._id,
      title: title || `${category} Document`,
      category: category || 'OTHER',
      fileUrl: fileUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=400',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      version: version || 'v1.0',
      uploadedBy: req.user._id,
      status: 'VERIFIED',
    });

    await doc.populate('employee', 'firstName lastName employeeId designation avatarUrl');

    return res.status(201).json({
      success: true,
      message: 'Employee document registered & verified successfully.',
      data: { document: doc },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Document record removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};
