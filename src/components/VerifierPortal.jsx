import React, { useState } from 'react';
import { Scan, ShieldCheck, ShieldAlert, AlertOctagon, Camera, FileJson } from 'lucide-react';
import QrScannerModal from './QrScannerModal';
import { API_BASE_URL } from '../api';

export default function VerifierPortal() {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedName, setScannedName] = useState('');

  const handleScanSuccess = async (text) => {
    setIsScannerOpen(false);
    setLoading(true);
    setVerificationResult(null);
    setScannedName('');

    try {
      const parsed = JSON.parse(text);
      setScannedName(parsed.holderName || '');

      const res = await fetch(`${API_BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({
        status: 'INVALID',
        message: 'QR code data could not be parsed as a valid credential.',
        computedHash: 'N/A',
        storedHash: null,
        isRevoked: false,
        tampered: true
      });
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    VALID: {
      icon: <ShieldCheck size={52} color="#34d399" />,
      label: '✅ IDENTITY VERIFIED',
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)'
    },
    REVOKED: {
      icon: <AlertOctagon size={52} color="#fbbf24" />,
      label: '⚠️ CREDENTIAL REVOKED',
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)'
    },
    TAMPERED: {
      icon: <ShieldAlert size={52} color="#f87171" />,
      label: '❌ TAMPER DETECTED',
      color: '#f87171',
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.35)'
    },
    INVALID: {
      icon: <ShieldAlert size={52} color="#f87171" />,
      label: '❌ UNKNOWN CREDENTIAL',
      color: '#f87171',
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.35)'
    }
  };

  const cfg = verificationResult ? statusConfig[verificationResult.status] || statusConfig.INVALID : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '760px', margin: '0 auto' }}>

      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '14px', color: 'var(--accent-amber)' }}>
            <Scan size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Verifier Check-in Terminal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Scan a tourist's QR code to instantly verify their identity on-chain
            </p>
          </div>
        </div>

        {/* Single scan button */}
        <button
          onClick={() => {
            setVerificationResult(null);
            setScannedName('');
            setIsScannerOpen(true);
          }}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
        >
          <Camera size={18} /> Scan with Camera
        </button>
      </div>

      {/* Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Result / Idle Area */}
      <div className="glass-panel" style={{ padding: '36px 28px', minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
            <div style={{
              width: '56px', height: '56px',
              border: '4px solid rgba(99, 102, 241, 0.2)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ fontSize: '0.95rem' }}>Verifying on Polygon Amoy chain...</p>
          </div>
        )}

        {!loading && !verificationResult && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
            <FileJson size={56} style={{ opacity: 0.18, marginBottom: '16px' }} />
            <p style={{ fontSize: '1rem', marginBottom: '6px' }}>No scan yet</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Press <strong style={{ color: 'var(--accent-amber)' }}>Scan with Camera</strong> to begin identity verification
            </p>
          </div>
        )}

        {!loading && verificationResult && cfg && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Big Status Banner */}
            <div style={{
              padding: '28px 24px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: cfg.bg,
              border: `1px solid ${cfg.border}`
            }}>
              {cfg.icon}
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: cfg.color }}>{cfg.label}</h3>
                {scannedName && (
                  <p style={{ fontSize: '1rem', color: '#fff', marginTop: '4px', fontWeight: '600' }}>
                    {scannedName}
                  </p>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {verificationResult.message}
                </p>
              </div>
            </div>

            {/* Hash Details */}
            <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Computed SHA-256 Hash of Presented Payload:
                  </span>
                  <div className="mono-text" style={{ fontSize: '0.78rem', color: 'var(--text-main)', wordBreak: 'break-all', marginTop: '4px' }}>
                    {verificationResult.computedHash}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Anchored Blockchain Hash:
                  </span>
                  <div className="mono-text" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginTop: '4px' }}>
                    {verificationResult.storedHash || 'N/A — No matching on-chain record'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Revocation Flag:</span>
                    <div style={{ fontWeight: '700', color: verificationResult.isRevoked ? '#fbbf24' : '#34d399', marginTop: '2px' }}>
                      {verificationResult.isRevoked ? 'REVOKED' : 'CLEAR'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tamper Flag:</span>
                    <div style={{ fontWeight: '700', color: verificationResult.tampered ? '#f87171' : '#34d399', marginTop: '2px' }}>
                      {verificationResult.tampered ? 'ALTERED' : 'INTACT'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Again */}
            <button
              onClick={() => {
                setVerificationResult(null);
                setScannedName('');
                setIsScannerOpen(true);
              }}
              className="btn-secondary"
              style={{ alignSelf: 'center', padding: '10px 28px' }}
            >
              <Camera size={16} /> Scan Another
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
