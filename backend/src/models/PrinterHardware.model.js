import mongoose from 'mongoose';

const PrinterHardwareSchema = new mongoose.Schema(
  {
    printerName: {
      type: String,
      required: true,
      trim: true,
    },
    modelNumber: {
      type: String,
      default: 'Evolis Primacy 2 / Fargo HDP5000',
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    ipAddress: {
      type: String,
      default: '192.168.1.100',
    },
    status: {
      type: String,
      enum: ['ONLINE', 'PRINTING', 'PAUSED', 'MAINTENANCE', 'OFFLINE'],
      default: 'ONLINE',
    },
    ribbonLevelPercent: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    cardStockRemaining: {
      type: Number,
      default: 250,
    },
    totalCardsPrinted: {
      type: Number,
      default: 0,
    },
    lastMaintenanceDate: {
      type: Date,
      default: Date.now,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PrinterHardware', PrinterHardwareSchema);
