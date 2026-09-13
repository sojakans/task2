const { connectDB, disconnectDB } = require('../src/config/db');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const orderService = require('../src/services/orderService');
const { v4: uuidv4 } = require('uuid');

async function runConcurrencyTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING CRITICAL CONCURRENCY & INVENTORY TESTS');
  console.log('====================================================\n');

  await connectDB();

  try {
    // ----------------------------------------------------
    // TEST 1: Single Unit Stock Race Condition (stock = 1)
    // ----------------------------------------------------
    console.log('Test 1: Simultaneous Checkouts for Single Stock Item (Stock = 1)');
    const singleProduct = await Product.create({
      name: 'Single Unit Rare Chip ' + Date.now(),
      description: 'Single prototype for race condition testing',
      price: 1500,
      category: 'Microcontrollers',
      image: 'https://example.com/chip.png',
      availableStock: 1,
    });

    // Create 2 carts for 2 distinct customers
    const cartA = await Cart.create({
      cartId: 'CART-RACE-A-' + uuidv4(),
      items: [{ productId: singleProduct._id, name: singleProduct.name, price: 1500, quantity: 1 }],
      status: 'ACTIVE',
    });

    const cartB = await Cart.create({
      cartId: 'CART-RACE-B-' + uuidv4(),
      items: [{ productId: singleProduct._id, name: singleProduct.name, price: 1500, quantity: 1 }],
      status: 'ACTIVE',
    });

    console.log(`Starting simultaneous checkouts for Cart A and Cart B on Product [${singleProduct.name}]...`);

    // Fire both checkout requests concurrently
    const results = await Promise.allSettled([
      orderService.checkout({ cartId: cartA.cartId }),
      orderService.checkout({ cartId: cartB.cartId }),
    ]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    console.log(`Results: ${successes.length} succeeded, ${failures.length} rejected.`);

    const refreshedSingleProduct = await Product.findById(singleProduct._id);
    console.log(`Final Available Stock in DB: ${refreshedSingleProduct.availableStock}`);

    if (successes.length === 1 && failures.length === 1 && refreshedSingleProduct.availableStock === 0) {
      console.log('✅ TEST 1 PASSED: Exactly 1 reservation succeeded, 1 was rejected. Stock is 0, never negative.\n');
    } else {
      throw new Error(`TEST 1 FAILED: Expected 1 success and 1 failure with 0 stock remaining, got ${successes.length} successes and ${refreshedSingleProduct.availableStock} stock.`);
    }

    // ----------------------------------------------------
    // TEST 2: Multi-Client High Concurrency (stock = 5, 12 simultaneous requests)
    // ----------------------------------------------------
    console.log('Test 2: High Concurrency (Stock = 5, 12 Simultaneous Checkouts)');
    const multiProduct = await Product.create({
      name: 'Batch Test Sensor ' + Date.now(),
      description: 'Batch stock test',
      price: 250,
      category: 'Sensors',
      image: 'https://example.com/sensor.png',
      availableStock: 5,
    });

    const carts = [];
    for (let i = 0; i < 12; i++) {
      const cart = await Cart.create({
        cartId: `CART-CONC-${i}-${uuidv4()}`,
        items: [{ productId: multiProduct._id, name: multiProduct.name, price: 250, quantity: 1 }],
        status: 'ACTIVE',
      });
      carts.push(cart);
    }

    console.log(`Firing 12 concurrent checkout requests against 5 available items...`);
    const multiResults = await Promise.allSettled(
      carts.map((c) => orderService.checkout({ cartId: c.cartId }))
    );

    const multiSuccess = multiResults.filter((r) => r.status === 'fulfilled');
    const multiFailures = multiResults.filter((r) => r.status === 'rejected');

    const refreshedMultiProduct = await Product.findById(multiProduct._id);
    console.log(`Results: ${multiSuccess.length} succeeded, ${multiFailures.length} rejected.`);
    console.log(`Final Available Stock in DB: ${refreshedMultiProduct.availableStock}`);

    if (multiSuccess.length === 5 && multiFailures.length === 7 && refreshedMultiProduct.availableStock === 0) {
      console.log('✅ TEST 2 PASSED: Exactly 5 reservations succeeded, 7 were rejected. Available stock is 0, never negative.\n');
    } else {
      throw new Error(`TEST 2 FAILED: Expected 5 successes and 7 failures with 0 stock remaining.`);
    }

    console.log('🎉 ALL CONCURRENCY & ATOMIC INVENTORY TESTS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ Concurrency Test Error:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runConcurrencyTests();
}

module.exports = runConcurrencyTests;
