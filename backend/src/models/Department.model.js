import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    departmentHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

DepartmentSchema.index({ name: 1, branch: 1 }, { unique: true });

export default mongoose.model('Department', DepartmentSchema);
