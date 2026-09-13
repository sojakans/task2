/**
 * Formats numbers into currency strings.
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats date/time into a crisp technical string.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Generates an idempotency key for mock payment processing.
 */
export const generateIdempotencyKey = () => {
  return 'IDEMP-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();
};
