import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useApp, RBAC_MODULES, normalizeRole } from '../context/AppContext';
import { Button, Card, Badge } from './ui';

export default function AccessDeniedView({ currentRoute }) {
  const { userProfile, isAuthenticated, navigateTo } = useApp();

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
    issuer: 'Authority / Issuer',
    govt: 'Government Department',
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
            403 Forbidden • Access Restricted
          </Badge>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Unauthorized Module Access
        </h2>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
          Your authenticated account does not hold the required cryptographic permissions to access <strong>{matchedModule.name}</strong>.
          Role privileges are strictly governed by the authoritative Supabase identity registry.
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
            <span style={{ color: 'var(--text-muted)' }}>Your Authenticated Role:</span>
            <span style={{ fontWeight: '700', color: 'var(--brand-royal-blue)' }}>
              {roleLabels[activeRole] || activeRole.toUpperCase()}
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

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            variant="primary"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')}
          >
            {isAuthenticated ? 'Return to Authorized Dashboard' : 'Back to Landing Page'}
          </Button>

          {!isAuthenticated && (
            <Button
              variant="secondary"
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
