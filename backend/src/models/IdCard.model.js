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
      enum: ['DRAFT', 'REQUESTED', 'APPROVED', 'PRINTING', 'PRINTED', 'DELIVERED', 'REVOKED'],
      default: 'REQUESTED',
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
