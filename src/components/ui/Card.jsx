import React from 'react';

export default function Card({
  children,
  variant = 'default', // 'default' | 'gradient' | 'featured' | 'interactive'
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const isClickable = Boolean(onClick);

  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: 'var(--grad-brand)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px var(--glow-accent)'
        };
      case 'featured':
        return {
          background: 'var(--grad-wallet)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 24px rgba(10, 30, 74, 0.4)'
        };
      case 'interactive':
        return {
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--card-shadow)',
          cursor: 'pointer'
        };
      default:
        return {
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--card-shadow)'
        };
    }
  };

  return (
    <div
      onClick={onClick}
      className={`verichain-card ${isClickable ? 'clickable' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '22px',
        position: 'relative',
        transition: 'var(--transition-normal)',
        overflow: 'hidden',
        ...getVariantStyles(),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
