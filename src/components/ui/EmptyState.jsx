import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'There are no items to display right now.',
  actionLabel,
  onAction,
  actionIcon
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-default)',
        margin: '16px 0'
      }}
    >
      {Icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-royal-blue)',
            marginBottom: '16px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Icon size={28} />
        </div>
      )}

      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: '1.5', marginBottom: actionLabel ? '20px' : '0' }}>
        {description}
      </p>

      {actionLabel && (
        <Button variant="primary" onClick={onAction} icon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
