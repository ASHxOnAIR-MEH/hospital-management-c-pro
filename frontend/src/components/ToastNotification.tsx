import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast } = useHospital();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={20} color="#16a34a" />}
          {toast.type === 'warning' && <AlertTriangle size={20} color="#d97706" />}
          {toast.type === 'info' && <Info size={20} color="#2563eb" />}

          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>

          <button 
            className="modal-close-btn" 
            style={{ width: '24px', height: '24px', background: 'transparent' }}
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
