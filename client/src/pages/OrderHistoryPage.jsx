import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';

export const OrderHistoryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '4rem 0 6rem 0' }}>
        <div className="container" style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '3rem 2rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)' }}>
              lock_person
            </span>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.375rem', marginTop: '1rem', color: 'var(--slate-dark)' }}>
              Sign In to View Orders
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Please sign in to access your hardware purchases, reservation holds, and refund telemetry.
            </p>
            <Link to="/login?redirect=/orders" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              Sign In to Maker Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'ALL') return true;
    return order.status === filterTab;
  });

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
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
              Order History & Tracking
            </span>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
            }}>
              My Engineering Orders
            </h1>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            Refresh Log
          </button>
        </div>

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-hairline)',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}>
          {['ALL', 'RESERVED', 'PAID', 'CANCELLED', 'EXPIRED'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: filterTab === tab ? 700 : 500,
                color: filterTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: filterTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab === 'ALL' ? 'All Orders' : tab}
              <span style={{
                marginLeft: '0.375rem',
                fontSize: '0.75rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                background: filterTab === tab ? 'var(--primary-subtle)' : 'var(--card-subtle)',
                color: filterTab === tab ? 'var(--primary)' : 'var(--text-subtle)',
              }}>
                {tab === 'ALL' ? orders.length : orders.filter((o) => o.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* States */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
              progress_activity
            </span>
            <p style={{ marginTop: '0.75rem' }}>Loading verified order records...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--stock-out-bg)', borderRadius: 'var(--radius-lg)', color: 'var(--stock-out-text)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>error</span>
            <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-subtle)' }}>
              inbox
            </span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', marginTop: '0.75rem' }}>
              No orders found in '{filterTab}'
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Browse hardware and complete a checkout session to test order logging.
            </p>
            <Link to="/products" className="btn-primary" style={{ marginTop: '1.25rem' }}>
              Shop Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="spec-card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Header Row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-hairline)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Order ID
                      </span>
                      <h3 style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 800, color: 'var(--slate-dark)' }}>
                        #{order.orderId}
                      </h3>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-hairline)' }} />

                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Date
                      </span>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--slate-dark)', fontWeight: 500 }}>
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={order.status} type="order" />

                    {/* Refund Badge if available */}
                    {order.refund && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid #a7f3d0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>currency_exchange</span>
                        Refund: {order.refund.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items & Total Row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                }}>
                  {/* Items summary */}
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {order.items.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--slate-dark)' }}>
                          <strong>{item.name}</strong> × <span style={{ fontFamily: 'monospace' }}>{item.quantity}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.8125rem' }}>
                            ({formatCurrency(item.subtotal)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Historical Total */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Historical Order Total
                    </span>
                    <strong style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.375rem',
                      fontWeight: 800,
                      color: 'var(--slate-dark)',
                    }}>
                      {formatCurrency(order.totalAmount)}
                    </strong>
                  </div>

                  {/* Details Button */}
                  <div>
                    <Link
                      to={`/orders/${order.orderId}`}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      <span>View Details</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
