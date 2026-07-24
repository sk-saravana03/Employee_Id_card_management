import mongoose from 'mongoose';
import { encryptAES256, decryptAES256 } from '../utils/encryption.util.js';

const VisitorSchema = new mongoose.Schema(
  {
    passNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: 'Independent Visitor',
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    govtIdType: {
      type: String,
      default: 'Driver License',
    },
    govtIdNumberEncrypted: {
      type: String,
      default: '',
    },
    employeeToVisit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    hostUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    purpose: {
      type: String,
      enum: ['MEETING', 'INTERVIEW', 'VENDOR', 'DELIVERY', 'MAINTENANCE', 'OTHER'],
      default: 'MEETING',
    },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CHECKED_IN', 'CHECKED_OUT', 'EXPIRED'],
      default: 'PENDING_APPROVAL',
    },
    expectedEntryTime: {
      type: Date,
      required: true,
    },
    entryTime: {
      type: Date,
      default: null,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    expiryTime: {
      type: Date,
      required: true,
    },
    qrCodeData: {
      type: String,
      default: '',
    },
    barcodeValue: {
      type: String,
      default: '',
    },
    approvalNotes: {
      type: String,
      default: '',
    },
    // Track which Security Officer created this visitor pass
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // deletedAt: after expiry + grace period, the TTL index removes this document automatically
    autoDeleteAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

VisitorSchema.methods.setSensitiveGovtId = function (plainId) {
  this.govtIdNumberEncrypted = encryptAES256(plainId);
};

VisitorSchema.methods.getDecryptedGovtId = function () {
  return decryptAES256(this.govtIdNumberEncrypted);
};

VisitorSchema.index({ passNumber: 1, status: 1, employeeToVisit: 1 });
// TTL index: MongoDB auto-deletes visitor documents 24 hours after their autoDeleteAt timestamp
// autoDeleteAt is set to expiryTime + 24h grace period when the pass is first created
VisitorSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Visitor', VisitorSchema);
