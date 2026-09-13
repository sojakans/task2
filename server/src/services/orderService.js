const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const { reserveStock, releaseStockForOrder } = require('./inventoryService');
const { ORDER_STATUS, validateOrderStatusTransition } = require('../utils/stateMachine');
const ApiError = require('../utils/ApiError');

/**
 * Checkout flow:
 * 1. Validate cart and items.
 * 2. Fetch fresh product data from DB and calculate server-side totals.
 * 3. Atomically reserve inventory.
 * 4. Create Order with status RESERVED and reservationExpiresAt = now + 5 minutes.
 * 5. Mark cart as CHECKED_OUT.
 */
const checkout = async ({ cartId, customerInfo, userId }) => {
  if (!cartId) {
    throw new ApiError(400, 'cartId is required for checkout');
  }

  const cart = await Cart.findOne({ cartId });
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty or does not exist');
  }

  // Fetch verified products from DB to build authoritative items array and server-computed total
  const verifiedItems = [];
  let calculatedTotal = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ApiError(404, `Product '${item.name || item.productId}' no longer exists`);
    }

    const price = Number(product.price);
    const quantity = Number(item.quantity);
    const subtotal = price * quantity;
    calculatedTotal += subtotal;

    verifiedItems.push({
      productId: product._id,
      name: product.name,
      price: price,
      quantity: quantity,
      subtotal: subtotal,
      image: product.image,
    });
  }

  // 3. Atomically reserve stock in database
  await reserveStock(verifiedItems);

  // 4. Create Order
  const orderId = 'TL-' + Math.floor(100000 + Math.random() * 900000);
  const reservationMinutes = Number(process.env.RESERVATION_MINUTES) || 5;
  const reservationExpiresAt = new Date(Date.now() + reservationMinutes * 60 * 1000);

  const order = await Order.create({
    orderId,
    userId: userId || null,
    cartId,
    items: verifiedItems,
    totalAmount: calculatedTotal,
    status: ORDER_STATUS.RESERVED,
    paymentStatus: 'UNPAID',
    reservationExpiresAt,
    customer: customerInfo || undefined,
  });

  // 5. Update cart status
  cart.status = 'CHECKED_OUT';
  await cart.save();

  console.log(`[Order] Created order ${orderId} in RESERVED status. Expires at: ${reservationExpiresAt.toISOString()}`);
  return order;
};

/**
 * Cancel order flow:
 * - If RESERVED: Cancel order & release stock.
 * - If PAID: Cancel order, create refund record, and restore stock.
 * - If EXPIRED / CANCELLED / FAILED: Reject.
 */
const cancelOrder = async (orderId, reason = 'Customer requested cancellation') => {
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new ApiError(404, `Order with ID '${orderId}' not found`);
  }

  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new ApiError(409, 'Order is already cancelled');
  }

  if (order.status === ORDER_STATUS.EXPIRED) {
    throw new ApiError(409, 'Cannot cancel an EXPIRED order. Stock was already returned to inventory.');
  }

  if (order.status === ORDER_STATUS.FAILED) {
    throw new ApiError(409, 'Cannot cancel a FAILED order');
  }

  validateOrderStatusTransition(order.status, ORDER_STATUS.CANCELLED);

  let refund = null;

  if (order.status === ORDER_STATUS.PAID) {
    // Check if payment exists
    const payment = await Payment.findOne({ orderId, status: 'SUCCESS' });
    if (!payment) {
      throw new ApiError(400, 'Cannot locate successful payment record to refund');
    }

    // Check if duplicate refund exists
    const existingRefund = await Refund.findOne({ orderId, paymentId: payment.paymentId });
    if (existingRefund) {
      throw new ApiError(409, 'This order has already been refunded');
    }

    // Create simulated refund
    const refundId = 'REF-' + uuidv4().slice(0, 8).toUpperCase();
    refund = await Refund.create({
      refundId,
      orderId,
      paymentId: payment.paymentId,
      amount: order.totalAmount,
      status: 'SUCCESS',
      reason,
    });

    console.log(`[Refund] Created refund ${refundId} for amount ${order.totalAmount}`);
  }

  // Mark order as CANCELLED
  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelReason = reason;
  await order.save();

  // Atomically release/restore reserved stock
  await releaseStockForOrder(order.orderId);

  return { order, refund };
};

module.exports = {
  checkout,
  cancelOrder,
};
