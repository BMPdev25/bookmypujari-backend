const mongoose = require('mongoose');

const overrideItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, default: '', trim: true },
    action: { type: String, enum: ['add', 'remove', 'modify'], required: true },
  },
  { _id: false }
);

const pujariItemOverrideSchema = new mongoose.Schema(
  {
    pujari: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pujari',
      required: true,
      index: true,
    },
    puja: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Puja',
      required: true,
      index: true,
    },
    itemTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PujaItemTemplate',
      required: true,
    },
    overrideItems: {
      type: [overrideItemSchema],
      default: [],
    },
    notes: {
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

pujariItemOverrideSchema.index({ pujari: 1, puja: 1 }, { unique: true });

module.exports = mongoose.model('PujariItemOverride', pujariItemOverrideSchema);
