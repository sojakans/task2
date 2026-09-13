import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { seedService } from '../services/api';

export const Header = () => {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [reseedLoading, setReseedLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleReseed = async () => {
    if (confirm('Re-seed database with fresh hardware products?')) {
      try {
        setReseedLoading(true);
        await seedService.reseed();
        alert('Database successfully re-seeded!');
        window.location.reload();
      } catch (err) {
        alert('Failed to reseed database: ' + err.message);
      } finally {
        setReseedLoading(false);
      }
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-hairline)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container">
        {/* Main Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
          gap: '1.5rem',
        }}>
          {/* Logo & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  memory
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                <span style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--slate-dark)',
                }}>
                  Techloom
                </span>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '4px',
                  background: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                }}>
                  Makers
                </span>
              </div>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/"
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--slate-dark)',
                  transition: 'background 0.15s',
                }}
              >
                Home
              </Link>
              <Link
                to="/products"
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  transition: 'color 0.15s',
                }}
              >
                Products
              </Link>
              <Link
                to="/orders"
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  transition: 'color 0.15s',
                }}
              >
                My Orders
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '480px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--text-subtle)',
                fontSize: '20px',
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input
              type="text"
              className="input-field"
              placeholder="Search products, microcontrollers, sensors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', paddingRight: '4rem', background: 'var(--card-subtle)' }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '0.5rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                background: '#ffffff',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-muted)',
              }}
            >
              Search
            </button>
          </form>

          {/* Actions & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Seed Database utility */}
            <button
              onClick={handleReseed}
              disabled={reseedLoading}
              title="Reset sample hardware catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.375rem 0.625rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'var(--card-subtle)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-hairline)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                sync
              </span>
              {reseedLoading ? 'Seeding...' : 'Reset Catalog'}
            </button>

            {/* Cart Link */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--slate-dark)',
                background: 'var(--card-subtle)',
                transition: 'background 0.15s',
              }}
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                shopping_bag
              </span>
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9999px',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-hairline)' }} />

            {/* Profile / Auth Button */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div
                  title={user?.email}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7 0%, #004ac6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                  }}
                >
                  {(user?.name || 'M').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-dark)', lineHeight: 1.2 }}>
                    {user?.name}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--stock-out)',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-secondary"
                style={{
                  padding: '0.45rem 0.875rem',
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  account_circle
                </span>
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Sub-bar / Telemetry Status (from Stitch layout) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.375rem',
          paddingBottom: '0.375rem',
          borderTop: '1px solid var(--border-hairline)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--stock-in)', fontWeight: 600 }}>
              <span className="pulse-dot" style={{ background: 'var(--stock-in)' }} />
              Global Silicon Logistics Live
            </span>
            <span style={{ color: 'var(--border-focused)' }}>/</span>
            <span>Microcontrollers, FPGAs, Telemetry Sensors</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Express Dispatch within 4h</span>
            <span style={{ color: 'var(--border-focused)' }}>•</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
              5-Min Guaranteed Stock Lock
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
