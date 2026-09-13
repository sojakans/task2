import React from 'react';

export const StatusBadge = ({ status, type = 'order' }) => {
  if (type === 'stock') {
    const stockCount = Number(status);
    if (stockCount > 5) {
      return (
        <span className="badge-stock-in">
          <span className="pulse-dot" style={{ background: 'var(--stock-in)' }}></span>
          {stockCount} in stock
        </span>
      );
    }
    if (stockCount > 0) {
      return (
        <span className="badge-stock-warning">
          <span className="pulse-dot" style={{ background: 'var(--stock-warning)' }}></span>
          Only {stockCount} left
        </span>
      );
    }
    return (
      <span className="badge-stock-out">
        <span className="pulse-dot" style={{ background: 'var(--stock-out)' }}></span>
        Out of stock
      </span>
    );
  }

  // Order & Payment Status Badge
  const normalizedStatus = (status || 'PENDING').toUpperCase();

  const config = {
    RESERVED: { label: 'Stock Reserved', icon: 'timer', className: 'status-pill RESERVED' },
    PAID: { label: 'Payment Paid', icon: 'check_circle', className: 'status-pill PAID' },
    FAILED: { label: 'Payment Failed', icon: 'error', className: 'status-pill FAILED' },
    EXPIRED: { label: 'Reservation Expired', icon: 'hourglass_disabled', className: 'status-pill EXPIRED' },
    CANCELLED: { label: 'Cancelled', icon: 'cancel', className: 'status-pill CANCELLED' },
    PENDING: { label: 'Pending', icon: 'schedule', className: 'status-pill' },
  };

  const current = config[normalizedStatus] || config.PENDING;

  return (
    <span className={current.className} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        {current.icon}
      </span>
      {current.label}
    </span>
  );
};
