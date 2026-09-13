const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const orderService = require('../services/orderService');
const { releaseStockForOrder } = require('../services/inventoryService');
const { ORDER_STATUS } = require('../utils/stateMachine');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/checkout
 */
const checkout = async (req, res, next) => {
  try {
    const { cartId, customer } = req.body;
    const customerData = {
      ...(customer || {}),
      ...(req.user ? { fullName: req.user.name, email: req.user.email } : {}),
    };
    const order = await orderService.checkout({
      cartId,
      customerInfo: customerData,
      userId: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: 'Checkout successful. Stock reserved for 5 minutes.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Returns complete order history with payment and refund statuses
 */
const getOrders = async (req, res, next) => {
  try {
    const query = req.user
      ? { $or: [{ userId: req.user._id }, { 'customer.email': req.user.email }] }
      : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Attach corresponding payment & refund information for complete historical clarity
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Dynamic expiration check
        if (
          order.status === ORDER_STATUS.RESERVED &&
          new Date() > new Date(order.reservationExpiresAt)
        ) {
          order.status = ORDER_STATUS.EXPIRED;
          order.paymentStatus = 'FAILED';
          await order.save();
          await releaseStockForOrder(order.orderId);
        }

        const payment = await Payment.findOne({ orderId: order.orderId }).sort({ createdAt: -1 });
        const refund = await Refund.findOne({ orderId: order.orderId });

        return {
          ...order.toObject(),
          payment: payment
            ? {
                paymentId: payment.paymentId,
                status: payment.status,
                outcome: payment.outcome,
                amount: payment.amount,
              }
            : null,
          refund: refund
            ? {
                refundId: refund.refundId,
                status: refund.status,
                amount: refund.amount,
                reason: refund.reason,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      count: ordersWithDetails.length,
      orders: ordersWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:orderId
 */
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      throw new ApiError(404, `Order '${orderId}' not found`);
    }

    // Dynamic expiration check
    if (
      order.status === ORDER_STATUS.RESERVED &&
      new Date() > new Date(order.reservationExpiresAt)
    ) {
      order.status = ORDER_STATUS.EXPIRED;
      order.paymentStatus = 'FAILED';
      await order.save();
      await releaseStockForOrder(order.orderId);
    }

    const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 });
    const refund = await Refund.findOne({ orderId });

    res.json({
      success: true,
      order: {
        ...order.toObject(),
        payment,
        refund,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:orderId/cancel
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const result = await orderService.cancelOrder(orderId, reason);

    res.json({
      success: true,
      message: 'Order cancelled successfully. Reserved stock has been released.',
      order: result.order,
      refund: result.refund,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getOrders,
  getOrderById,
  cancelOrder,
};
