const mongoose = require('mongoose');

const pujaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Puja name is required'],
      trim: true,
      maxlength: [100, 'Puja name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [150, 'Short description cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['general', 'devotional', 'shanti', 'health', 'homam', 'muhurat', 'other'],
      index: true,
    },
    pujaType: {
      type: String,
      required: true,
      enum: ['bookable', 'coming_soon'],
      default: 'bookable',
      index: true,
    },
    duration: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    whatsIncluded: {
      type: [String],
      default: [],
    },
    requiresItems: {
      type: String,
      enum: ['yes', 'optional', 'no'],
      default: 'optional',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for common queries
pujaSchema.index({ pujaType: 1, isActive: 1, displayOrder: 1 });
pujaSchema.index({ category: 1, isActive: 1 });

// Generate slug from name before validation
pujaSchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Puja', pujaSchema);
