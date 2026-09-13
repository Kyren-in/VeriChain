import React from 'react';
import { 
  QrCode, 
  Plus, 
  Settings, 
  ChevronRight, 
  Building2, 
  GraduationCap, 
  ShieldAlert, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from './ui';

export default function Dashboard() {
  const { userProfile, credentials, activities, navigateTo } = useApp();

  const totalCredentials = credentials.length;
  const validCount = credentials.filter((c) => c.status === 'Valid').length;
  const revokedCount = credentials.filter((c) => c.status === 'Revoked').length;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'verification':
        return { icon: Building2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'issuance':
        return { icon: GraduationCap, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'revocation':
        return { icon: ShieldAlert, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { icon: ShieldCheck, color: 'var(--brand-royal-blue)', bg: 'rgba(37, 99, 235, 0.15)' };
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Header matching Reference */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Hello, {userProfile?.name ? userProfile.name.split(' ')[0] : 'Citizen'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Your digital wallet
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span 
            style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--brand-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-success)' }} />
            Active DID
          </span>
        </div>
      </div>

      {/* Featured Card: "Total Credentials" matching Reference */}
      <div
        onClick={() => navigateTo('wallet')}
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--grad-wallet)',
          color: '#FFFFFF',
          padding: '28px 24px',
          boxShadow: '0 8px 28px rgba(10, 30, 74, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'var(--transition-fast)'
        }}
      >
        {/* Subtle decorative glow */}
        <div 
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} 
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)' }}>
            Total Credentials
          </span>

          <span 
            style={{ 
              fontSize: '0.82rem', 
              fontWeight: '600', 
              color: '#93C5FD', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}
          >
            <span>View all</span>
            <ChevronRight size={14} />
          </span>
        </div>

        <div style={{ fontSize: '3.6rem', fontWeight: '900', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '16px' }}>
          {totalCredentials}
        </div>

        {/* Breakdown pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span 
            style={{
              fontSize: '0.74rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.25)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.35)'
            }}
          >
            {validCount} Valid
          </span>

          {revokedCount > 0 && (
            <span 
              style={{
                fontSize: '0.74rem',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(239, 68, 68, 0.25)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.35)'
              }}
            >
              {revokedCount} Revoked
            </span>
          )}

          <span 
            style={{
              fontSize: '0.74rem',
              fontWeight: '500',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.75)'
            }}
          >
            Polygon Amoy Anchored
          </span>
        </div>
      </div>

      {/* Quick Actions Grid matching Reference (Scan QR, Add Credential, Settings) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '14px',
          alignItems: 'center'
        }}
      >
        {/* Quick Action 1: Scan QR */}
        <button
          type="button"
          onClick={() => navigateTo('verify')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '20px 10px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--card-shadow)',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
          className="quick-action-card"
        >
          <div 
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--brand-royal-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <QrCode size={24} />
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Scan QR
          </span>
        </button>

        {/* Quick Action 2: Add Credential (Center highlighted with blue background as in reference) */}
        <button
          type="button"
          onClick={() => navigateTo('issue')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '20px 10px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--card-shadow)',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
          className="quick-action-card"
        >
          <div 
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'var(--grad-brand)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px var(--glow-accent)'
            }}
          >
            <Plus size={26} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Add Credential
          </span>
        </button>

        {/* Quick Action 3: Settings */}
        <button
          type="button"
          onClick={() => navigateTo('settings')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '20px 10px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--card-shadow)',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
          className="quick-action-card"
        >
          <div 
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Settings size={24} />
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Settings
          </span>
        </button>
      </div>

      {/* Recent Activity Section matching Reference */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Recent Activity
          </h3>

          <span 
            onClick={() => navigateTo('activity')}
            style={{ 
              fontSize: '0.82rem', 
              fontWeight: '600', 
              color: 'var(--brand-royal-blue)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '3px',
              cursor: 'pointer' 
            }}
          >
            <span>See all</span>
            <ChevronRight size={14} />
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.slice(0, 4).map((item) => {
            const { icon: Icon, color, bg } = getActivityIcon(item.type);

            return (
              <div
                key={item.id}
                onClick={() => navigateTo('activity')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--card-shadow)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: bg,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.timestamp}
                    </p>
                  </div>
                </div>

                <Badge status={item.badgeType}>
                  {item.badgeText}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
