import React from 'react';

export default function Avatar({
  src,
  alt = 'User Avatar',
  name = '',
  size = 40,
  className = '',
  style = {}
}) {
  const getInitials = (n) => {
    if (!n) return 'VC';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={`verichain-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--brand-royal-blue)',
        color: '#FFFFFF',
        fontSize: `${size * 0.4}px`,
        fontWeight: '700',
        border: '2px solid var(--border-default)',
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
