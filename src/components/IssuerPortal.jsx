import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Hash, Sparkles, Calendar, Globe, CreditCard, Ban, Camera, Search, User } from 'lucide-react';
import QrScannerModal from './QrScannerModal';
import { supabase } from '../lib/supabaseClient';
import { API_BASE_URL } from '../api';

export default function IssuerPortal({ onCredentialIssued }) {
  const [activeSubTab, setActiveSubTab] = useState('issue'); // 'issue' | 'revoke'
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    holderName: '',
    userEmail: '',
    userId: '',
    idType: 'Aadhaar Card',
    idNumber: '',
    nationality: 'Indian',
    validUntil: '2027-12-31',
    issuer: 'Incredible India Tourism Authority'
  });

  const [loading, setLoading] = useState(false);
  const [lastIssued, setLastIssued] = useState(null);
  const [revokeId, setRevokeId] = useState('');
  const [revokeReason, setRevokeReason] = useState('Safety Violation / Fraud Flagged');
  const [revokeStatus, setRevokeStatus] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    // Fetch registered users from Supabase for live autocomplete lookup
    const fetchRegisteredUsers = async () => {
      try {
        const { data } = await supabase.from('profiles').select('*');
        if (data) setRegisteredUsers(data);
      } catch (err) {
        console.error('Error fetching registered users:', err);
      }
    };
    fetchRegisteredUsers();
  }, []);

  const handleEmailSearchChange = (value) => {
    setFormData(prev => ({ ...prev, userEmail: value }));
    if (!value.trim()) {
      setFilteredUsers([]);
      setShowDropdown(false);
      return;
    }

    const searchLower = value.toLowerCase();
    const matches = registeredUsers.filter(u => 
      (u.email && u.email.toLowerCase().includes(searchLower)) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchLower)) ||
      (u.id && u.id.toLowerCase().includes(searchLower))
    );
    setFilteredUsers(matches);
    setShowDropdown(true);
  };

  const selectUserMatch = (user) => {
    setFormData(prev => ({
      ...prev,
      userEmail: user.email,
      userId: user.id,
      holderName: user.full_name || prev.holderName
    }));
    setShowDropdown(false);
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!revokeId) return;
    setLoading(true);
    setRevokeStatus(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: revokeId, reason: revokeReason })
      });
      const data = await res.json();
      setRevokeStatus(data);
      if (data.success) {
        setRevokeId('');
      }
    } catch (err) {
      alert('Error revoking credential: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQrScanned = (scannedText) => {
    try {
      const payload = JSON.parse(scannedText);
      if (payload.id) setRevokeId(payload.id);
    } catch (err) {
      setRevokeId(scannedText);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLastIssued(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setLastIssued(data);
        if (onCredentialIssued) onCredentialIssued(data.credential);
        setFormData({
          holderName: '',
          idType: 'Aadhaar / Passport',
          idNumber: '',
          nationality: 'Indian',
          validUntil: '2027-12-31',
          issuer: 'Incredible India Tourism Authority'
        });
      }
    } catch (err) {
      alert('Error issuing credential: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
      {/* Form Panel */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Issue Verifiable Credential</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create tourist DID & anchor SHA-256 hash to testnet</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Tourist Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              className="input-field"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Search Registered User (Email/Name/ID)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type letter/number to search user..."
                  className="input-field"
                  value={formData.userEmail}
                  onChange={(e) => handleEmailSearchChange(e.target.value)}
                  onFocus={() => formData.userEmail && setShowDropdown(true)}
                />
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-dim)' }} />
              </div>

              {/* Autocomplete Matching Dropdown */}
              {showDropdown && filteredUsers.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    background: 'rgba(18, 24, 38, 0.98)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--primary)',
                    borderRadius: '12px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 200,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                >
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => selectUserMatch(u)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                        {u.full_name || 'Standard User'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {u.email} | ID: {u.id?.substring(0, 8)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Tagged User ID (Auto-Filled UUID)
              </label>
              <input
                type="text"
                readOnly
                placeholder="Auto-filled when user selected"
                className="input-field"
                value={formData.userId}
                style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--accent-cyan)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                ID Type
              </label>
              <select
                className="input-field"
                value={formData.idType}
                onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Passport">Passport</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Driver License">Driver License</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                ID Document Number
              </label>
              <input
                type="text"
                required
                placeholder="IND-9874-3210"
                className="input-field"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Nationality
              </label>
              <input
                type="text"
                required
                placeholder="Indian"
                className="input-field"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Valid Until
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Issuing Authority
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', justifyContent: 'center' }}>
            {loading ? 'Anchoring to Blockchain...' : <><Sparkles size={18} /> Issue & Anchor Credential</>}
          </button>
        </form>
      </div>

      {/* Output Confirmation Panel */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--accent-cyan)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Live On-Chain Receipt</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cryptographic Proof & Block Details</p>
          </div>
        </div>

        {lastIssued ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(15, 23, 42, 0.4)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge-valid">✅ Anchored to Polygon Amoy</span>
              <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Block #{lastIssued.block.index}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Holder DID</div>
              <div className="mono-text" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', marginTop: '2px' }}>
                {lastIssued.credential.did}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On-Chain Payload SHA-256 Hash</div>
              <div className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--primary)', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
                {lastIssued.credentialHash}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Holder: </span>
                <strong>{lastIssued.credential.holderName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>ID Ref: </span>
                <strong>{lastIssued.credential.idNumber}</strong>
              </div>
            </div>

            <div className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              Tx Hash: {lastIssued.block.hash}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center', padding: '40px 20px' }}>
            <Hash size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem' }}>Fill in tourist identity details on the left to issue a verifiable digital credential and generate an on-chain receipt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
