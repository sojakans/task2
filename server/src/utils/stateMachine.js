const ApiError = require('./ApiError');

const ORDER_STATUS = {
  PENDING: 'PENDING',
  RESERVED: 'RESERVED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

const VALID_ORDER_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.RESERVED],
  [ORDER_STATUS.RESERVED]: [
    ORDER_STATUS.PAID,
    ORDER_STATUS.FAILED,
    ORDER_STATUS.EXPIRED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.FAILED]: [],
  [ORDER_STATUS.EXPIRED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

const validateOrderStatusTransition = (currentStatus, targetStatus) => {
  if (currentStatus === targetStatus) {
    return true;
  }
  const allowed = VALID_ORDER_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new ApiError(
      409,
      `Invalid order status transition from '${currentStatus}' to '${targetStatus}'.`
    );
  }
  return true;
};

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

const REFUND_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

module.exports = {
  ORDER_STATUS,
  VALID_ORDER_TRANSITIONS,
  validateOrderStatusTransition,
  PAYMENT_STATUS,
  REFUND_STATUS,
};
