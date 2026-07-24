import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      default: 'GENERAL',
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING',
    },
    errorDetails: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('EmailLog', EmailLogSchema);
