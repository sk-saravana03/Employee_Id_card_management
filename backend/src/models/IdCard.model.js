import mongoose from 'mongoose';

const IdCardSchema = new mongoose.Schema(
  {
    cardId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    template: {
      type: String,
      enum: ['EXECUTIVE_CORPORATE', 'MODERN_MINIMALIST', 'TECH_DARK', 'SECURITY_STANDARD'],
      default: 'EXECUTIVE_CORPORATE',
    },
    qrCodeData: {
      type: String,
      default: '',
    },
    barcodeValue: {
      type: String,
      default: '',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    digitalAccessUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'REQUESTED_PENDING_HR',
        'APPROVED_BY_HR',
        'APPROVED_BY_ADMIN',
        'PRINTING',
        'PRINTED',
        'DELIVERED',
        'REJECTED',
        'REVOKED',
      ],
      default: 'REQUESTED_PENDING_HR',
    },
    approvalWorkflow: {
      hrApproval: {
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        comment: { type: String, default: '' },
      },
      adminApproval: {
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        comment: { type: String, default: '' },
      },
      printingStatus: {
        status: { type: String, enum: ['QUEUED', 'PRINTING', 'PRINTED', 'DELIVERED'], default: 'QUEUED' },
        printedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        printedAt: Date,
      },
    },
    versionHistory: [
      {
        version: { type: Number, required: true },
        template: { type: String, required: true },
        issuedAt: { type: Date, default: Date.now },
        reason: { type: String, default: 'Card re-issuance' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

IdCardSchema.index({ cardId: 1, employee: 1, status: 1 });

export default mongoose.model('IdCard', IdCardSchema);
