import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts({ limit: 6 });
        if (data.success) {
          setFeaturedProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section (Matching Stitch Home Screen) */}
      <section style={{
        backgroundColor: 'var(--slate-dark)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        padding: '4rem 0',
      }}>
        {/* Ambient Grid Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}>
            {/* Left Hero Content */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                background: 'var(--slate-muted)',
                color: '#7dd3fc',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1.25rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--stock-in)' }}>
                  bolt
                </span>
                Real-time Silicon Logistics Engine v4.2
              </div>

              <h1 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '1rem',
              }}>
                Build. Create.{' '}
                <span style={{ color: '#38bdf8' }}>Innovate.</span>
              </h1>

              <p style={{
                fontSize: '1.0625rem',
                color: '#cbd5e1',
                lineHeight: 1.6,
                maxWidth: '540px',
                marginBottom: '2rem',
              }}>
                Precision electronics and development components for hardware engineers, IoT specialists, roboticists, and makers. Certified microcontrollers, calibrated telemetry sensors, and certified robotics modules ready for immediate deployment.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link
                  to="/products"
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                  <span>Explore Catalog</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    arrow_forward
                  </span>
                </Link>
                <Link
                  to="/orders"
                  className="btn-secondary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    background: 'var(--slate-muted)',
                    color: '#ffffff',
                    borderColor: 'var(--slate-surface)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7dd3fc' }}>
                    receipt_long
                  </span>
                  <span>My Orders</span>
                </Link>
              </div>

              {/* Technical Trust Badges */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginTop: '2.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid #1e293b',
              }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--stock-warning)', fontSize: '20px' }}>
                    timer
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Guaranteed
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                    5-Min Stock Lock
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--stock-in)', fontSize: '20px' }}>
                    local_shipping
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Express
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                    4h Dispatch
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#38bdf8', fontSize: '20px' }}>
                    terminal
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Engineered
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                    Atomic Inventory
                  </div>
                </div>
              </div>
            </div>

            {/* Right Telemetry Bench Card */}
            <div>
              <div style={{
                background: 'var(--slate-muted)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                border: '1px solid var(--slate-surface)',
                boxShadow: 'var(--shadow-xl)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stock-out)' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stock-warning)' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stock-in)' }}></div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginLeft: '0.25rem' }}>
                      MCU_TELEMETRY.SYS
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: 'var(--stock-in)',
                    fontWeight: 700,
                  }}>
                    LIVE PING 12ms
                  </span>
                </div>

                <div style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  height: '240px',
                  marginBottom: '1.25rem',
                  background: 'var(--slate-dark)',
                }}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIdGiIB-wJyLRSD44B08eCxDJ9UB-lBP_LMpK3FelFoJqbZoASLYPoVH8mO5eX1QkcEx3B0w7y8V08q1nTvnfDb6xdU4HcDf08gTSambDGpQE6geYjjI88fuE4vbrgG0-W-qY9xqMw96D0uLAkrdO29wUkhuC8voYNTJUNAlYGNVSXCmT2CwNlPHUv9W6MTozo-oGLNgSPB7UVWTNUM1XESyYDqelDal48kKddXhkKtuFguCbOJzYA"
                    alt="ESP32 Microcontroller PCB"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.9)',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                  }}>
                    PINOUT: ESP32-WROOM-32E
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--slate-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: 'rgba(37, 99, 235, 0.2)',
                      color: '#38bdf8',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        lock_clock
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                        Active Session Reservations
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                        Guaranteed Silicon Allocation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
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
                Certified Silicon Inventory
              </span>
              <h2 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--slate-dark)',
              }}>
                Featured Microcontrollers & Modules
              </h2>
            </div>
            <Link
              to="/products"
              className="btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              View Full Catalog ({featuredProducts.length}+)
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '36px', animation: 'spin 1s linear infinite' }}>
                progress_activity
              </span>
              <p style={{ marginTop: '0.5rem' }}>Querying silicon warehouse inventory...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}>
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
