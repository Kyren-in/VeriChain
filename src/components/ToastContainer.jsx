import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} color="var(--brand-success)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--brand-warning)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--brand-danger)" />;
      default:
        return <Info size={18} color="var(--brand-royal-blue)" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.4)';
      case 'warning': return 'rgba(245, 158, 11, 0.4)';
      case 'error': return 'rgba(239, 68, 68, 0.4)';
      default: return 'rgba(37, 99, 235, 0.4)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100% - 40px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: `1px solid ${getBorderColor(toast.type)}`,
            boxShadow: 'var(--card-shadow-hover)',
            color: 'var(--text-primary)',
            fontSize: '0.86rem',
            animation: 'floatSmooth 0.3s ease-out'
          }}
        >
          <div style={{ flexShrink: 0 }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-xs)'
            }}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
