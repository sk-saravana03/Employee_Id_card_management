import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means broadcast to targetRole
    },
    targetRole: {
      type: String,
      default: '', // e.g. 'HR/Admin', 'Super Admin', 'Printer Operator', 'Employee'
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'ID_CARD_REQUEST',
        'HR_APPROVAL',
        'ADMIN_APPROVAL',
        'PRINT_COMPLETED',
        'USER_PROVISIONED',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    link: {
      type: String,
      default: '/dashboard',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, targetRole: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
