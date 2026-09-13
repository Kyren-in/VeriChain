import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) {
  const isActuallyLoading = loading || isLoading;
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--grad-brand)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px var(--glow-accent)'
        };
      case 'dark':
        return {
          background: '#071A3D',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
        };
      case 'secondary':
        return {
          background: 'var(--bg-surface-2)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--card-shadow)'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--brand-royal-blue)',
          border: '1.5px solid var(--brand-royal-blue)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent'
        };
      case 'danger':
        return {
          background: 'var(--grad-danger)',
          color: '#FFFFFF',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
        };
      case 'success':
        return {
          background: 'var(--grad-success)',
          color: '#FFFFFF',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 4px 14px var(--glow-success)'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '7px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', gap: '6px' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '1rem', borderRadius: 'var(--radius-lg)', gap: '10px' };
      default:
        return { padding: '10px 20px', fontSize: '0.88rem', borderRadius: 'var(--radius-md)', gap: '8px' };
    }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    cursor: disabled || isActuallyLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isActuallyLoading ? 0.6 : 1,
    transition: 'var(--transition-fast)',
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    boxSizing: 'border-box',
    userSelect: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <button
      type={type}
      disabled={disabled || isActuallyLoading}
      onClick={onClick}
      style={baseStyles}
      className={`btn-component ${className}`}
      {...props}
    >
      {isActuallyLoading && <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
      {!isActuallyLoading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      <span>{children}</span>
      {!isActuallyLoading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
    </button>
  );
}
