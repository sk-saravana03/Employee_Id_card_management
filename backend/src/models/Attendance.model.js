import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    scanType: {
      type: String,
      enum: ['QR_SCAN', 'BARCODE_SCAN', 'MANUAL_ENTRY', 'BIOMETRIC'],
      default: 'QR_SCAN',
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EARLY_LEAVE'],
      default: 'PRESENT',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employee: 1, date: 1 });

export default mongoose.model('Attendance', AttendanceSchema);
