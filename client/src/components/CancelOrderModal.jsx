import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

export const CancelOrderModal = ({ order, isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('Ordered wrong chip / architecture variant');

  if (!isOpen || !order) return null;

  const isPaid = order.status === 'PAID';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--stock-out)', fontSize: '24px' }}>
              warning
            </span>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.125rem', fontWeight: 700 }}>
              Cancel Order #{order.orderId}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-subtle)', padding: '0.25rem', borderRadius: '4px' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Are you sure you want to cancel this order?
            {isPaid ? (
              <strong style={{ color: 'var(--slate-dark)', display: 'block', marginTop: '0.25rem' }}>
                Because this order has been paid ({formatCurrency(order.totalAmount)}), an automatic refund will be credited immediately, and the reserved silicon components will be returned to the inventory.
              </strong>
            ) : (
              <strong style={{ color: 'var(--slate-dark)', display: 'block', marginTop: '0.25rem' }}>
                The reserved stock will be immediately released back to the global component inventory.
              </strong>
            )}
          </p>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-dark)', marginBottom: '0.375rem', display: 'block' }}>
              Cancellation Reason
            </label>
            <select
              className="input-field"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Ordered wrong chip / architecture variant">Ordered wrong chip / architecture variant</option>
              <option value="Pinout incompatible with custom PCB carrier">Pinout incompatible with custom PCB carrier</option>
              <option value="Lead time / project deadline requirement changed">Lead time / project deadline requirement changed</option>
              <option value="Found alternate vendor / surplus stock">Found alternate vendor / surplus stock</option>
              <option value="Evaluation / test session completed">Evaluation / test session completed</option>
            </select>
          </div>

          <div style={{
            background: 'var(--card-subtle)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-hairline)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Order Amount:</span>
              <strong style={{ color: 'var(--slate-dark)' }}>{formatCurrency(order.totalAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Refund Eligibility:</span>
              <span style={{ color: isPaid ? 'var(--stock-in)' : 'var(--text-muted)', fontWeight: 600 }}>
                {isPaid ? '100% Full Immediate Refund' : 'No Charge Incurred'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'var(--card-subtle)',
          borderTop: '1px solid var(--border-hairline)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Keep Order
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onConfirm(reason)}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};
