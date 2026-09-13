const paymentService = require('../services/paymentService');

/**
 * POST /api/payments
 */
const processPayment = async (req, res, next) => {
  try {
    const { orderId, outcome, idempotencyKey } = req.body;

    const result = await paymentService.processPayment({
      orderId,
      outcome,
      idempotencyKey,
    });

    const status = result.isIdempotentReplay ? 200 : 201;

    res.status(status).json({
      success: true,
      message: result.isIdempotentReplay
        ? 'Duplicate payment request detected. Returned existing payment record.'
        : `Payment processed with outcome: ${outcome}`,
      isIdempotentReplay: result.isIdempotentReplay,
      payment: result.payment,
      order: result.order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
};
