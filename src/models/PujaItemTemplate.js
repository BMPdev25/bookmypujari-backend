const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    notes: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const pujaItemTemplateSchema = new mongoose.Schema(
  {
    puja: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Puja',
      required: [true, 'Puja reference is required'],
      index: true,
    },
    templateName: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: 200,
    },
    items: {
      type: [itemSchema],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pujaItemTemplateSchema.index({ puja: 1, isDefault: 1 });

module.exports = mongoose.model('PujaItemTemplate', pujaItemTemplateSchema);
