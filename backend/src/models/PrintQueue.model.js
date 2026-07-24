import mongoose from 'mongoose';

const PrintQueueSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    idCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IdCard',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    printer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrinterHardware',
    },
    requestType: {
      type: String,
      enum: ['NEW_ISSUE', 'REPRINT_LOST', 'REPRINT_DAMAGED', 'REPRINT_UPDATED_INFO'],
      default: 'NEW_ISSUE',
    },
    reprintReason: {
      type: String,
      default: '',
    },
    reprintCounter: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    status: {
      type: String,
      enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'QUEUED',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    errorLog: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

PrintQueueSchema.index({ jobId: 1, status: 1, employee: 1 });

export default mongoose.model('PrintQueue', PrintQueueSchema);
