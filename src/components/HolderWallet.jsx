import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Wallet, QrCode, Shield, CheckCircle, RefreshCw, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function HolderWallet() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCred, setSelectedCred] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/credentials');
      const data = await res.json();
      setCredentials(data);
    } catch (err) {
      console.error('Error fetching wallet credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const openQrModal = async (cred) => {
    setSelectedCred(cred);
    try {
      // If privacy mode is on, construct payload omitting raw ID document number
      const sharePayload = privacyMode
        ? {
            id: cred.id,
            did: cred.did,
            holderName: cred.holderName,
            nationality: cred.nationality,
            validUntil: cred.validUntil,
            issuer: cred.issuer
          }
        : cred;

      const payloadString = JSON.stringify(sharePayload);
      const url = await QRCode.toDataURL(payloadString, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
      setQrUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '14px', color: 'var(--accent-emerald)' }}>
            <Wallet size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Holder Digital Identity Wallet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Self-Sovereign Identity Credentials & Instant Check-in QR Codes</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className="btn-secondary"
            style={{ borderColor: privacyMode ? 'var(--accent-emerald)' : 'var(--border-color)', color: privacyMode ? '#34d399' : 'var(--text-main)' }}
          >
            {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {privacyMode ? 'Minimal Field Disclosure (Active)' : 'Full Field Mode'}
          </button>

          <button onClick={fetchCredentials} className="btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Credential Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading tourist wallet credentials...</div>
      ) : credentials.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No digital credentials found. Use the Issuer Portal to create a new tourist ID.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderColor: cred.isRevoked ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-cyan)' }}>
                      VERIFIABLE CREATOR ID
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '4px' }}>{cred.holderName}</h3>
                  </div>

                  {cred.isRevoked ? (
                    <span className="badge-revoked">⚠️ REVOKED</span>
                  ) : (
                    <span className="badge-valid">✅ VERIFIED</span>
                  )}
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>DID: </span>
                    <span className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{cred.did}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>ID Type: </span>
                    <strong>{cred.idType}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Doc #: </span>
                    <span className="mono-text">{privacyMode ? '••••-••••-55' : cred.idNumber}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Nationality: </span>
                    <strong>{cred.nationality}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Valid Until: </span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>{cred.validUntil}</strong>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {cred.id}
                </span>

                <button
                  onClick={() => openQrModal(cred)}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <QrCode size={16} /> Generate QR Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal Overlay */}
      {selectedCred && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <button
              onClick={() => setSelectedCred(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', letterSpacing: '1px', marginBottom: '6px' }}>
              HOTEL / CHECKPOINT QR CHECK-IN
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{selectedCred.holderName}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
              Scan with Verifier Portal to validate authenticity on-chain.
            </p>

            {/* QR Image Frame */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', marginBottom: '20px' }}>
              {qrUrl && <img src={qrUrl} alt="Credential QR" style={{ width: '220px', height: '220px', display: 'block' }} />}
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px 16px', borderRadius: '10px', width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Credential Ref:</span>
                <span className="mono-text">{selectedCred.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Privacy Mode:</span>
                <span style={{ color: privacyMode ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                  {privacyMode ? 'Minimal Fields (No ID Raw Number)' : 'Full Details Included'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
