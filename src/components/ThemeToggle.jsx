import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Laptop }
  ];

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  if (compact) {
    return (
      <div style={{ display: 'flex', background: 'var(--bg-surface-2)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', width: '100%', justifyContent: 'space-between' }}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              title={`Theme: ${opt.label}`}
              aria-label={`Switch to ${opt.label} theme`}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: isActive ? 'var(--grad-brand)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon size={13} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="theme-toggle-btn"
        aria-label="Toggle theme selection"
        aria-expanded={isOpen}
      >
        <CurrentIcon size={14} style={{ color: resolvedTheme === 'dark' ? '#60A5FA' : '#F59E0B' }} />
        <span style={{ textTransform: 'capitalize' }}>{theme}</span>
        <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--card-shadow-hover)',
            padding: '6px',
            minWidth: '130px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setTheme(opt.key);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isSelected ? 'var(--bg-surface-2)' : 'transparent',
                  color: isSelected ? 'var(--brand-royal-blue)' : 'var(--text-primary)',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <Icon size={14} />
                <span>{opt.label}</span>
                {isSelected && (
                  <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-royal-blue)' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
