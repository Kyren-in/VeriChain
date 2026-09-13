import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from 'lucide-react';
import { useApp, RBAC_MODULES, normalizeRole } from '../context/AppContext';
import { Button, Card, Badge } from './ui';

export default function AccessDeniedView({ currentRoute }) {
  const { userProfile, isAuthenticated, navigateTo, changeUserRole } = useApp();

  const activeRole = normalizeRole(userProfile?.role);

  // Find module details
  const matchedModule = RBAC_MODULES.find((m) => {
    if (m.primaryRoute === currentRoute) return true;
    if (m.id === 'wallet' && ['credentials', 'credential-detail', 'dashboard'].includes(currentRoute)) return true;
    if (m.id === 'verify' && ['verification-result'].includes(currentRoute)) return true;
    if (m.id === 'explorer' && ['blockchain'].includes(currentRoute)) return true;
    return false;
  }) || {
    name: 'Restricted Enterprise Module',
    allowed: ['admin']
  };

  const roleLabels = {
    guest: 'Guest (Public)',
    user: 'Citizen / Holder',
    verifier: 'Hotel / Verifier',
    issuer: 'Govt / Issuer',
    admin: 'Platform Admin'
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 16px' }}>
      <Card
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: 'var(--card-shadow-hover)'
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--brand-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Badge status="revoked" size="sm">
            <Lock size={12} style={{ marginRight: '4px' }} />
            RBAC Access Enforced
          </Badge>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Access Restricted
        </h2>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
          You do not have sufficient permissions to access the <strong>{matchedModule.name}</strong>.
          Access permissions are dynamically synchronized and validated via Supabase.
        </p>

        {/* Roles Details Box */}
        <div
          style={{
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            marginBottom: '28px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Your Current Role:</span>
            <span style={{ fontWeight: '700', color: 'var(--brand-royal-blue)' }}>
              {roleLabels[activeRole] || activeRole.toUpperCase()} (Saved in Supabase)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.84rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Authorized Roles:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {matchedModule.allowed.map((r) => (
                <span
                  key={r}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--brand-success)',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  {roleLabels[r] || r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Role Switcher for SIH 2026 Presentation */}
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-sunken)', border: '1px dashed var(--border-default)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            SIH Presentation Demo: Test with an Authorized Role
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {matchedModule.allowed.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  changeUserRole(r);
                  navigateTo(currentRoute);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--brand-royal-blue)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserCheck size={14} />
                <span>Switch to {roleLabels[r] || r} & Enter</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            variant="secondary"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')}
          >
            {isAuthenticated ? 'Return to Dashboard' : 'Back to Landing Page'}
          </Button>

          {!isAuthenticated && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigateTo('login')}
            >
              Sign In to VeriChain
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
