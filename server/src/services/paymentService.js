const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { releaseStockForOrder } = require('./inventoryService');
const { ORDER_STATUS, PAYMENT_STATUS, validateOrderStatusTransition } = require('../utils/stateMachine');
const ApiError = require('../utils/ApiError');

/**
 * Process a mock payment with idempotency protection and expiration safeguards.
 */
const processPayment = async ({ orderId, outcome, idempotencyKey }) => {
  if (!orderId || !outcome || !idempotencyKey) {
    throw new ApiError(400, 'orderId, outcome, and idempotencyKey are all required');
  }

  // 1. Idempotency Check: Return existing payment if key was already submitted
  const existingPayment = await Payment.findOne({ idempotencyKey });
  if (existingPayment) {
    console.log(`[Payment] Idempotent hit: Returning existing payment ${existingPayment.paymentId} for key ${idempotencyKey}`);
    const order = await Order.findOne({ orderId });
    return {
      payment: existingPayment,
      order,
      isIdempotentReplay: true,
    };
  }

  // 2. Order validation
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new ApiError(404, `Order with ID '${orderId}' not found`);
  }

  // 3. Status checks: Only RESERVED orders can be paid
  if (order.status === ORDER_STATUS.PAID) {
    throw new ApiError(409, 'This order has already been paid and completed');
  }
  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new ApiError(409, 'Cannot process payment for a CANCELLED order');
  }
  if (order.status === ORDER_STATUS.FAILED) {
    throw new ApiError(409, 'Cannot process payment for a previously FAILED order');
  }
  if (order.status === ORDER_STATUS.EXPIRED) {
    throw new ApiError(409, 'Stock reservation has EXPIRED. Please checkout again.');
  }
  if (order.status !== ORDER_STATUS.RESERVED) {
    throw new ApiError(409, `Cannot process payment for order in '${order.status}' status`);
  }

  // 4. Expiration check: Verify reservation window
  const now = new Date();
  if (now > new Date(order.reservationExpiresAt)) {
    // Lazy expiration transition
    order.status = ORDER_STATUS.EXPIRED;
    order.paymentStatus = 'FAILED';
    await order.save();
    await releaseStockForOrder(order.orderId);

    throw new ApiError(409, 'Reservation window of 5 minutes has EXPIRED. Reserved stock has been released.');
  }

  // 5. Handle Simulated Outcome
  const paymentId = 'PAY-' + uuidv4().slice(0, 8).toUpperCase();
  const validOutcomes = ['SUCCESS', 'FAILED', 'TIMEOUT'];
  if (!validOutcomes.includes(outcome.toUpperCase())) {
    throw new ApiError(400, `Invalid payment outcome. Must be one of: ${validOutcomes.join(', ')}`);
  }

  const normalizedOutcome = outcome.toUpperCase();

  if (normalizedOutcome === 'SUCCESS') {
    validateOrderStatusTransition(order.status, ORDER_STATUS.PAID);

    const payment = await Payment.create({
      paymentId,
      orderId,
      amount: order.totalAmount,
      status: PAYMENT_STATUS.SUCCESS,
      outcome: 'SUCCESS',
      idempotencyKey,
      gatewayReference: 'SIM-GW-' + Math.floor(100000 + Math.random() * 900000),
    });

    order.status = ORDER_STATUS.PAID;
    order.paymentStatus = 'PAID';
    await order.save();

    console.log(`[Payment] Payment SUCCESS for order ${orderId}, paymentId: ${paymentId}`);
    return { payment, order, isIdempotentReplay: false };
  }

  if (normalizedOutcome === 'FAILED') {
    validateOrderStatusTransition(order.status, ORDER_STATUS.FAILED);

    const payment = await Payment.create({
      paymentId,
      orderId,
      amount: order.totalAmount,
      status: PAYMENT_STATUS.FAILED,
      outcome: 'FAILED',
      idempotencyKey,
      gatewayReference: 'SIM-FAIL-' + Math.floor(100000 + Math.random() * 900000),
    });

    order.status = ORDER_STATUS.FAILED;
    order.paymentStatus = 'FAILED';
    await order.save();

    // Release reserved stock on payment failure
    await releaseStockForOrder(order.orderId);

    console.log(`[Payment] Payment FAILED for order ${orderId}. Stock released.`);
    return { payment, order, isIdempotentReplay: false };
  }

  if (normalizedOutcome === 'TIMEOUT') {
    // In TIMEOUT, payment is recorded as PENDING/TIMEOUT and order remains RESERVED until expiration
    const payment = await Payment.create({
      paymentId,
      orderId,
      amount: order.totalAmount,
      status: PAYMENT_STATUS.PENDING,
      outcome: 'TIMEOUT',
      idempotencyKey,
      gatewayReference: 'SIM-TIMEOUT-' + Math.floor(100000 + Math.random() * 900000),
    });

    console.log(`[Payment] Payment TIMEOUT simulated for order ${orderId}. Status remains PENDING.`);
    return { payment, order, isIdempotentReplay: false };
  }
};

module.exports = {
  processPayment,
};
