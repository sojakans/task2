import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, resetCartAfterCheckout } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const navigate = useNavigate();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  const handleStartCheckout = async () => {
    if (isEmpty || checkingOut) return;

    // Must be logged in to order/checkout
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart&prompt=order');
      return;
    }

    try {
      setCheckingOut(true);
      setCheckoutError(null);

      // Trigger checkout on server
      const res = await checkoutService.checkout(cart.cartId, {
        fullName: user?.name || 'Lead Hardware Engineer',
        email: user?.email || 'engineer@techloom.store',
        address: 'Robotics Lab 102, Innovation Quarter',
        city: 'Bangalore',
        postalCode: '560100',
      });

      if (res.success && res.order) {
        // Reset active cart in local storage
        await resetCartAfterCheckout();
        // Route customer to checkout reservation view
        navigate(`/checkout/${res.order.orderId}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Failed to start checkout. Check inventory availability.';
      setCheckoutError(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Calculating server-side cart totals...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--primary)',
            display: 'block',
            marginBottom: '0.25rem',
          }}>
            Allocation Queue
          </span>
          <h1 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--slate-dark)',
          }}>
            Shopping Cart ({cart?.itemCount || 0} items)
          </h1>
        </div>

        {checkoutError && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--stock-out-bg)',
            border: '1px solid var(--stock-out-border)',
            color: 'var(--stock-out-text)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>error</span>
            <div>
              <strong style={{ display: 'block' }}>Checkout Reservation Blocked</strong>
              <span>{checkoutError}</span>
            </div>
          </div>
        )}

        {isEmpty ? (
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-hairline)',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--text-subtle)' }}>
              production_quantity_limits
            </span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.375rem', marginTop: '1rem', color: 'var(--slate-dark)' }}>
              Your Component Cart is Empty
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
              Explore our microcontrollers, development boards, and calibrated sensor modules to configure your project.
            </p>
            <Link to="/products" className="btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              Discover Hardware
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}>
            {/* Left: Itemized Cart Items */}
            <div style={{
              background: 'var(--card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-hairline)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-hairline)',
                background: 'var(--card-subtle)',
                fontWeight: 700,
                fontSize: '0.875rem',
                color: 'var(--slate-dark)',
              }}>
                Itemized Component Specifications
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid var(--border-hairline)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                    }}
                  >
                    {/* Item Image & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '220px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-hairline)',
                        }}
                      />
                      <div>
                        <Link
                          to={`/products/${item.productId}`}
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9375rem',
                            color: 'var(--slate-dark)',
                            display: 'block',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {item.name}
                        </Link>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          Unit: {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                      }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          style={{ padding: '0.4rem 0.6rem', background: '#f8fafc', fontWeight: 700 }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          style={{ padding: '0.4rem 0.6rem', background: '#f8fafc', fontWeight: 700 }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        style={{
                          color: 'var(--text-subtle)',
                          padding: '0.4rem',
                          borderRadius: '4px',
                        }}
                        title="Remove from cart"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          delete
                        </span>
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>
                        Subtotal
                      </span>
                      <strong style={{ fontSize: '1rem', color: 'var(--slate-dark)', fontFamily: 'monospace' }}>
                        {formatCurrency(item.subtotal)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Server Order Summary & Checkout Action */}
            <div style={{
              background: 'var(--card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-hairline)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-md)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--slate-dark)',
                marginBottom: '1.25rem',
              }}>
                Order Pricing Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>Verified Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{formatCurrency(cart?.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>Hardware Excise & Tax:</span>
                  <span style={{ fontWeight: 600, color: 'var(--stock-in)' }}>Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>Express Logistics (India):</span>
                  <span style={{ fontWeight: 600, color: 'var(--stock-in)' }}>FREE</span>
                </div>

                <div style={{
                  paddingTop: '0.75rem',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border-hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}>
                  <strong style={{ fontSize: '1.125rem', color: 'var(--slate-dark)' }}>Total Payable:</strong>
                  <span style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '1.625rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                  }}>
                    {formatCurrency(cart?.total)}
                  </span>
                </div>
              </div>

              {/* Stock Reservation Notice */}
              <div style={{
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--card-subtle)',
                border: '1px solid var(--border-hairline)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                  lock_clock
                </span>
                <span>
                  Starting checkout triggers an atomic <strong>5-minute stock reservation lock</strong> to secure components against race conditions.
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartCheckout}
                disabled={isEmpty || checkingOut}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {checkingOut ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                      sync
                    </span>
                    Reserving Inventory...
                  </>
                ) : (
                  <>
                    <span>Proceed to Stock Reservation</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
