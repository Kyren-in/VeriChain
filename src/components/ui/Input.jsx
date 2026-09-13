import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  name,
  id,
  className = '',
  style = {},
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.82rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: 'var(--brand-danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input-field ${className}`}
          style={{
            width: '100%',
            padding: Icon ? '11px 14px 11px 40px' : '11px 14px',
            fontSize: '0.9rem',
            background: 'var(--bg-surface-2)',
            border: error ? '1.5px solid var(--brand-danger)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'var(--transition-fast)',
            boxSizing: 'border-box'
          }}
          {...props}
        />
      </div>

      {error && (
        <span style={{ fontSize: '0.74rem', color: 'var(--brand-danger)', marginTop: '2px' }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
