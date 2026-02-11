const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    pincodes: { type: [String], default: [] },
  },
  { _id: false }
);

const pujariSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pujari name is required'],
      trim: true,
      maxlength: 100,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['Hindi', 'Sanskrit'],
    },
    supportedPujas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Puja',
      },
    ],
    serviceAreas: {
      type: [serviceAreaSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for service area queries
pujariSchema.index({ isActive: 1, 'serviceAreas.city': 1 });
pujariSchema.index({ supportedPujas: 1 });

module.exports = mongoose.model('Pujari', pujariSchema);
