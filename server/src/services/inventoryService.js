const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');

/**
 * Atomically reserves stock for a list of items.
 * Uses conditional atomic updates ($inc: -quantity with { availableStock: { $gte: quantity } }).
 * If any product has insufficient stock, automatically compensates and rolls back previous items.
 */
const reserveStock = async (items) => {
  const reservedItems = [];

  try {
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (quantity <= 0) {
        throw new ApiError(400, `Invalid reservation quantity for item ${item.name || item.productId}`);
      }

      // Atomic conditional update prevents race conditions and overselling
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          availableStock: { $gte: quantity },
        },
        {
          $inc: { availableStock: -quantity },
        },
        {
          new: true,
        }
      );

      if (!updatedProduct) {
        // Find product to determine exact reason
        const product = await Product.findById(item.productId);
        const productName = product ? product.name : (item.name || 'Hardware item');
        const currentStock = product ? product.availableStock : 0;

        throw new ApiError(
          409,
          `Insufficient stock for '${productName}'. Requested: ${quantity}, Available: ${currentStock}`
        );
      }

      reservedItems.push({
        productId: item.productId,
        quantity,
      });
    }

    return true;
  } catch (error) {
    // Rollback all items successfully reserved in this transaction
    for (const reserved of reservedItems) {
      await Product.findByIdAndUpdate(reserved.productId, {
        $inc: { availableStock: reserved.quantity },
      });
    }
    throw error;
  }
};

/**
 * Atomically releases reserved stock back to the inventory for an order.
 * Guards against duplicate restoration using the `stockReleased` flag.
 */
const releaseStockForOrder = async (orderId) => {
  // Find order and atomically mark stockReleased = true if false
  const order = await Order.findOneAndUpdate(
    {
      orderId,
      stockReleased: { $ne: true },
    },
    {
      $set: { stockReleased: true },
    },
    {
      new: false, // returns document before update
    }
  );

  // If order not found or stock already released, safely exit
  if (!order) {
    return false;
  }

  // Restore inventory for all items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { availableStock: item.quantity },
    });
  }

  console.log(`[Inventory] Released reserved stock back to inventory for order: ${orderId}`);
  return true;
};

module.exports = {
  reserveStock,
  releaseStockForOrder,
};
