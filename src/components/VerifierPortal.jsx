import React, { useState } from 'react';
import { Scan, ShieldCheck, ShieldAlert, AlertOctagon, RotateCcw, Ban, CheckCircle2, FileJson, Edit3, Camera } from 'lucide-react';
import QrScannerModal from './QrScannerModal';
import { API_BASE_URL } from '../api';

export default function VerifierPortal() {
  const [inputPayload, setInputPayload] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Quick preset sample payloads to make demoing smooth & instant
  const loadPreset = async (type) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials`);
      const allCreds = await res.json();
      
      const validSample = allCreds.find(c => !c.isRevoked) || allCreds[0];
      const revokedSample = allCreds.find(c => c.isRevoked) || allCreds[0];

      if (type === 'valid' && validSample) {
        const { isRevoked, hash, ...cleanCred } = validSample;
        setInputPayload(JSON.stringify(cleanCred, null, 2));
      } else if (type === 'tampered' && validSample) {
        const { isRevoked, hash, ...cleanCred } = validSample;
        const tamperedCred = { ...cleanCred, holderName: cleanCred.holderName + ' (Tampered Name)' };
        setInputPayload(JSON.stringify(tamperedCred, null, 2));
      } else if (type === 'revoked' && revokedSample) {
        const { isRevoked, hash, ...cleanCred } = revokedSample;
        setInputPayload(JSON.stringify(cleanCred, null, 2));
      }
    } catch (err) {
      console.error('Error loading preset from server:', err);
    }
  };

  const handleVerify = async () => {
    if (!inputPayload.trim()) return;
    setLoading(true);
    setVerificationResult(null);

    try {
      let parsed = JSON.parse(inputPayload);
      const res = await fetch(`${API_BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      alert('Invalid JSON formatting in credential input!');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeFromVerifier = async () => {
    if (!verificationResult || !inputPayload) return;
    try {
      const parsed = JSON.parse(inputPayload);
      setRevoking(true);
      const res = await fetch(`${API_BASE_URL}/api/credentials/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parsed.id, reason: 'Revoked by Checkpoint Officer / Front Desk' })
      });
      const data = await res.json();
      if (data.success) {
        // Re-verify immediately to demonstrate real-time response
        handleVerify();
      }
    } catch (err) {
      alert('Error revoking: ' + err.message);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
      {/* Scanner / Input Area */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--accent-amber)' }}>
            <Scan size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Verifier Check-in Terminal</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scan QR Code or paste credential JSON payload</p>
          </div>
        </div>

        {/* Quick Demo Test Buttons */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
            TEST DEMO SCENARIOS:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setIsScannerOpen(true)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              <Camera size={14} /> Scan with Camera
            </button>
            <button onClick={() => loadPreset('valid')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <CheckCircle2 size={14} color="#34d399" /> Valid Credential
            </button>
            <button onClick={() => loadPreset('tampered')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <AlertOctagon size={14} color="#f87171" /> Tampered Data
            </button>
            <button onClick={() => loadPreset('revoked')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <Ban size={14} color="#fbbf24" /> Revoked ID
            </button>
          </div>
        </div>

        <QrScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={(text) => setInputPayload(text)}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            rows={10}
            className="input-field mono-text"
            style={{ fontSize: '0.82rem', resize: 'vertical' }}
            placeholder="Paste QR payload or click demo scenarios above..."
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleVerify}
              className="btn-primary"
              disabled={loading || !inputPayload.trim()}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {loading ? 'Performing On-Chain Verification...' : <><Scan size={18} /> Verify Credential (&lt;2s)</>}
            </button>

            <button onClick={() => { setInputPayload(''); setVerificationResult(null); }} className="btn-secondary">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Real-time Audit Status</h2>

        {verificationResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {/* Status Header Banner */}
            <div
              style={{
                padding: '20px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background:
                  verificationResult.status === 'VALID'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : verificationResult.status === 'REVOKED'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(244, 63, 94, 0.12)',
                border: `1px solid ${
                  verificationResult.status === 'VALID'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : verificationResult.status === 'REVOKED'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(244, 63, 94, 0.3)'
                }`
              }}
            >
              {verificationResult.status === 'VALID' && <ShieldCheck size={40} color="#34d399" />}
              {verificationResult.status === 'REVOKED' && <AlertOctagon size={40} color="#fbbf24" />}
              {verificationResult.status === 'TAMPERED' && <ShieldAlert size={40} color="#f87171" />}
              {verificationResult.status === 'INVALID' && <ShieldAlert size={40} color="#f87171" />}

              <div>
                <h3
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    color:
                      verificationResult.status === 'VALID'
                        ? '#34d399'
                        : verificationResult.status === 'REVOKED'
                        ? '#fbbf24'
                        : '#f87171'
                  }}
                >
                  {verificationResult.status === 'VALID' && '✅ CREATOR VERIFIED (AUTHENTIC)'}
                  {verificationResult.status === 'REVOKED' && '⚠️ CREDENTIAL REVOKED'}
                  {verificationResult.status === 'TAMPERED' && '❌ TAMPER DETECTED (INVALID)'}
                  {verificationResult.status === 'INVALID' && '❌ UNKNOWN CREDENTIAL RECORD'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {verificationResult.message}
                </p>
              </div>
            </div>

            {/* Hash & Ledger Details */}
            <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Computed SHA-256 Hash of Presented Payload:</span>
                  <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--text-main)', wordBreak: 'break-all', marginTop: '2px' }}>
                    {verificationResult.computedHash}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anchored Blockchain Hash:</span>
                  <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginTop: '2px' }}>
                    {verificationResult.storedHash || 'N/A (No matching on-chain record)'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revocation Flag: </span>
                    <strong style={{ color: verificationResult.isRevoked ? '#fbbf24' : '#34d399' }}>
                      {verificationResult.isRevoked ? 'REVOKED' : 'CLEAR (UNREVOKED)'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tamper Flag: </span>
                    <strong style={{ color: verificationResult.tampered ? '#f87171' : '#34d399' }}>
                      {verificationResult.tampered ? 'ALTERED' : 'INTACT'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>


          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center', padding: '40px 20px' }}>
            <FileJson size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem' }}>Scan or paste credential data on the left to initiate cryptographic verification against Polygon Amoy testnet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
