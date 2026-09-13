import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Plane, 
  GraduationCap, 
  HeartPulse, 
  Shield, 
  Link2, 
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge } from './ui';

export default function VerificationResultView() {
  const { lastVerificationResult, navigateTo } = useApp();

  const result = lastVerificationResult || {
    status: 'VALID',
    credential: {
      title: 'Tourism Access Pass',
      issuer: 'Government of India',
      holderName: 'Aditi Singh',
      passportNumber: 'P1234567',
      identifierNumber: 'TAP-2025-8841',
      expiryDate: '12 Aug 2028',
      iconType: 'building',
      blockchainTx: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      blockNumber: '5102934'
    },
    verifiedAt: 'Just now',
    message: 'The credential is genuine and has not been tampered with.'
  };

  const cred = result.credential || {};
  const isRevoked = result.status === 'REVOKED';
  const isInvalid = result.status === 'INVALID';
  const isValid = result.status === 'VALID';

  const getCredentialIcon = () => {
    switch (cred.iconType) {
      case 'academic': return <GraduationCap size={22} />;
      case 'passport': return <Plane size={22} />;
      case 'building': return <Building2 size={22} />;
      case 'health': return <HeartPulse size={22} />;
      default: return <Shield size={22} />;
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
      
      {/* Top Status Icon matching Reference Screen 10 */}
      {isValid && (
        <div 
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.45)',
            animation: 'scaleIn 0.3s ease-out'
          }}
        >
          <CheckCircle2 size={50} strokeWidth={2.4} />
        </div>
      )}

      {isRevoked && (
        <div 
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.45)',
            animation: 'scaleIn 0.3s ease-out'
          }}
        >
          <XCircle size={50} strokeWidth={2.4} />
        </div>
      )}

      {isInvalid && (
        <div 
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.45)',
            animation: 'scaleIn 0.3s ease-out'
          }}
        >
          <AlertTriangle size={50} strokeWidth={2.4} />
        </div>
      )}

      {/* Header Text matching Reference Screen 10 */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>
          {isValid && 'Credential Valid'}
          {isRevoked && 'Credential Revoked'}
          {isInvalid && 'Verification Failed'}
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.4 }}>
          {result.message}
        </p>
      </div>

      {/* Credential Summary Card matching Reference Screen 10 */}
      <div
        style={{
          width: '100%',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--bg-surface)',
          border: isRevoked ? '1.5px solid rgba(239, 68, 68, 0.4)' : isInvalid ? '1.5px solid rgba(245, 158, 11, 0.4)' : '1.5px solid var(--border-default)',
          boxShadow: 'var(--card-shadow-hover)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: isRevoked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
              color: isRevoked ? 'var(--brand-danger)' : 'var(--brand-royal-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {getCredentialIcon()}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {cred.title || 'VeriChain Verifiable Credential'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {cred.issuer || 'Government Authority'}
            </p>
          </div>

          <Badge status={result.status}>{result.status}</Badge>
        </div>

        {/* Details Grid matching Reference Screen 10 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Name</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{cred.holderName || 'Aditi Singh'}</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Passport No. / ID</span>
            <strong className="mono-text" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{cred.passportNumber || cred.identifierNumber || 'P1234567'}</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Valid Till</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{cred.expiryDate || '12 Aug 2028'}</strong>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Verified At</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.verifiedAt}</strong>
          </div>
        </div>

        {/* Blockchain Verification Indicator matching Reference Screen 10 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: isValid ? 'rgba(16, 185, 129, 0.08)' : isRevoked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: isValid ? '1px solid rgba(16, 185, 129, 0.25)' : isRevoked ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={16} color={isValid ? '#10B981' : isRevoked ? '#EF4444' : '#F59E0B'} />
            <span style={{ fontWeight: '700', color: isValid ? '#10B981' : isRevoked ? '#EF4444' : '#F59E0B' }}>
              {isValid && 'Verified on blockchain'}
              {isRevoked && 'Revocation anchored on blockchain'}
              {isInvalid && 'No valid blockchain anchor found'}
            </span>
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Polygon Amoy
          </span>
        </div>
      </div>

      {/* Done & Secondary Action Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Button
          variant="dark"
          size="lg"
          fullWidth={true}
          onClick={() => navigateTo('dashboard')}
          style={{
            background: '#071A3D',
            borderRadius: 'var(--radius-full)'
          }}
        >
          Done
        </Button>

        <Button
          variant="secondary"
          size="md"
          fullWidth={true}
          icon={RotateCcw}
          onClick={() => navigateTo('verify')}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Scan Another Credential
        </Button>
      </div>

    </div>
  );
}
