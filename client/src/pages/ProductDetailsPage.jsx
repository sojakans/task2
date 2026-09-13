import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { useCart } from '../context/CartContext';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        if (data.success && data.product) {
          setProduct(data.product);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Product not found or unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isOutOfStock = !product || product.availableStock <= 0;
  const maxAllowedQuantity = product ? Math.max(1, product.availableStock) : 1;

  const handleIncrement = () => {
    if (quantity < maxAllowedQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return;

    setAdding(true);
    setFeedback(null);

    const res = await addToCart(product._id, quantity);
    setAdding(false);

    if (res.success) {
      setFeedback({ type: 'success', text: `Successfully added ${quantity} unit(s) of ${product.name} to cart!` });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving component telemetry and specs...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: 'var(--card)',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-hairline)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--stock-out)' }}>
            error
          </span>
          <h2 style={{ fontFamily: 'var(--font-headline)', marginTop: '1rem', fontSize: '1.25rem' }}>
            {error || 'Component Not Found'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            The requested hardware identifier could not be verified in the silicon registry.
          </p>
          <Link to="/products" className="btn-primary" style={{ marginTop: '1.5rem' }}>
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
        }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--text-muted)' }}>Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} style={{ color: 'var(--text-muted)' }}>{product.category}</Link>
          <span>/</span>
          <span style={{ color: 'var(--slate-dark)', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}>
          {/* Left: Product Visual Card */}
          <div>
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-hairline)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  maxHeight: '440px',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {product.sku && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#f8fafc',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '6px',
                  backdropFilter: 'blur(4px)',
                }}>
                  SKU: {product.sku}
                </div>
              )}
            </div>

            {/* Live Logistics Guarantee Box */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--card-subtle)',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>
                  verified
                </span>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                    Certified Factory Lot Stock
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Guaranteed 5-min checkout reservation hold
                  </div>
                </div>
              </div>
              <span className="badge-stock-in">Active Ping</span>
            </div>
          </div>

          {/* Right: Technical Details & Actions */}
          <div>
            {/* Category & Status Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--secondary)',
              }}>
                {product.category}
              </span>
              <StatusBadge status={product.availableStock} type="stock" />
            </div>

            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.875rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
              lineHeight: 1.3,
              marginBottom: '1rem',
            }}>
              {product.name}
            </h1>

            <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Pricing Section */}
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: '#ffffff',
              border: '1px solid var(--border-hairline)',
              marginBottom: '1.5rem',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Direct Unit Price
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--slate-dark)',
                }}>
                  {formatCurrency(product.price)}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  (incl. all applicable electronics excise)
                </span>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.5rem', display: 'block' }}>
                Quantity Selection
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                {/* Stepped Quantity Controls */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}>
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    style={{
                      padding: '0.625rem 0.875rem',
                      background: '#f8fafc',
                      color: 'var(--slate-dark)',
                      fontWeight: 700,
                      borderRight: '1px solid var(--border-hairline)',
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    minWidth: '48px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                  }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= maxAllowedQuantity || isOutOfStock}
                    style={{
                      padding: '0.625rem 0.875rem',
                      background: '#f8fafc',
                      color: 'var(--slate-dark)',
                      fontWeight: 700,
                      borderLeft: '1px solid var(--border-hairline)',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                  }}
                >
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                  {adding
                    ? 'Validating Stock...'
                    : isOutOfStock
                    ? 'Out of Stock'
                    : `Add ${quantity} Unit(s) — ${formatCurrency(product.price * quantity)}`}
                </button>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: feedback.type === 'success' ? 'var(--stock-in-bg)' : 'var(--stock-out-bg)',
                  color: feedback.type === 'success' ? 'var(--stock-in-text)' : 'var(--stock-out-text)',
                  border: `1px solid ${feedback.type === 'success' ? 'var(--stock-in-border)' : 'var(--stock-out-border)'}`,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {feedback.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span>{feedback.text}</span>
                  {feedback.type === 'success' && (
                    <Link
                      to="/cart"
                      style={{
                        marginLeft: 'auto',
                        fontWeight: 700,
                        textDecoration: 'underline',
                      }}
                    >
                      View Cart →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Technical Specification Sheet Table */}
            {product.specs && (
              <div style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-hairline)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  background: 'var(--card-subtle)',
                  padding: '0.875rem 1.25rem',
                  borderBottom: '1px solid var(--border-hairline)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--slate-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                    description
                  </span>
                  Parametric Hardware Specifications
                </div>

                <div style={{ padding: '0.5rem 1.25rem' }}>
                  {Object.entries(product.specs).map(([key, val]) => {
                    if (!val) return null;
                    const formattedVal = Array.isArray(val) ? val.join(', ') : val;
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.625rem 0',
                          borderBottom: '1px solid #f1f5f9',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                        <span style={{ fontWeight: 600, color: 'var(--slate-dark)', fontFamily: 'monospace' }}>
                          {formattedVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
