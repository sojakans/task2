import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  const isOrderingPrompt = searchParams.get('prompt') === 'order' || redirectPath.includes('checkout') || redirectPath.includes('cart');

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect right away
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!name.trim()) {
          throw new Error('Please enter your full name or engineer handle.');
        }
        res = await register(name, email, password);
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoType) => {
    if (demoType === 'engineer') {
      setIsRegister(false);
      setEmail('engineer@techloom.store');
      setPassword('password123');
    } else {
      setIsRegister(true);
      setName('Hardware Innovator');
      setEmail(`maker.${Math.floor(100 + Math.random() * 900)}@techloom.store`);
      setPassword('password123');
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 6rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        {/* Ordering Notice Banner if redirected from checkout */}
        {isOrderingPrompt && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--primary-subtle)',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--primary)' }}>
              lock
            </span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem' }}>Account Required to Place Order</strong>
              <span style={{ fontSize: '0.8125rem' }}>
                Please sign in or create an account to reserve silicon inventory and track your order.
              </span>
            </div>
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-lg)',
          padding: '2.5rem',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#38bdf8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                fingerprint
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.625rem',
              fontWeight: 800,
              color: 'var(--slate-dark)',
              marginBottom: '0.25rem',
            }}>
              {isRegister ? 'Create Maker Account' : 'Sign In to Techloom'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {isRegister
                ? 'Register to manage silicon reservations and track lab orders'
                : 'Access your hardware order history and stock reservations'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--stock-out-bg)',
              border: '1px solid var(--stock-out-border)',
              color: 'var(--stock-out-text)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isRegister && (
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-dark)', marginBottom: '0.375rem', display: 'block' }}>
                  Full Name / Engineer Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Alex Mercer"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-dark)', marginBottom: '0.375rem', display: 'block' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="engineer@techloom.store"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
                  Password
                </label>
                {!isRegister && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Minimum 6 characters
                  </span>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '0.875rem',
                fontSize: '0.9375rem',
                marginTop: '0.5rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                    sync
                  </span>
                  Authenticating...
                </>
              ) : isRegister ? (
                <>
                  <span>Create Account & Continue</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-hairline)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600, textTransform: 'uppercase' }}>
              Quick Evaluation Fill
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('new')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  borderRadius: '6px',
                  background: 'var(--card-subtle)',
                  border: '1px solid var(--border-hairline)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                + New Account Fill
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('engineer')}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  borderRadius: '6px',
                  background: 'var(--card-subtle)',
                  border: '1px solid var(--border-hairline)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                Sign In Fill
              </button>
            </div>
          </div>

          {/* Toggle between Sign In & Register */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Create One
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
