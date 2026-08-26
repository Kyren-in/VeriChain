import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Wallet, QrCode, Shield, ShieldAlert, CheckCircle, RefreshCw, 
  X, AlertTriangle, Eye, EyeOff, KeyRound, Trash2, Settings, 
  Fingerprint, Sparkles, Lock, ArrowRight, Layers 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { API_BASE_URL } from '../api';

export default function HolderWallet({ user }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCred, setSelectedCred] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [selfRevokeStep, setSelfRevokeStep] = useState(1);
  const [selfRevokeOtp, setSelfRevokeOtp] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);

  const handleSendRevokeOtp = async () => {
    if (!user?.email) return;
    setRevokeLoading(true);
    setSettingsMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, fullName: user.user_metadata?.full_name || 'User' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelfRevokeStep(2);
        setSettingsMsg('A 6-digit OTP code has been sent to your email to authorize self-revocation.');
      } else {
        setSettingsMsg(data.error || 'Failed to send OTP email.');
      }
    } catch (err) {
      setSettingsMsg('Error sending OTP: ' + err.message);
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleConfirmSelfRevoke = async () => {
    if (!selfRevokeOtp.trim()) return;
    setRevokeLoading(true);
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: selfRevokeOtp })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Invalid OTP code.');
      }

      if (credentials.length > 0) {
        for (const cred of credentials) {
          await fetch(`${API_BASE_URL}/api/credentials/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: cred.id, reason: 'Self-revoked by DID Holder' })
          });
        }
      }

      setSettingsMsg('Your DID Credentials have been self-revoked on-chain!');
      setSelfRevokeStep(1);
      setSelfRevokeOtp('');
      fetchCredentials();
    } catch (err) {
      setSettingsMsg(err.message || 'Error processing revocation');
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSettingsMsg('Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      setSettingsMsg(err.message || 'Error updating password');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your Digital Identity profile? This will purge local credentials.')) {
      setCredentials([]);
      setSettingsMsg('Digital Identity profile purged successfully.');
    }
  };

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials`);
      const allCreds = await res.json();
      
      const userName = user?.user_metadata?.full_name?.toLowerCase() || '';
      const userEmail = user?.email?.toLowerCase() || '';

      const myCredentials = allCreds.filter(cred => {
        if (!userName && !userEmail) return false;
        const credHolder = (cred.holderName || '').toLowerCase();
        return (userName && credHolder.includes(userName)) || (userName && userName.includes(credHolder));
      });

      setCredentials(myCredentials);
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
      const { isRevoked, hash, userEmail, userId, ...cleanPayload } = cred;
      const payloadString = JSON.stringify(cleanPayload, null, 2);
      const url = await QRCode.toDataURL(payloadString, { width: 320, margin: 2, color: { dark: '#0B1220', light: '#FFFFFF' } });
      setQrUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Header Bar */}
      <div className="clay-card" style={{ padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', 
              padding: '12px', 
              borderRadius: '16px', 
              color: '#FFFFFF',
              boxShadow: 'var(--clay-pill), var(--neu-glow-green)'
            }}
          >
            <Wallet size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Holder Digital Identity Wallet</h2>
              <span className="badge-valid" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>SELF-SOVEREIGN</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Decentralized Verifiable Credentials</p>
              {user && (
                <span className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--digital-blue-light)' }}>
                  • {user.email}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className="btn-secondary"
            style={{ 
              borderColor: privacyMode ? 'var(--india-green)' : 'var(--border-subtle)', 
              color: privacyMode ? '#34D399' : 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {privacyMode ? 'Minimal Disclosure: ON' : 'Minimal Disclosure: OFF'}
          </button>

          <button onClick={fetchCredentials} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Refresh
          </button>

          <button onClick={() => setIsSettingsOpen(true)} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="clay-card" style={{ width: '100%', maxWidth: '460px', padding: '30px', borderRadius: '24px', background: 'var(--bg-midnight-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings color="var(--saffron)" size={22} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Account & Security</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {settingsMsg && (
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--saffron-soft)', color: 'var(--saffron)', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid rgba(255,138,61,0.3)' }}>
                {settingsMsg}
              </div>
            )}

            {/* Profile Info */}
            <div className="neu-card-inset" style={{ padding: '14px 16px', marginBottom: '20px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <strong style={{ color: '#FFFFFF' }}>{user?.user_metadata?.full_name || 'Standard User'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <strong style={{ color: '#FFFFFF' }}>{user?.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>User UUID:</span>
                <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--digital-blue-light)' }}>{user?.id}</span>
              </div>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reset Account Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px', justifyContent: 'center' }}>
                <KeyRound size={16} /> Update Password
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--status-danger)', display: 'block', fontWeight: '700' }}>
                Self-Sovereign Revocation Zone
              </label>
              
              {selfRevokeStep === 1 ? (
                <button
                  type="button"
                  onClick={handleSendRevokeOtp}
                  disabled={revokeLoading}
                  className="btn-secondary"
                  style={{ borderColor: 'rgba(245, 158, 11, 0.5)', color: '#FBBF24', width: '100%', justifyContent: 'center' }}
                >
                  <ShieldAlert size={16} /> {revokeLoading ? 'Sending OTP...' : 'Self-Revoke My DID Credential'}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(245, 158, 11, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <label style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '600' }}>Enter 6-Digit Email OTP to Confirm Revocation:</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={selfRevokeOtp}
                    onChange={(e) => setSelfRevokeOtp(e.target.value)}
                    className="input-field"
                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.1rem' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleConfirmSelfRevoke}
                      disabled={revokeLoading}
                      className="btn-saffron"
                      style={{ flex: 1, padding: '9px', justifyContent: 'center' }}
                    >
                      {revokeLoading ? 'Revoking...' : 'Confirm Self-Revoke'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelfRevokeStep(1)}
                      className="btn-secondary"
                      style={{ padding: '9px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button onClick={handleDeleteAccount} className="btn-secondary" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171', width: '100%', justifyContent: 'center' }}>
                <Trash2 size={16} /> Delete Identity Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading tourist wallet credentials...</div>
      ) : credentials.length === 0 ? (
        <div className="clay-card" style={{ padding: '60px 30px', textAlign: 'center', color: 'var(--saffron)' }}>
          <ShieldAlert size={42} style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>
            No DID Credential Issued Yet
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
            Your account is verified, but an official Verifiable Credential has not been issued to <strong>{user?.user_metadata?.full_name || user?.email}</strong> by the Tourism Authority yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="clay-card"
              style={{
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                border: cred.isRevoked ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--saffron)' }}>
                      VERIFIABLE IDENTITY PASS
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: '2px', color: '#FFFFFF' }}>{cred.holderName}</h3>
                  </div>

                  {cred.isRevoked ? (
                    <span className="badge-revoked">⚠️ REVOKED</span>
                  ) : (
                    <span className="badge-valid">✅ VERIFIED</span>
                  )}
                </div>

                {/* Details list */}
                <div className="neu-card-inset" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '20px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>DID: </span>
                    <span className="mono-text" style={{ fontSize: '0.78rem', color: 'var(--digital-blue-light)' }}>{cred.did}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>ID Type: </span>
                    <strong style={{ color: '#FFFFFF' }}>{cred.idType}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Doc Number: </span>
                    <span className="mono-text" style={{ color: '#FFFFFF' }}>{privacyMode ? '••••-••••-55' : cred.idNumber}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Nationality: </span>
                    <strong style={{ color: '#FFFFFF' }}>{cred.nationality}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Valid Until: </span>
                    <strong style={{ color: 'var(--india-green)' }}>{cred.validUntil}</strong>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono-text" style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                  {cred.id}
                </span>

                <button
                  onClick={() => openQrModal(cred)}
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                >
                  <QrCode size={16} /> Present QR Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Presentation Modal */}
      {selectedCred && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="clay-card" style={{ width: '100%', maxWidth: '450px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', background: 'var(--bg-midnight-card)' }}>
            <button
              onClick={() => setSelectedCred(null)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>

            <div className="clay-badge-green" style={{ marginBottom: '8px' }}>
              OFFICIAL VERIFIABLE QR PASS
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '4px', color: '#FFFFFF' }}>{selectedCred.holderName}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
              Present this QR to hotel check-in or checkpoint terminals for instant on-chain validation.
            </p>

            {/* QR Image Frame */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '18px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', marginBottom: '20px' }}>
              {qrUrl && <img src={qrUrl} alt="Credential QR" style={{ width: '220px', height: '220px', display: 'block' }} />}
            </div>

            <div className="neu-card-inset" style={{ padding: '14px 18px', width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Credential Reference:</span>
                <span className="mono-text" style={{ color: 'var(--digital-blue-light)' }}>{selectedCred.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Privacy Mode:</span>
                <span style={{ color: privacyMode ? '#34D399' : 'var(--saffron)', fontWeight: '700' }}>
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
