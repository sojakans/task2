const { v4: uuidv4 } = require('uuid');
const Refund = require('../models/Refund');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { releaseStockForOrder } = require('../services/inventoryService');
const { ORDER_STATUS } = require('../utils/stateMachine');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/refunds
 */
const createRefund = async (req, res, next) => {
  try {
    const { orderId, paymentId, amount, reason, outcome = 'SUCCESS' } = req.body;

    if (!orderId || !paymentId) {
      throw new ApiError(400, 'orderId and paymentId are required');
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new ApiError(404, `Order '${orderId}' not found`);
    }

    // Check existing refund for this payment
    const existingRefund = await Refund.findOne({ paymentId });
    if (existingRefund) {
      throw new ApiError(409, `A refund has already been recorded for payment '${paymentId}'`);
    }

    const payment = await Payment.findOne({ paymentId, orderId });
    if (!payment) {
      throw new ApiError(404, `Payment '${paymentId}' not found for this order`);
    }

    if (payment.status !== 'SUCCESS') {
      throw new ApiError(400, 'Cannot refund a payment that is not successful');
    }

    const refundAmount = amount !== undefined ? Number(amount) : order.totalAmount;
    if (refundAmount !== order.totalAmount) {
      throw new ApiError(400, `Refund amount (${refundAmount}) must match valid order amount (${order.totalAmount})`);
    }

    const refundStatus = outcome.toUpperCase() === 'FAILED' ? 'FAILED' : 'SUCCESS';
    const refundId = 'REF-' + uuidv4().slice(0, 8).toUpperCase();

    const refund = await Refund.create({
      refundId,
      orderId,
      paymentId,
      amount: refundAmount,
      status: refundStatus,
      reason: reason || 'Customer requested refund',
    });

    if (refundStatus === 'SUCCESS') {
      order.status = ORDER_STATUS.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelReason = reason || 'Customer requested refund';
      await order.save();
      await releaseStockForOrder(order.orderId);
    }

    res.status(201).json({
      success: true,
      refund,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/refunds
 */
const getRefunds = async (req, res, next) => {
  try {
    const refunds = await Refund.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: refunds.length,
      refunds,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRefund,
  getRefunds,
};
