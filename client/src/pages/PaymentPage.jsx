import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService, paymentService } from '../services/api';
import { formatCurrency, generateIdempotencyKey } from '../utils/formatters';
import { ReservationCountdown } from '../components/ReservationCountdown';

export const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Idempotency state
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey());
  const [processing, setProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(orderId);
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Error fetching order for payment:', err);
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleSimulatePayment = async (outcome) => {
    if (processing || !order) return;

    try {
      setProcessing(true);
      setError(null);
      setResultMessage(null);

      const res = await paymentService.processPayment({
        orderId: order.orderId,
        outcome,
        idempotencyKey,
      });

      setLastPayment(res.payment);

      if (res.isIdempotentReplay) {
        setResultMessage({
          type: 'warning',
          title: 'Duplicate Payment Request Detected (Idempotency Active)',
          text: `Key '${idempotencyKey}' was already processed. Returned existing payment record ${res.payment.paymentId}. No duplicate charge was made!`,
        });
        await fetchOrder();
        return;
      }

      if (outcome === 'SUCCESS') {
        navigate(`/order-success/${order.orderId}`);
      } else if (outcome === 'FAILED') {
        setResultMessage({
          type: 'error',
          title: 'Simulated Payment Failed',
          text: 'Payment failure simulated. The order status is marked FAILED and reserved stock was immediately released back to inventory.',
        });
        await fetchOrder();
      } else if (outcome === 'TIMEOUT') {
        setResultMessage({
          type: 'warning',
          title: 'Simulated Payment Timeout (Delayed Gateway)',
          text: 'The payment gateway timed out. Payment remains PENDING. If reservation expires, stock will be reclaimed automatically.',
        });
        await fetchOrder();
      }
    } catch (err) {
      console.error('Payment error:', err);
      const msg = err.response?.data?.message || 'Payment processing error';
      setError(msg);
      await fetchOrder();
    } finally {
      setProcessing(false);
    }
  };

  const handleRegenerateKey = () => {
    setIdempotencyKey(generateIdempotencyKey());
    setResultMessage(null);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Loading mock payment sandbox...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: 'var(--card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>error</span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '1rem', fontSize: '1.25rem' }}>{error}</h2>
          <Link to="/products" className="btn-primary" style={{ marginTop: '1.5rem' }}>Browse Catalog</Link>
        </div>
      </div>
    );
  }

  const isReserved = order.status === 'RESERVED';
  const isPaid = order.status === 'PAID';
  const isExpired = order.status === 'EXPIRED';
  const isFailed = order.status === 'FAILED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Banner Alert clearly identifying MOCK ENVIRONMENT */}
        <div style={{
          background: 'var(--slate-dark)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          border: '1px solid var(--slate-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#38bdf8', fontSize: '24px' }}>
              developer_mode
            </span>
            <div>
              <strong style={{ fontSize: '0.9375rem', display: 'block' }}>
                MOCK PAYMENT GATEWAY (SANDBOX SIMULATOR)
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                This sandbox tests state transitions, stock retention, and idempotency protection without real financial instruments.
              </span>
            </div>
          </div>
          <span style={{
            fontSize: '0.6875rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            background: 'var(--slate-muted)',
            color: '#38bdf8',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}>
            TEST_ENV_ACTIVE
          </span>
        </div>

        {/* 5-Min Countdown */}
        {isReserved && (
          <ReservationCountdown
            expiresAt={order.reservationExpiresAt}
            onExpire={fetchOrder}
          />
        )}

        {/* Feedback Alert */}
        {resultMessage && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: resultMessage.type === 'error' ? 'var(--stock-out-bg)' : '#fffbeb',
            border: `1px solid ${resultMessage.type === 'error' ? 'var(--stock-out-border)' : '#fde68a'}`,
            color: resultMessage.type === 'error' ? 'var(--stock-out-text)' : '#92400e',
            marginBottom: '1.5rem',
          }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.25rem' }}>
              {resultMessage.title}
            </strong>
            <p style={{ fontSize: '0.875rem' }}>{resultMessage.text}</p>
          </div>
        )}

        {/* Payment Card */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-md)',
          padding: '2rem',
        }}>
          {/* Order Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-hairline)',
            marginBottom: '1.5rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Transaction Target
              </span>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-dark)' }}>
                Order #{order.orderId}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Payable Amount
              </span>
              <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(order.totalAmount)}
              </div>
            </div>
          </div>

          {/* Idempotency Key Configuration Block */}
          <div style={{
            background: 'var(--card-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            border: '1px solid var(--border-hairline)',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>
                  security
                </span>
                Idempotency Key (Duplicate-Payment Protection)
              </label>
              <button
                type="button"
                onClick={handleRegenerateKey}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                Generate New Key
              </button>
            </div>
            <input
              type="text"
              className="input-field"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.8125rem', background: '#ffffff' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem', display: 'block' }}>
              Tip: Click any payment outcome multiple times with the same key to verify duplicate submission protection.
            </span>
          </div>

          {/* Outcome Buttons if RESERVED */}
          {isReserved ? (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '1rem' }}>
                Trigger Simulated Outcome:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {/* SUCCESS */}
                <button
                  type="button"
                  onClick={() => handleSimulatePayment('SUCCESS')}
                  disabled={processing}
                  className="btn-primary"
                  style={{
                    padding: '1rem',
                    flexDirection: 'column',
                    background: 'var(--stock-in)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    check_circle
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>Simulate 200 SUCCESS</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Order becomes PAID & stock locked</span>
                </button>

                {/* FAILED */}
                <button
                  type="button"
                  onClick={() => handleSimulatePayment('FAILED')}
                  disabled={processing}
                  className="btn-danger"
                  style={{ padding: '1rem', flexDirection: 'column' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    cancel
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>Simulate 402 DECLINE</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Order FAILED & stock released</span>
                </button>

                {/* TIMEOUT */}
                <button
                  type="button"
                  onClick={() => handleSimulatePayment('TIMEOUT')}
                  disabled={processing}
                  className="btn-secondary"
                  style={{ padding: '1rem', flexDirection: 'column' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--stock-warning)' }}>
                    schedule
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>Simulate 504 TIMEOUT</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stalls until 5-min expiry</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-dark)', marginBottom: '1rem' }}>
                Payment is inactive for this order because its status is: <strong>{order.status}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Link to={`/orders/${order.orderId}`} className="btn-primary">
                  View Order Details
                </Link>
                <Link to="/products" className="btn-secondary">
                  Browse Store
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
