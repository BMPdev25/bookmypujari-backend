const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, match: [/^\d{6}$/, 'Pincode must be 6 digits'] },
    landmark: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    puja: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Puja',
      required: [true, 'Puja reference is required'],
      index: true,
    },
    // Customer details
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
    address: {
      type: addressSchema,
      required: true,
    },
    // Schedule
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
      enum: ['Early Morning (5-7 AM)', 'Morning (7-9 AM)', 'Late Morning (9-11 AM)', 'Afternoon (12-3 PM)', 'Evening (4-7 PM)'],
    },
    // Items delivery
    itemsDeliveryRequested: {
      type: Boolean,
      default: false,
    },
    itemsDeliveryStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'preparing', 'dispatched', 'delivered'],
      default: 'not_applicable',
    },
    // Operations
    assignedPujari: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pujari',
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['new', 'pujari_assigned', 'items_preparing', 'confirmed', 'completed', 'cancelled'],
      default: 'new',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    cancellationReason: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for operational queries
bookingSchema.index({ status: 1, preferredDate: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ assignedPujari: 1, status: 1 });
bookingSchema.index({ itemsDeliveryRequested: 1, itemsDeliveryStatus: 1 });

// Auto-set items delivery status based on request
bookingSchema.pre('save', function (next) {
  if (this.isNew && this.itemsDeliveryRequested) {
    this.itemsDeliveryStatus = 'pending';
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
