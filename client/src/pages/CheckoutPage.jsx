import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { ReservationCountdown } from '../components/ReservationCountdown';
import { StatusBadge } from '../components/StatusBadge';

export const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error loading order for checkout:', err);
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCountdownExpire = async () => {
    console.log('[Checkout] Countdown reached 0. Refreshing order status from backend...');
    await fetchOrder();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Synchronizing stock reservation status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-hairline)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>
            error
          </span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '1rem', fontSize: '1.25rem' }}>
            {error || 'Invalid Order Reference'}
          </h2>
          <Link to="/products" className="btn-primary" style={{ marginTop: '1.5rem' }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';
  const isExpired = order.status === 'EXPIRED';

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--primary)',
              display: 'block',
              marginBottom: '0.25rem',
            }}>
              Order Locking Protocol
            </span>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
            }}>
              Checkout & Stock Reservation
            </h1>
          </div>
          <StatusBadge status={order.status} type="order" />
        </div>

        {/* 5-Minute Reservation Countdown Component */}
        {isReserved && (
          <ReservationCountdown
            expiresAt={order.reservationExpiresAt}
            onExpire={handleCountdownExpire}
          />
        )}

        {isExpired && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--stock-out-bg)',
            border: '1px solid var(--stock-out-border)',
            color: 'var(--stock-out-text)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                hourglass_disabled
              </span>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>Reservation Expired</strong>
                <span style={{ fontSize: '0.875rem' }}>
                  The 5-minute allocation window expired. Your reserved components have been released back to stock.
                </span>
              </div>
            </div>
            <Link to="/products" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Re-order Components
            </Link>
          </div>
        )}

        {/* Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}>
          {/* Left: Customer & Shipping Verification */}
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--slate-dark)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                local_shipping
              </span>
              Delivery & Fulfillment Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Recipient Engineer
                </label>
                <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>
                  {order.customer?.fullName || 'Lead Hardware Engineer'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Engineering Dispatch Address
                </label>
                <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>
                  {order.customer?.address || 'Silicon Hub 404, Tech Park, Bangalore 560100'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Notification Telemetry Email
                </label>
                <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>
                  {order.customer?.email || 'maker@techloom.store'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Reserved Items & Continue to Payment */}
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--slate-dark)',
              }}>
                Locked Allocation ({order.items.length} items)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                Ref: {order.orderId}
              </span>
            </div>

            {/* Items Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-hairline)',
                    fontSize: '0.875rem',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--slate-dark)', display: 'block' }}>{item.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatCurrency(item.price)} × {item.quantity} unit(s)
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--slate-dark)' }}>
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingTop: '0.5rem',
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
                Total Reserved Amount:
              </span>
              <span style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--primary)',
              }}>
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            {isReserved ? (
              <button
                type="button"
                onClick={() => navigate(`/payment/${order.orderId}`)}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <span>Continue to Simulated Payment</span>
                <span className="material-symbols-outlined">payments</span>
              </button>
            ) : isExpired ? (
              <button
                type="button"
                disabled
                className="btn-secondary"
                style={{ width: '100%', padding: '0.875rem', opacity: 0.6 }}
              >
                Payment Disabled (Reservation Expired)
              </button>
            ) : (
              <Link
                to={`/orders/${order.orderId}`}
                className="btn-secondary"
                style={{ width: '100%', padding: '0.875rem' }}
              >
                View Order Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
