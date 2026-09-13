import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  style = {}
}) {
  return (
    <div
      role="tablist"
      className={`tabs-segmented-control ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface-2)',
        padding: '4px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        gap: '4px',
        ...style
      }}
    >
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const count = typeof tab === 'object' ? tab.count : undefined;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: isActive ? '#071A3D' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: isActive ? '700' : '600',
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none'
            }}
          >
            <span>{label}</span>
            {count !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-surface-3)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
