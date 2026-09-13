import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);

  const isOutOfStock = product.availableStock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock || adding) return;

    setAdding(true);
    const res = await addToCart(product._id, 1);
    setAdding(false);

    if (res.success) {
      setMessage('Added to cart!');
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage(res.message);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="spec-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Product Image Header */}
      <Link to={`/products/${product._id}`} style={{ position: 'relative', overflow: 'hidden', background: '#f1f5f9', display: 'block' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '210px',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {product.sku && (
          <span style={{
            position: 'absolute',
            bottom: '0.5rem',
            left: '0.5rem',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#f8fafc',
            fontSize: '0.6875rem',
            fontWeight: 600,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)',
            fontFamily: 'monospace',
          }}>
            {product.sku}
          </span>
        )}
      </Link>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Stock Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--secondary)',
          }}>
            {product.category}
          </span>
          <StatusBadge status={product.availableStock} type="stock" />
        </div>

        {/* Product Title */}
        <Link to={`/products/${product._id}`} style={{ flex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--slate-dark)',
            lineHeight: 1.4,
            marginBottom: '0.5rem',
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Hardware Specs Pills */}
        {product.specs && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
            {product.specs.architecture && (
              <span style={{
                fontSize: '0.6875rem',
                background: 'var(--card-subtle)',
                color: 'var(--slate-dark)',
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                border: '1px solid var(--border-hairline)',
              }}>
                {product.specs.architecture}
              </span>
            )}
            {product.specs.clockSpeed && (
              <span style={{
                fontSize: '0.6875rem',
                background: 'var(--card-subtle)',
                color: 'var(--slate-dark)',
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                border: '1px solid var(--border-hairline)',
              }}>
                {product.specs.clockSpeed}
              </span>
            )}
          </div>
        )}

        {/* Price & Actions */}
        <div style={{
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}>
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block' }}>
              Unit Price
            </span>
            <span style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
            }}>
              {formatCurrency(product.price)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <Link
              to={`/products/${product._id}`}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
              title="View Specifications"
            >
              Specs
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className="btn-primary"
              style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                add_shopping_cart
              </span>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {message && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            textAlign: 'center',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            background: message.includes('Added') ? 'var(--stock-in-bg)' : 'var(--stock-out-bg)',
            color: message.includes('Added') ? 'var(--stock-in-text)' : 'var(--stock-out-text)',
            border: `1px solid ${message.includes('Added') ? 'var(--stock-in-border)' : 'var(--stock-out-border)'}`,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
