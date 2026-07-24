import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    isSystemRole: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Role', RoleSchema);
