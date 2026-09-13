import React from 'react';

export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-surface-2)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonPulse 1.8s infinite ease-in-out',
        ...style
      }}
    />
  );
}
