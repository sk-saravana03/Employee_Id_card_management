import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    noticePeriodDays: {
      type: Number,
      default: 0,
    },
    terminationDate: {
      type: Date,
      default: null,
    },
    isIntern: {
      type: Boolean,
      default: false,
    },
    internshipEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'RECRUITMENT',
        'WAITING_FOR_JOINING',
        'ACTIVE',
        'NOTICE_PERIOD',
        'AUTO_DEACTIVATED',
        'ARCHIVED',
        'ARCHIVED_PAST_EMPLOYEE',
        'INTERNSHIP_EXPIRED',
        'INACTIVE',
      ],
      default: 'ACTIVE',
    },
    lifecycleHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          default: 'System State Transition',
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

EmployeeSchema.index({ employeeId: 1, email: 1 });
EmployeeSchema.index({ branch: 1, department: 1, status: 1 });

export default mongoose.model('Employee', EmployeeSchema);
