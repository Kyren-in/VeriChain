import React from 'react';

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id
}) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '8px 0',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onClick={() => {
        if (!disabled && onChange) onChange(!checked);
      }}
    >
      {(label || description) && (
        <div style={{ flex: 1 }}>
          {label && (
            <label
              htmlFor={toggleId}
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                display: 'block',
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              {label}
            </label>
          )}
          {description && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled && onChange) onChange(!checked);
        }}
        style={{
          width: '46px',
          height: '26px',
          borderRadius: 'var(--radius-full)',
          background: checked ? 'var(--brand-royal-blue)' : 'var(--bg-surface-3)',
          border: '1px solid var(--border-default)',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          padding: '2px',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <span
          style={{
            display: 'block',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </button>
    </div>
  );
}
