const { connectDB, disconnectDB } = require('../src/config/db');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const Order = require('../src/models/Order');
const Payment = require('../src/models/Payment');
const Refund = require('../src/models/Refund');
const orderService = require('../src/services/orderService');
const paymentService = require('../src/services/paymentService');
const { sweepExpiredReservations } = require('../src/jobs/expirationSweeper');
const { v4: uuidv4 } = require('uuid');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ Passed: ${testName}`);
  } else {
    console.error(`  ❌ FAILED: ${testName}`);
    throw new Error(`Assertion failed for: ${testName}`);
  }
}

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE TECHLOOM TEST SUITE');
  console.log('====================================================\n');

  await connectDB();

  try {
    // ----------------------------------------------------
    // SETUP: Clear and Seed Test Products
    // ----------------------------------------------------
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Refund.deleteMany({});

    const esp32 = await Product.create({
      name: 'ESP32 NodeMCU Module',
      description: 'WiFi and Bluetooth IoT module',
      price: 500,
      category: 'Microcontrollers',
      image: 'https://example.com/esp32.jpg',
      availableStock: 10,
    });

    const oled = await Product.create({
      name: '0.96 inch I2C OLED Display',
      description: '128x64 display panel',
      price: 300,
      category: 'Displays',
      image: 'https://example.com/oled.jpg',
      availableStock: 5,
    });

    const outOfStockItem = await Product.create({
      name: 'Discontinued Transceiver',
      description: 'Obsolete module',
      price: 1200,
      category: 'Wireless',
      image: 'https://example.com/transceiver.jpg',
      availableStock: 0,
    });

    console.log('📦 SECTION 1: Product Discovery & Filtering');
    // Search test
    const searchRes = await Product.find({ name: { $regex: 'ESP32', $options: 'i' } });
    assert(searchRes.length === 1 && searchRes[0].name.includes('ESP32'), 'Search by product name');

    // Category filter
    const catRes = await Product.find({ category: 'Displays' });
    assert(catRes.length === 1 && catRes[0].category === 'Displays', 'Filter by category');

    // Price range filter
    const priceRes = await Product.find({ price: { $gte: 400, $lte: 600 } });
    assert(priceRes.length === 1 && priceRes[0].price === 500, 'Filter by price range');

    // Availability filter
    const availRes = await Product.find({ availableStock: { $gt: 0 } });
    assert(availRes.length === 2, 'Filter by stock availability (in stock only)');

    // Sort test
    const sortedRes = await Product.find().sort({ price: -1 });
    assert(sortedRes[0].price === 1200 && sortedRes[2].price === 300, 'Sort products by price descending');

    console.log('\n🛒 SECTION 2: Cart Operations & Price Integrity');
    const cartId = 'CART-TEST-' + uuidv4();
    const cart = await Cart.create({
      cartId,
      items: [
        { productId: esp32._id, name: esp32.name, price: 500, quantity: 2 },
        { productId: oled._id, name: oled.name, price: 300, quantity: 1 },
      ],
      status: 'ACTIVE',
    });

    assert(cart.items.length === 2, 'Add multiple products to cart');
    assert(cart.items[0].quantity === 2, 'Quantity tracking in cart');

    console.log('\n🔒 SECTION 3: Checkout & Atomic Stock Reservation');
    const order = await orderService.checkout({
      cartId: cart.cartId,
      customerInfo: { fullName: 'Jane Doe', email: 'jane@techloom.store' },
    });

    assert(order.status === 'RESERVED', 'Order created in RESERVED status');
    assert(order.paymentStatus === 'UNPAID', 'Order payment status initialized to UNPAID');
    assert(order.totalAmount === 1300, 'Server-calculated total (500*2 + 300*1 = 1300)');

    const esp32AfterRes = await Product.findById(esp32._id);
    const oledAfterRes = await Product.findById(oled._id);
    assert(esp32AfterRes.availableStock === 8, 'ESP32 stock decremented from 10 to 8');
    assert(oledAfterRes.availableStock === 4, 'OLED stock decremented from 5 to 4');

    console.log('\n💳 SECTION 4: Mock Payment & Idempotency Protection');
    const idempotencyKey = 'IDEMP-' + uuidv4();

    // Successful payment
    const paymentResult = await paymentService.processPayment({
      orderId: order.orderId,
      outcome: 'SUCCESS',
      idempotencyKey,
    });

    assert(paymentResult.payment.status === 'SUCCESS', 'Payment status is SUCCESS');
    assert(paymentResult.order.status === 'PAID', 'Order status transitions to PAID');
    assert(paymentResult.isIdempotentReplay === false, 'First payment call is not a replay');

    // Duplicate payment attempt with the same idempotency key
    const duplicatePaymentResult = await paymentService.processPayment({
      orderId: order.orderId,
      outcome: 'SUCCESS',
      idempotencyKey,
    });

    assert(duplicatePaymentResult.isIdempotentReplay === true, 'Duplicate submission detected via idempotency key');
    assert(duplicatePaymentResult.payment.paymentId === paymentResult.payment.paymentId, 'Returns existing payment record without creating duplicate');

    // Attempting to pay an already PAID order with a new key
    let alreadyPaidBlocked = false;
    try {
      await paymentService.processPayment({
        orderId: order.orderId,
        outcome: 'SUCCESS',
        idempotencyKey: 'NEW-KEY-' + uuidv4(),
      });
    } catch (err) {
      if (err.statusCode === 409) alreadyPaidBlocked = true;
    }
    assert(alreadyPaidBlocked, 'Rejects payment for already PAID order with 409 Conflict');

    console.log('\n❌ SECTION 5: Payment Failure & Stock Release');
    const failCart = await Cart.create({
      cartId: 'CART-FAIL-' + uuidv4(),
      items: [{ productId: esp32._id, name: esp32.name, price: 500, quantity: 1 }],
      status: 'ACTIVE',
    });
    const failOrder = await orderService.checkout({ cartId: failCart.cartId });
    const esp32ReservedForFail = await Product.findById(esp32._id);
    assert(esp32ReservedForFail.availableStock === 7, 'ESP32 stock reserved down to 7');

    await paymentService.processPayment({
      orderId: failOrder.orderId,
      outcome: 'FAILED',
      idempotencyKey: 'KEY-FAIL-' + uuidv4(),
    });

    const failOrderDb = await Order.findOne({ orderId: failOrder.orderId });
    const esp32RestoredAfterFail = await Product.findById(esp32._id);
    assert(failOrderDb.status === 'FAILED', 'Order status marked as FAILED');
    assert(esp32RestoredAfterFail.availableStock === 8, 'Reserved stock restored back to 8 after payment failure');

    console.log('\n⏳ SECTION 6: Reservation Expiration & Stock Sweeper');
    const expCart = await Cart.create({
      cartId: 'CART-EXP-' + uuidv4(),
      items: [{ productId: esp32._id, name: esp32.name, price: 500, quantity: 2 }],
      status: 'ACTIVE',
    });
    const expOrder = await orderService.checkout({ cartId: expCart.cartId });
    assert((await Product.findById(esp32._id)).availableStock === 6, 'Stock reserved down to 6');

    // Simulate expiration by setting reservationExpiresAt to 10 seconds in the past
    expOrder.reservationExpiresAt = new Date(Date.now() - 10000);
    await expOrder.save();

    // Trigger background sweeper
    await sweepExpiredReservations();

    const refreshedExpOrder = await Order.findOne({ orderId: expOrder.orderId });
    const esp32AfterSweep = await Product.findById(esp32._id);
    assert(refreshedExpOrder.status === 'EXPIRED', 'Sweeper transitioned order to EXPIRED');
    assert(esp32AfterSweep.availableStock === 8, 'Sweeper restored stock back to 8');

    // Second sweep must NOT restore stock twice
    await sweepExpiredReservations();
    const esp32AfterSecondSweep = await Product.findById(esp32._id);
    assert(esp32AfterSecondSweep.availableStock === 8, 'Stock restoration is idempotent (never restores twice)');

    // Attempting to pay an EXPIRED order must fail
    let payExpiredBlocked = false;
    try {
      await paymentService.processPayment({
        orderId: expOrder.orderId,
        outcome: 'SUCCESS',
        idempotencyKey: 'KEY-EXP-' + uuidv4(),
      });
    } catch (err) {
      if (err.statusCode === 409) payExpiredBlocked = true;
    }
    assert(payExpiredBlocked, 'Rejects payment on EXPIRED order');

    console.log('\n🔄 SECTION 7: Order Cancellation & Refund Mechanics');
    // 1. Cancel RESERVED order
    const cancelResCart = await Cart.create({
      cartId: 'CART-CANCEL-RES-' + uuidv4(),
      items: [{ productId: esp32._id, name: esp32.name, price: 500, quantity: 1 }],
      status: 'ACTIVE',
    });
    const cancelResOrder = await orderService.checkout({ cartId: cancelResCart.cartId });
    assert((await Product.findById(esp32._id)).availableStock === 7, 'Stock reserved down to 7');

    await orderService.cancelOrder(cancelResOrder.orderId, 'User changed mind');
    const cancelResOrderDb = await Order.findOne({ orderId: cancelResOrder.orderId });
    assert(cancelResOrderDb.status === 'CANCELLED', 'RESERVED order cancelled successfully');
    assert((await Product.findById(esp32._id)).availableStock === 8, 'Stock released back to 8');

    // 2. Cancel PAID order (triggers refund)
    const paidCart = await Cart.create({
      cartId: 'CART-CANCEL-PAID-' + uuidv4(),
      items: [{ productId: oled._id, name: oled.name, price: 300, quantity: 1 }],
      status: 'ACTIVE',
    });
    const paidOrder = await orderService.checkout({ cartId: paidCart.cartId });
    await paymentService.processPayment({
      orderId: paidOrder.orderId,
      outcome: 'SUCCESS',
      idempotencyKey: 'KEY-PAID-CANCEL-' + uuidv4(),
    });

    const oledStockBeforeCancel = (await Product.findById(oled._id)).availableStock;
    const cancelPaidResult = await orderService.cancelOrder(paidOrder.orderId, 'Ordered wrong chip');

    assert(cancelPaidResult.order.status === 'CANCELLED', 'PAID order transitioned to CANCELLED');
    assert(cancelPaidResult.refund !== null, 'Refund record created for paid order');
    assert(cancelPaidResult.refund.status === 'SUCCESS', 'Refund status is SUCCESS');
    assert(cancelPaidResult.refund.amount === 300, 'Refund amount matches order total (300)');

    const oledStockAfterCancel = (await Product.findById(oled._id)).availableStock;
    assert(oledStockAfterCancel === oledStockBeforeCancel + 1, 'Stock restored back to inventory upon cancelling paid order');

    // Duplicate cancellation attempt
    let duplicateCancelBlocked = false;
    try {
      await orderService.cancelOrder(paidOrder.orderId, 'Duplicate cancel attempt');
    } catch (err) {
      if (err.statusCode === 409) duplicateCancelBlocked = true;
    }
    assert(duplicateCancelBlocked, 'Rejects duplicate cancellation on already CANCELLED order');

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test Suite Failed:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runComprehensiveTests();
}

module.exports = runComprehensiveTests;
