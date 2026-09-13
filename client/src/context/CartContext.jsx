import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeCart = async () => {
    try {
      setLoading(true);
      const storedCartId = localStorage.getItem('techloom_cart_id');
      const data = await cartService.createOrGetCart(storedCartId);
      if (data.success && data.cart) {
        setCart(data.cart);
        localStorage.setItem('techloom_cart_id', data.cart.cartId);
      }
    } catch (err) {
      console.error('Failed to initialize cart:', err);
      setError('Unable to load cart. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeCart();
  }, []);

  const refreshCart = async () => {
    if (!cart?.cartId) return;
    try {
      const data = await cartService.getCart(cart.cartId);
      if (data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Error refreshing cart:', err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setError(null);
      let activeCartId = cart?.cartId || localStorage.getItem('techloom_cart_id');
      if (!activeCartId) {
        const initData = await cartService.createOrGetCart();
        activeCartId = initData.cart.cartId;
        localStorage.setItem('techloom_cart_id', activeCartId);
      }

      const data = await cartService.addItem(activeCartId, productId, quantity);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!cart?.cartId) return;
    try {
      setError(null);
      const data = await cartService.updateItem(cart.cartId, productId, quantity);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update item quantity';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (productId) => {
    if (!cart?.cartId) return;
    try {
      setError(null);
      const data = await cartService.removeItem(cart.cartId, productId);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const resetCartAfterCheckout = async () => {
    localStorage.removeItem('techloom_cart_id');
    await initializeCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        resetCartAfterCheckout,
        itemCount: cart?.itemCount || 0,
        subtotal: cart?.subtotal || 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
