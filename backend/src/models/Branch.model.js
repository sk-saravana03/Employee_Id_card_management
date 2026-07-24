import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    city: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'Global',
    },
    address: {
      type: String,
      default: '',
    },
    branchAdmin: {
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

export default mongoose.model('Branch', BranchSchema);
