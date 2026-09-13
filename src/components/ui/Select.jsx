import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
  style = {},
  ...props
}) {
  const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={className}
          style={{
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            padding: '11px 36px 11px 14px',
            fontSize: '0.9rem',
            background: 'var(--bg-surface-2)',
            border: error ? '1.5px solid var(--brand-danger)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'var(--transition-fast)',
            boxSizing: 'border-box'
          }}
          {...props}
        >
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                {lbl}
              </option>
            );
          })}
        </select>

        <div
          style={{
            position: 'absolute',
            right: '12px',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronDown size={16} />
        </div>
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
