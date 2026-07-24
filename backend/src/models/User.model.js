import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encryptAES256, decryptAES256 } from '../utils/encryption.util.js';

const UserSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
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
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    // AES-256 Encrypted Sensitive Fields (e.g. National ID / SSN, Emergency Contact)
    nationalIdEncrypted: {
      type: String,
      default: '',
    },
    phoneEncrypted: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
      default: '',
    },
    singleSessionOnly: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

// Password Hashing pre-save hook
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare Password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Encrypt Sensitive Methods
UserSchema.methods.setSensitivePhone = function (plainPhone) {
  this.phoneEncrypted = encryptAES256(plainPhone);
};

UserSchema.methods.getDecryptedPhone = function () {
  return decryptAES256(this.phoneEncrypted);
};

UserSchema.methods.setSensitiveNationalId = function (plainNationalId) {
  this.nationalIdEncrypted = encryptAES256(plainNationalId);
};

UserSchema.methods.getDecryptedNationalId = function () {
  return decryptAES256(this.nationalIdEncrypted);
};

export default mongoose.model('User', UserSchema);
