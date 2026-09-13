import React from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';

export default function Badge({
  children,
  status = 'valid', // 'valid' | 'revoked' | 'issued' | 'verified' | 'pending' | 'danger'
  showIcon = false,
  size = 'md', // 'sm' | 'md'
  className = '',
  style = {}
}) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'valid':
        return {
          background: 'var(--badge-valid-bg)',
          color: 'var(--badge-valid-text)',
          border: '1px solid var(--badge-valid-border)',
          icon: CheckCircle2
        };
      case 'revoked':
        return {
          background: 'var(--badge-revoked-bg)',
          color: 'var(--badge-revoked-text)',
          border: '1px solid var(--badge-revoked-border)',
          icon: XCircle
        };
      case 'issued':
        return {
          background: 'var(--badge-issued-bg)',
          color: 'var(--badge-issued-text)',
          border: '1px solid var(--badge-issued-border)',
          icon: ShieldCheck
        };
      case 'verified':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          icon: CheckCircle2
        };
      case 'pending':
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          icon: Clock
        };
      default:
        return {
          background: 'var(--bg-surface-2)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-default)',
          icon: ShieldCheck
        };
    }
  };

  const { background, color, border, icon: Icon } = getStatusStyles();

  const isSmall = size === 'sm';

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSmall ? '2px 8px' : '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: isSmall ? '0.7rem' : '0.78rem',
        fontWeight: '700',
        letterSpacing: '0.02em',
        background,
        color,
        border,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {showIcon && <Icon size={isSmall ? 11 : 13} />}
      <span>{children || status}</span>
    </span>
  );
}
