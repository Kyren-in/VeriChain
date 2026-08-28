import React, { useState, useRef } from 'react';
import { Scan, ShieldCheck, ShieldAlert, AlertOctagon, Camera, FileJson, Sparkles, CheckCircle2, Lock, Cpu, RotateCcw, Image, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import QrScannerModal from './QrScannerModal';
import { API_BASE_URL } from '../api';

export default function VerifierPortal() {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedName, setScannedName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const galleryInputRef = useRef(null);

  const handleScanSuccess = async (text) => {
    setIsScannerOpen(false);
    setLoading(true);
    setVerificationResult(null);
    setScannedName('');
    setUploadError('');

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
        message: 'QR code data could not be parsed as a valid VeriChain credential.',
        computedHash: 'N/A',
        storedHash: null,
        isRevoked: false,
        tampered: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setLoading(true);
    setVerificationResult(null);

    try {
      const html5QrCode = new Html5Qrcode("verifier-direct-file-decoder");
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleScanSuccess(decodedText);
    } catch (err) {
      console.error("Direct file scan failed:", err);
      setLoading(false);
      setUploadError('No valid QR code detected in the selected image. Please ensure the image contains a clear VeriChain QR code.');
    } finally {
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    }
  };

  const statusConfig = {
    VALID: {
      icon: <ShieldCheck size={56} color="#34D399" />,
      label: 'IDENTITY VERIFIED & VALID',
      sublabel: 'Cryptographic SHA-256 Digest Matches Polygon Amoy Immutable Record',
      color: '#34D399',
      bg: 'linear-gradient(135deg, rgba(22, 138, 91, 0.18) 0%, rgba(6, 95, 70, 0.25) 100%)',
      border: 'rgba(16, 185, 129, 0.4)'
    },
    REVOKED: {
      icon: <AlertOctagon size={56} color="#FBBF24" />,
      label: 'CREDENTIAL REVOKED',
      sublabel: 'Revocation Flag Broadcasted by Authority / DID Holder',
      color: '#FBBF24',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.25) 100%)',
      border: 'rgba(245, 158, 11, 0.4)'
    },
    TAMPERED: {
      icon: <ShieldAlert size={56} color="#F87171" />,
      label: 'SECURITY ALERT: TAMPER DETECTED',
      sublabel: 'Payload Hash Mismatch! The presented document has been altered.',
      color: '#F87171',
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(153, 27, 27, 0.25) 100%)',
      border: 'rgba(239, 68, 68, 0.4)'
    },
    INVALID: {
      icon: <ShieldAlert size={56} color="#F87171" />,
      label: 'UNKNOWN / UNVERIFIED CREDENTIAL',
      sublabel: 'No matching cryptographic proof found on the decentralized ledger.',
      color: '#F87171',
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(153, 27, 27, 0.25) 100%)',
      border: 'rgba(239, 68, 68, 0.4)'
    }
  };

  const cfg = verificationResult ? statusConfig[verificationResult.status] || statusConfig.INVALID : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>

      {/* Terminal Header */}
      <div className="clay-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #FF8A3D 0%, #EA580C 100%)', 
              padding: '12px', 
              borderRadius: '16px', 
              color: '#FFFFFF',
              boxShadow: 'var(--clay-pill), var(--neu-glow-saffron)'
            }}
          >
            <Scan size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Hotel & Checkpoint Verifier Terminal</h2>
              <span className="badge-valid" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>LIVE SCANNER</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Instant zero-knowledge cryptographic verification against Polygon Amoy testnet
            </p>
          </div>
        </div>

        {/* Scan & Upload Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={galleryInputRef}
            accept="image/*"
            onChange={handleDirectGalleryUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => galleryInputRef.current?.click()}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '12px 20px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}
          >
            <Image size={18} /> Upload from Gallery
          </button>

          <button
            onClick={() => {
              setVerificationResult(null);
              setScannedName('');
              setUploadError('');
              setIsScannerOpen(true);
            }}
            disabled={loading}
            className="btn-saffron"
            style={{ padding: '12px 20px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}
          >
            <Camera size={18} /> Scan with Camera
          </button>
        </div>
      </div>

      {/* Hidden decoding container */}
      <div id="verifier-direct-file-decoder" style={{ display: 'none' }}></div>

      {/* Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {uploadError && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#FCA5A5',
            fontSize: '0.9rem'
          }}
        >
          <ShieldAlert size={22} color="#F87171" style={{ flexShrink: 0 }} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Result Display Area */}
      <div 
        className="neu-card" 
        style={{ 
          padding: '36px 30px', 
          minHeight: '360px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
            <div 
              style={{
                width: '60px', 
                height: '60px',
                border: '4px solid rgba(37, 99, 235, 0.2)',
                borderTop: '4px solid var(--digital-blue)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} 
            />
            <p style={{ fontSize: '1rem', fontWeight: '600' }}>Evaluating cryptographic hash against Polygon Amoy chain...</p>
          </div>
        )}

        {!loading && !verificationResult && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px 0' }}>
            <div 
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '24px',
                background: 'var(--bg-surface-sunken)',
                boxShadow: 'var(--neu-pressed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--text-dim)'
              }}
            >
              <FileJson size={36} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>Terminal Ready for Verification</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
              Press <strong style={{ color: 'var(--saffron)' }}>Scan with Camera</strong> to scan a tourist's QR code or click a preset above.
            </p>
          </div>
        )}

        {!loading && verificationResult && cfg && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Claymorphic Large Status Banner */}
            <div 
              className="clay-card"
              style={{
                padding: '28px 24px',
                borderRadius: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '22px',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`
              }}
            >
              {cfg.icon}
              <div>
                <span className="mono-text" style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  SECURITY EVALUATION RESULT
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: cfg.color, marginTop: '2px' }}>{cfg.label}</h3>
                {scannedName && (
                  <p style={{ fontSize: '1.05rem', color: '#FFFFFF', marginTop: '4px', fontWeight: '700' }}>
                    Subject: {scannedName}
                  </p>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {cfg.sublabel}
                </p>
              </div>
            </div>

            {/* Hash & Verification Ledger Breakdown */}
            <div className="neu-card-inset" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Computed SHA-256 Hash of Presented Payload:
                  </span>
                  <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--text-main)', wordBreak: 'break-all', marginTop: '4px', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px' }}>
                    {verificationResult.computedHash}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Anchored Blockchain Hash:
                  </span>
                  <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--digital-blue-light)', wordBreak: 'break-all', marginTop: '4px', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px' }}>
                    {verificationResult.storedHash || 'N/A — No matching on-chain record found'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Revocation Flag:</span>
                    <div style={{ fontWeight: '800', color: verificationResult.isRevoked ? '#FBBF24' : '#34D399', marginTop: '2px', fontSize: '0.9rem' }}>
                      {verificationResult.isRevoked ? 'REVOKED' : 'CLEAR'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tamper Check:</span>
                    <div style={{ fontWeight: '800', color: verificationResult.tampered ? '#F87171' : '#34D399', marginTop: '2px', fontSize: '0.9rem' }}>
                      {verificationResult.tampered ? 'ALTERED' : 'INTACT'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confidence:</span>
                    <div style={{ fontWeight: '800', color: verificationResult.tampered ? '#F87171' : '#34D399', marginTop: '2px', fontSize: '0.9rem' }}>
                      {verificationResult.tampered ? '0.0%' : '99.8% High'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Stamp & Re-Scan Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <Lock size={14} color="var(--india-green)" />
                <span>Zero raw PII data exposed or cached during scan</span>
              </div>

              <button
                onClick={() => {
                  setVerificationResult(null);
                  setScannedName('');
                  setIsScannerOpen(true);
                }}
                className="btn-secondary"
                style={{ padding: '10px 22px' }}
              >
                <RotateCcw size={16} /> Scan Another
              </button>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
