const mongoose = require('mongoose');

const callbackRequestSchema = new mongoose.Schema(
  {
    puja: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Puja',
      required: [true, 'Puja reference is required'],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 100,
    },
    customerMobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    preferredCallTime: {
      type: String,
      enum: ['Morning (9-12)', 'Afternoon (12-4)', 'Evening (4-7)'],
      default: 'Morning (9-12)',
    },
    message: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'recall', 'converted', 'closed'],
      default: 'new',
      index: true,
    },
    recallDateTime: {
      type: Date,
      default: null,
    },
    adminNotes: {
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

callbackRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('CallbackRequest', callbackRequestSchema);
