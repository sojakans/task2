import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { ReservationCountdown } from '../components/ReservationCountdown';
import { CancelOrderModal } from '../components/CancelOrderModal';

export const OrderDetailsPage = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleConfirmCancel = async (reason) => {
    try {
      setCancelling(true);
      setCancelMessage(null);
      const res = await orderService.cancelOrder(order.orderId, reason);
      if (res.success) {
        setModalOpen(false);
        setCancelMessage({
          type: 'success',
          text: res.refund
            ? `Order cancelled successfully! A full refund of ${formatCurrency(res.refund.amount)} has been recorded (Ref: ${res.refund.refundId}).`
            : 'Order cancelled successfully! Reserved components have been released back to stock.',
        });
        await fetchOrder();
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setCancelMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel order.',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Retrieving order timeline and telemetry...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>error</span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '1rem', fontSize: '1.25rem' }}>Order Not Found</h2>
          <Link to="/orders" className="btn-primary" style={{ marginTop: '1.5rem' }}>Back to Orders</Link>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';
  const isPaid = order.status === 'PAID';
  const isCancelled = order.status === 'CANCELLED';
  const canCancel = isReserved || isPaid;

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
        }}>
          <Link to="/orders" style={{ color: 'var(--text-muted)' }}>My Orders</Link>
          <span>/</span>
          <span style={{ color: 'var(--slate-dark)', fontWeight: 600 }}>Order #{order.orderId}</span>
        </div>

        {/* Cancellation feedback banner */}
        {cancelMessage && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: cancelMessage.type === 'success' ? 'var(--stock-in-bg)' : 'var(--stock-out-bg)',
            border: `1px solid ${cancelMessage.type === 'success' ? 'var(--stock-in-border)' : 'var(--stock-out-border)'}`,
            color: cancelMessage.type === 'success' ? 'var(--stock-in-text)' : 'var(--stock-out-text)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span className="material-symbols-outlined">
              {cancelMessage.type === 'success' ? 'verified' : 'error'}
            </span>
            <span>{cancelMessage.text}</span>
          </div>
        )}

        {/* 5-Min Timer if still RESERVED */}
        {isReserved && (
          <ReservationCountdown
            expiresAt={order.reservationExpiresAt}
            onExpire={fetchOrder}
          />
        )}

        {/* Order Header Card */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-sm)',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-hairline)',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Fulfillment Order File
              </span>
              <h1 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--slate-dark)',
              }}>
                Order #{order.orderId}
              </h1>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Authorized on {formatDate(order.createdAt)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StatusBadge status={order.status} type="order" />

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="btn-danger"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            paddingTop: '1.5rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Payment Status
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)', marginTop: '0.25rem' }}>
                {order.paymentStatus}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Order Value
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {formatCurrency(order.totalAmount)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Stock Released Status
              </span>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: order.stockReleased ? 'var(--stock-warning)' : 'var(--stock-in)', marginTop: '0.25rem' }}>
                {order.stockReleased ? 'Released to Inventory' : 'Deducted / Held'}
              </div>
            </div>

            {order.refund && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Refund Status
                </span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--stock-in)', marginTop: '0.25rem' }}>
                  {order.refund.status} ({formatCurrency(order.refund.amount)})
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cancellation Notice if Cancelled */}
        {isCancelled && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--card-subtle)',
            border: '1px solid var(--border-hairline)',
            marginBottom: '2rem',
          }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.375rem' }}>
              Cancellation & Reversal Log
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Cancelled at: <strong>{formatDate(order.cancelledAt)}</strong>
            </div>
            {order.cancelReason && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Reason: <em>"{order.cancelReason}"</em>
              </div>
            )}
            {order.refund && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#ecfdf5',
                borderRadius: '6px',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}>
                Refund Record: {order.refund.refundId} — Amount credited: {formatCurrency(order.refund.amount)}
              </div>
            )}
          </div>
        )}

        {/* Items Table Card */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--card-subtle)',
            borderBottom: '1px solid var(--border-hairline)',
            fontWeight: 700,
            fontSize: '0.875rem',
          }}>
            Hardware Bill of Materials (BOM)
          </div>

          <div>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: idx !== order.items.length - 1 ? '1px solid var(--border-hairline)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--slate-dark)', display: 'block' }}>
                    {item.name}
                  </strong>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Unit Price: {formatCurrency(item.price)} × {item.quantity} unit(s)
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: 'var(--slate-dark)' }}>
                    {formatCurrency(item.subtotal)}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '1.25rem 1.5rem',
            background: 'var(--card-subtle)',
            borderTop: '1px solid var(--border-hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
            <strong style={{ fontSize: '1rem', color: 'var(--slate-dark)' }}>Total Settled:</strong>
            <span style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--primary)',
            }}>
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Action link if RESERVED */}
        {isReserved && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link
              to={`/payment/${order.orderId}`}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              <span>Proceed to Payment Sandbox</span>
              <span className="material-symbols-outlined">payments</span>
            </Link>
          </div>
        )}

        {/* Cancel Order Modal */}
        <CancelOrderModal
          order={order}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmCancel}
          loading={cancelling}
        />
      </div>
    </div>
  );
};
