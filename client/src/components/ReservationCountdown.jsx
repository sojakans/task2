import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

export const ReservationCountdown = ({ expiresAt, onExpire }) => {
  const { formattedTime, secondsLeft, isExpired } = useCountdown(expiresAt, onExpire);

  const isWarning = secondsLeft <= 60 && !isExpired;

  if (isExpired) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--stock-out-bg)',
          border: '1px solid var(--stock-out-border)',
          color: 'var(--stock-out-text)',
          marginBottom: '1.5rem',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--stock-out)' }}>
          alarm_off
        </span>
        <div>
          <strong style={{ display: 'block', fontSize: '0.9375rem' }}>Reservation Window Expired</strong>
          <span style={{ fontSize: '0.8125rem' }}>
            The 5-minute stock hold period has elapsed. Components have been safely released back to the global pool.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        background: isWarning ? '#fffbeb' : '#eff6ff',
        border: `1px solid ${isWarning ? '#fde68a' : '#bfdbfe'}`,
        color: isWarning ? '#92400e' : '#1e40af',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '26px',
            color: isWarning ? 'var(--stock-warning)' : 'var(--primary)',
          }}
        >
          timer
        </span>
        <div>
          <strong style={{ display: 'block', fontSize: '0.9375rem' }}>
            5-Minute Stock Lock Active
          </strong>
          <span style={{ fontSize: '0.8125rem', opacity: 0.9 }}>
            Your components are reserved exclusively for you during this session.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
          Hold Expires In:
        </span>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '1.375rem',
            fontWeight: 800,
            padding: '0.25rem 0.75rem',
            borderRadius: '6px',
            background: '#ffffff',
            border: `1px solid ${isWarning ? '#fde68a' : '#bfdbfe'}`,
            color: isWarning ? '#b45309' : 'var(--primary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
};
