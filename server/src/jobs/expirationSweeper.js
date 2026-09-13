const Order = require('../models/Order');
const { releaseStockForOrder } = require('../services/inventoryService');
const { ORDER_STATUS } = require('../utils/stateMachine');

let timer = null;

/**
 * Sweeps the database for orders with status RESERVED whose reservationExpiresAt has passed.
 * Atomically marks them as EXPIRED and releases reserved stock.
 */
const sweepExpiredReservations = async () => {
  try {
    const now = new Date();
    // Find all expired reserved orders
    const expiredOrders = await Order.find({
      status: ORDER_STATUS.RESERVED,
      reservationExpiresAt: { $lte: now },
    });

    if (expiredOrders.length > 0) {
      console.log(`[ExpirationSweeper] Found ${expiredOrders.length} expired reservation(s). Processing...`);

      for (const order of expiredOrders) {
        // Atomically update order status from RESERVED to EXPIRED
        const updated = await Order.findOneAndUpdate(
          {
            _id: order._id,
            status: ORDER_STATUS.RESERVED,
          },
          {
            $set: {
              status: ORDER_STATUS.EXPIRED,
              paymentStatus: 'FAILED',
            },
          },
          { new: true }
        );

        // Only release stock if this process successfully transitioned the order to EXPIRED
        if (updated) {
          await releaseStockForOrder(order.orderId);
          console.log(`[ExpirationSweeper] Expired order ${order.orderId} and released reserved stock.`);
        }
      }
    }
  } catch (error) {
    console.error('[ExpirationSweeper] Error during reservation expiration sweep:', error.message);
  }
};

const startExpirationSweeper = (intervalMs = 15000) => {
  if (timer) clearInterval(timer);
  console.log(`[ExpirationSweeper] Background reservation sweeper started (interval: ${intervalMs}ms)`);
  timer = setInterval(sweepExpiredReservations, intervalMs);
};

const stopExpirationSweeper = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('[ExpirationSweeper] Background reservation sweeper stopped');
  }
};

module.exports = {
  sweepExpiredReservations,
  startExpirationSweeper,
  stopExpirationSweeper,
};
