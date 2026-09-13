import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderId);
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error fetching order for success page:', err);
        setError('Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Confirming dispatch authorization...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>error</span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '1rem', fontSize: '1.25rem' }}>Order Not Found</h2>
          <Link to="/orders" className="btn-primary" style={{ marginTop: '1.5rem' }}>View Order History</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Success Card */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>
          {/* Green Hero Header */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', fontWeight: 800 }}>
                check
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Payment Successful & Silicon Allocated!
            </h1>
            <p style={{ fontSize: '0.9375rem', opacity: 0.95 }}>
              Your transaction has been cryptographically settled. Components have been allocated for laboratory dispatch.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>
            {/* Meta Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              padding: '1.25rem',
              background: 'var(--card-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-hairline)',
              marginBottom: '2rem',
            }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Identifier
                </span>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--slate-dark)', fontFamily: 'monospace' }}>
                  {order.orderId}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Date Authorized
                </span>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--slate-dark)' }}>
                  {formatDate(order.createdAt)}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Order Status
                </span>
                <div style={{ marginTop: '0.25rem' }}>
                  <StatusBadge status={order.status} type="order" />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Settled
                </span>
                <strong style={{ display: 'block', fontSize: '1.125rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {formatCurrency(order.totalAmount)}
                </strong>
              </div>
            </div>

            {/* Next Steps Fulfillment Timeline */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Automated Fulfillment Pipeline:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--stock-in)' }}>check_circle</span>
                  <span><strong>Component Reservation Locked:</strong> Silicon lot inventory decremented.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--stock-in)' }}>check_circle</span>
                  <span><strong>Payment Verification:</strong> 200 OK captured by mock gateway.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>schedule</span>
                  <span style={{ color: 'var(--text-muted)' }}>Warehouse inspection & anti-static ESD packaging (within 4h).</span>
                </div>
              </div>
            </div>

            {/* Items Summary Table */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Purchased Hardware Items:
              </h3>
              <div style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderBottom: idx !== order.items.length - 1 ? '1px solid var(--border-hairline)' : 'none',
                      fontSize: '0.875rem',
                      background: idx % 2 === 0 ? '#ffffff' : 'var(--card-subtle)',
                    }}
                  >
                    <span>{item.name} × <strong>{item.quantity}</strong></span>
                    <strong style={{ fontFamily: 'monospace' }}>{formatCurrency(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
              <Link to={`/orders/${order.orderId}`} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                <span className="material-symbols-outlined">receipt_long</span>
                View Order Details
              </Link>

              <Link to="/products" className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                <span>Continue Shopping</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
