import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { BedStatus } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  targetStatus?: BedStatus;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  targetStatus,
  confirmLabel = 'Yes, Proceed',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div 
        className="modal-container dialog-sm" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div 
              className="modal-header-icon"
              style={{
                backgroundColor: isDestructive ? '#fee2e2' : '#eff6ff',
                color: isDestructive ? '#dc2626' : '#2563eb',
              }}
            >
              {isDestructive ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
            </div>
            <div>
              <h3 id="confirm-modal-title" className="modal-header-title" style={{ fontSize: '18px' }}>
                {title}
              </h3>
              <p className="modal-header-subtitle">Confirmation required</p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onCancel}
            aria-label="Close confirmation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '16px', color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>
            {message}
          </p>

          {targetStatus && (
            <div 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                Target New Status:
              </span>
              <span className={`mini-badge ${targetStatus}`}>
                {targetStatus}
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button 
            type="button" 
            className={isDestructive ? 'btn-danger' : 'btn-primary'} 
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
