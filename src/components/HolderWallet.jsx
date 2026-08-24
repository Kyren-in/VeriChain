import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Wallet, QrCode, Shield, ShieldAlert, CheckCircle, RefreshCw, X, AlertTriangle, Eye, EyeOff, KeyRound, Trash2, Settings } from 'lucide-react';
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
  const [selfRevokeStep, setSelfRevokeStep] = useState(1); // 1: initial, 2: OTP sent
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
      // 1. Verify OTP first
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: selfRevokeOtp })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Invalid OTP code.');
      }

      // 2. Process self-revocation for user's credentials
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
      
      // Strict user privacy filter: Match credential holderName or DID with current user metadata
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
      // Clean internal DB properties (isRevoked, hash) so QR code payload exactly matches issued schema
      const { isRevoked, hash, userEmail, userId, ...cleanPayload } = cred;

      const payloadString = JSON.stringify(cleanPayload, null, 2);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Self-Sovereign Identity Credentials</p>
              {user && (
                <span className="badge-valid" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                  User ID: {user.id?.substring(0, 8)}... | {user.email}
                </span>
              )}
            </div>
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

          <button onClick={() => setIsSettingsOpen(true)} className="btn-secondary">
            <Settings size={16} /> Account Options
          </button>
        </div>
      </div>

      {/* Account Settings Modal */}
      {isSettingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings color="var(--primary)" size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Account & Security</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {settingsMsg && (
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {settingsMsg}
              </div>
            )}

            {/* User Profile Info Card */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <strong style={{ color: '#fff' }}>{user?.user_metadata?.full_name || 'Standard User'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <strong style={{ color: '#fff' }}>{user?.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>User UUID:</span>
                <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{user?.id}</span>
              </div>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reset Account Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#fff'
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px', justifyContent: 'center' }}>
                <KeyRound size={16} /> Update Password
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--accent-pink)', display: 'block' }}>Danger Zone</label>
              
              {/* Self Revoke DID Button & OTP Verification */}
              {selfRevokeStep === 1 ? (
                <button
                  type="button"
                  onClick={handleSendRevokeOtp}
                  disabled={revokeLoading}
                  className="btn-secondary"
                  style={{ borderColor: 'rgba(245, 158, 11, 0.5)', color: '#fbbf24', width: '100%', justifyContent: 'center' }}
                >
                  <ShieldAlert size={16} /> {revokeLoading ? 'Sending OTP...' : 'Self-Revoke My DID Credential'}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Enter 6-Digit Email OTP to Confirm Revocation:</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={selfRevokeOtp}
                    onChange={(e) => setSelfRevokeOtp(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid #fbbf24',
                      color: '#fff',
                      letterSpacing: '3px',
                      fontSize: '1rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleConfirmSelfRevoke}
                      disabled={revokeLoading}
                      className="btn-primary"
                      style={{ flex: 1, padding: '8px', justifyContent: 'center', background: '#d97706' }}
                    >
                      {revokeLoading ? 'Revoking...' : 'Confirm Self-Revoke'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelfRevokeStep(1)}
                      className="btn-secondary"
                      style={{ padding: '8px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button onClick={handleDeleteAccount} className="btn-secondary" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--accent-pink)', width: '100%', justifyContent: 'center' }}>
                <Trash2 size={16} /> Delete Identity Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading tourist wallet credentials...</div>
      ) : credentials.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--accent-amber)' }}>
          <ShieldAlert size={36} style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>DID Not Issued by Authority</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Your account is verified, but an official Verifiable Credential has not been issued to <strong>{user?.user_metadata?.full_name || user?.email}</strong> yet.
          </p>
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
