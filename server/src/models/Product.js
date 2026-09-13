const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be non-negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    availableStock: {
      type: Number,
      required: [true, 'Available stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    specs: {
      architecture: { type: String },
      clockSpeed: { type: String },
      operatingVoltage: { type: String },
      flashMemory: { type: String },
      ram: { type: String },
      interfaces: [{ type: String }],
      packageType: { type: String },
    },
    sku: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast parametric search & filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ availableStock: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
