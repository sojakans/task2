import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to all requests if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('techloom_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

export const cartService = {
  createOrGetCart: async (cartId = null) => {
    const response = await api.post('/carts', { cartId });
    return response.data;
  },
  getCart: async (cartId) => {
    const response = await api.get(`/carts/${cartId}`);
    return response.data;
  },
  addItem: async (cartId, productId, quantity = 1) => {
    const response = await api.post(`/carts/${cartId}/items`, { productId, quantity });
    return response.data;
  },
  updateItem: async (cartId, productId, quantity) => {
    const response = await api.put(`/carts/${cartId}/items/${productId}`, { quantity });
    return response.data;
  },
  removeItem: async (cartId, productId) => {
    const response = await api.delete(`/carts/${cartId}/items/${productId}`);
    return response.data;
  },
};

export const checkoutService = {
  checkout: async (cartId, customer) => {
    const response = await api.post('/checkout', { cartId, customer });
    return response.data;
  },
};

export const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  cancelOrder: async (orderId, reason) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};

export const paymentService = {
  processPayment: async ({ orderId, outcome, idempotencyKey }) => {
    const response = await api.post('/payments', { orderId, outcome, idempotencyKey });
    return response.data;
  },
};

export const seedService = {
  reseed: async () => {
    const response = await api.post('/seed');
    return response.data;
  },
};

export default api;
