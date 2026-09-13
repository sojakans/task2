import React from 'react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'var(--slate-dark)',
      color: '#ffffff',
      paddingTop: '3rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto',
      borderTop: '1px solid var(--slate-surface)',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#38bdf8' }}>memory</span>
              <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem' }}>
                Techloom Makers
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Silicon logistics and component fulfillment designed specifically for hardware engineers, roboticists, and tech innovators.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hardware Categories
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Microcontrollers & Dev Boards</li>
              <li>Environmental & IMU Sensors</li>
              <li>Precision Displays & Actuators</li>
              <li>Robotics & Motor Controllers</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Assessment Architecture
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Atomic Inventory Decrements</li>
              <li>5-Minute Guaranteed Reservation Hold</li>
              <li>Duplicate-Payment Idempotency Shield</li>
              <li>Simulated Refund & Cancellation Machine</li>
            </ul>
          </div>
        </div>

        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: '#64748b',
          gap: '1rem',
        }}>
          <div>
            © 2026 Techloom Store. Built for Techloom.ai Practical Assessment Task 02.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>REST API Ready</span>
            <span>RESTful Micro-Reservations</span>
            <span>Precision Spec Modern</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
