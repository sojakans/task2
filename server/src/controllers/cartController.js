const { v4: uuidv4 } = require('uuid');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

// Helper to calculate verified server totals
const formatCartResponse = async (cart) => {
  let subtotal = 0;
  let totalItems = 0;
  const verifiedItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const currentPrice = Number(product.price);
    const itemSubtotal = currentPrice * item.quantity;
    subtotal += itemSubtotal;
    totalItems += item.quantity;

    verifiedItems.push({
      productId: product._id,
      name: product.name,
      price: currentPrice,
      image: product.image,
      quantity: item.quantity,
      availableStock: product.availableStock,
      subtotal: itemSubtotal,
    });
  }

  return {
    cartId: cart.cartId,
    status: cart.status,
    items: verifiedItems,
    itemCount: totalItems,
    subtotal,
    total: subtotal,
    updatedAt: cart.updatedAt,
  };
};

/**
 * POST /api/carts
 * Create or retrieve existing active cart
 */
const createOrGetCart = async (req, res, next) => {
  try {
    const { cartId, sessionIdentifier } = req.body;

    if (cartId) {
      let cart = await Cart.findOne({ cartId, status: 'ACTIVE' });
      if (cart) {
        const formatted = await formatCartResponse(cart);
        return res.json({ success: true, cart: formatted });
      }
    }

    const newCartId = 'CART-' + uuidv4();
    const newCart = await Cart.create({
      cartId: newCartId,
      sessionIdentifier: sessionIdentifier || null,
      items: [],
      status: 'ACTIVE',
    });

    const formatted = await formatCartResponse(newCart);
    res.status(201).json({ success: true, cart: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/carts/:cartId
 */
const getCart = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    let cart = await Cart.findOne({ cartId });

    if (!cart) {
      // Auto-create active cart if missing
      cart = await Cart.create({
        cartId,
        items: [],
        status: 'ACTIVE',
      });
    }

    const formatted = await formatCartResponse(cart);
    res.json({ success: true, cart: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/carts/:cartId/items
 */
const addItemToCart = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity = 1 } = req.body;

    const requestedQty = Math.max(1, parseInt(quantity, 10));

    // Verify product and inventory
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, `Product '${productId}' not found`);
    }

    let cart = await Cart.findOne({ cartId, status: 'ACTIVE' });
    if (!cart) {
      cart = await Cart.create({
        cartId,
        items: [],
        status: 'ACTIVE',
      });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    const existingQty = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;
    const totalQty = existingQty + requestedQty;

    if (product.availableStock < totalQty) {
      throw new ApiError(
        409,
        `Cannot add ${requestedQty} more. Available stock: ${product.availableStock}, already in cart: ${existingQty}`
      );
    }

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = totalQty;
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: requestedQty,
      });
    }

    await cart.save();
    const formatted = await formatCartResponse(cart);
    res.json({ success: true, cart: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/carts/:cartId/items/:productId
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);

    const cart = await Cart.findOne({ cartId, status: 'ACTIVE' });
    if (!cart) {
      throw new ApiError(404, `Active cart '${cartId}' not found`);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new ApiError(404, 'Item not found in cart');
    }

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (product.availableStock < newQty) {
        throw new ApiError(
          409,
          `Cannot set quantity to ${newQty}. Only ${product.availableStock} in stock.`
        );
      }

      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = product.price;
    }

    await cart.save();
    const formatted = await formatCartResponse(cart);
    res.json({ success: true, cart: formatted });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/carts/:cartId/items/:productId
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { cartId, productId } = req.params;

    const cart = await Cart.findOne({ cartId, status: 'ACTIVE' });
    if (!cart) {
      throw new ApiError(404, `Active cart '${cartId}' not found`);
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    await cart.save();
    const formatted = await formatCartResponse(cart);
    res.json({ success: true, cart: formatted });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrGetCart,
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
};
