import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['PASSPORT', 'NATIONAL_ID', 'EDUCATION_CERTIFICATE', 'TAX_FORM', 'EMPLOYMENT_CONTRACT', 'OTHER'],
      default: 'OTHER',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: 'v1.0',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['VERIFIED', 'PENDING_VALIDATION', 'EXPIRED', 'REJECTED'],
      default: 'PENDING_VALIDATION',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Document', DocumentSchema);
