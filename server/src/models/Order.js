const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../utils/stateMachine');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    cartId: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (val) => val && val.length > 0,
        'Order must contain at least one item',
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'FAILED'],
      default: 'UNPAID',
    },
    reservationExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    customer: {
      fullName: { type: String, default: 'Maker Developer' },
      email: { type: String, default: 'maker@techloom.store' },
      address: { type: String, default: 'Silicon Hub 404, Tech Park' },
      city: { type: String, default: 'Bangalore' },
      postalCode: { type: String, default: '560100' },
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    stockReleased: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ status: 1, reservationExpiresAt: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
