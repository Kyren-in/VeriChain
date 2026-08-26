import React, { useState, useEffect } from 'react';
import { 
  UserCheck, ShieldCheck, Hash, Sparkles, Calendar, Globe, 
  CreditCard, Ban, Camera, Search, User, ShieldAlert, AlertTriangle, CheckCircle2, RotateCcw 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { API_BASE_URL } from '../api';

export default function IssuerPortal({ onCredentialIssued }) {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue' | 'revoke'
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Issue Form State
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

  // Revoke by Email State
  const [searchRevokeEmail, setSearchRevokeEmail] = useState('');
  const [revokeSearching, setRevokeSearching] = useState(false);
  const [userCredentialsToRevoke, setUserCredentialsToRevoke] = useState([]);
  const [revokeReason, setRevokeReason] = useState('Safety Violation / Fraud Flagged by Authority');
  const [revokeMsg, setRevokeMsg] = useState('');
  const [revokingId, setRevokingId] = useState(null);

  useEffect(() => {
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
          userEmail: '',
          userId: '',
          idType: 'Aadhaar Card',
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

  // Search Credentials for a specific user email to revoke
  const handleSearchCredentialsByEmail = async (e) => {
    if (e) e.preventDefault();
    if (!searchRevokeEmail.trim()) return;

    setRevokeSearching(true);
    setRevokeMsg('');
    setUserCredentialsToRevoke([]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials`);
      const allCreds = await res.json();
      
      const emailQuery = searchRevokeEmail.trim().toLowerCase();

      // Find user name from registered profiles if available
      const matchedProfile = registeredUsers.find(u => u.email && u.email.toLowerCase() === emailQuery);
      const matchedName = matchedProfile?.full_name?.toLowerCase() || '';

      const userCreds = allCreds.filter(cred => {
        const credEmail = (cred.userEmail || '').toLowerCase();
        const credHolder = (cred.holderName || '').toLowerCase();
        return credEmail === emailQuery || 
               (matchedName && credHolder.includes(matchedName)) ||
               (emailQuery.includes(credHolder) && credHolder.length > 2);
      });

      setUserCredentialsToRevoke(userCreds);
      if (userCreds.length === 0) {
        setRevokeMsg(`No issued credentials found for "${searchRevokeEmail}".`);
      }
    } catch (err) {
      setRevokeMsg('Error searching credentials: ' + err.message);
    } finally {
      setRevokeSearching(false);
    }
  };

  // Execute On-Chain Revocation
  const handleRevokeCredential = async (credId) => {
    if (!window.confirm(`Are you sure you want to permanently revoke Credential ${credId} on the blockchain?`)) {
      return;
    }

    setRevokingId(credId);
    setRevokeMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: credId, reason: revokeReason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRevokeMsg(`Credential ${credId} has been successfully revoked and anchored to Polygon Amoy block #${data.block?.index}!`);
        // Update local state to show revoked status
        setUserCredentialsToRevoke(prev => prev.map(c => c.id === credId ? { ...c, isRevoked: true } : c));
      } else {
        setRevokeMsg(data.error || 'Failed to revoke credential.');
      }
    } catch (err) {
      setRevokeMsg('Error executing revocation: ' + err.message);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Top Tab Bar: Issue vs Revoke */}
      <div 
        className="clay-card" 
        style={{ 
          padding: '14px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{ 
              background: activeTab === 'issue' ? 'linear-gradient(135deg, #FF8A3D 0%, #EA580C 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', 
              padding: '10px', 
              borderRadius: '14px', 
              color: '#FFFFFF',
              boxShadow: 'var(--clay-pill)'
            }}
          >
            {activeTab === 'issue' ? <UserCheck size={22} /> : <ShieldAlert size={22} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              {activeTab === 'issue' ? 'Authority Credential Issuance' : 'Authority Identity Revocation Control'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {activeTab === 'issue' ? 'Issue verifiable digital tourist credentials' : 'Search user by email to immediately revoke credentials on-chain'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-sunken)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('issue')}
            className={activeTab === 'issue' ? 'btn-saffron' : 'btn-ghost'}
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <Sparkles size={15} /> Issue Credential
          </button>
          <button
            onClick={() => setActiveTab('revoke')}
            className={activeTab === 'revoke' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '8px 16px', fontSize: '0.84rem', background: activeTab === 'revoke' ? '#DC2626' : 'transparent', color: '#FFFFFF' }}
          >
            <Ban size={15} /> Revoke by Email
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: ISSUE CREDENTIAL
          ========================================================================= */}
      {activeTab === 'issue' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '26px' }}>
          
          {/* Form Panel */}
          <div className="clay-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #FF8A3D 0%, #EA580C 100%)', 
                  padding: '12px', 
                  borderRadius: '16px', 
                  color: '#FFFFFF',
                  boxShadow: 'var(--clay-pill), var(--neu-glow-saffron)'
                }}
              >
                <UserCheck size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Issue Verifiable Credential</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Create tourist DID & anchor SHA-256 hash to Polygon Amoy
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Search User (Email / ID)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search registered user..."
                      className="input-field"
                      value={formData.userEmail}
                      onChange={(e) => handleEmailSearchChange(e.target.value)}
                      onFocus={() => formData.userEmail && setShowDropdown(true)}
                    />
                    <Search size={16} style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--text-dim)' }} />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showDropdown && filteredUsers.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '100%',
                        marginTop: '4px',
                        background: 'var(--bg-midnight-card)',
                        border: '1px solid var(--digital-blue)',
                        borderRadius: '12px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 200,
                        boxShadow: '0 12px 30px rgba(0,0,0,0.7)'
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
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FFFFFF' }}>
                            {u.full_name || 'Standard User'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {u.email} | ID: {u.id?.substring(0, 8)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Tagged User UUID
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Auto-filled UUID"
                    className="input-field"
                    value={formData.userId}
                    style={{ color: 'var(--digital-blue-light)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
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
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
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

              <button type="submit" className="btn-saffron" disabled={loading} style={{ marginTop: '8px', justifyContent: 'center' }}>
                {loading ? 'Anchoring to Blockchain...' : <><Sparkles size={18} /> Issue & Anchor Credential</>}
              </button>
            </form>
          </div>

          {/* Output Confirmation Panel */}
          <div className="clay-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', 
                  padding: '12px', 
                  borderRadius: '16px', 
                  color: '#FFFFFF',
                  boxShadow: 'var(--clay-pill), var(--neu-glow-green)'
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Live On-Chain Receipt</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Cryptographic Proof & Block Details
                </p>
              </div>
            </div>

            {lastIssued ? (
              <div className="neu-card-inset" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge-valid">✅ Anchored to Polygon Amoy</span>
                  <span className="mono-text" style={{ fontSize: '0.78rem', color: 'var(--digital-blue-light)' }}>
                    Block #{lastIssued.block.index}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Holder DID</div>
                  <div className="mono-text" style={{ fontSize: '0.82rem', color: 'var(--text-main)', wordBreak: 'break-all', marginTop: '2px' }}>
                    {lastIssued.credential.did}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>On-Chain Payload SHA-256 Hash</div>
                  <div className="mono-text" style={{ fontSize: '0.78rem', color: 'var(--saffron)', wordBreak: 'break-all', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px', marginTop: '4px' }}>
                    {lastIssued.credentialHash}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Holder: </span>
                    <strong style={{ color: '#FFFFFF' }}>{lastIssued.credential.holderName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>ID Ref: </span>
                    <strong style={{ color: '#FFFFFF' }}>{lastIssued.credential.idNumber}</strong>
                  </div>
                </div>

                <div className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Tx Hash: {lastIssued.block.hash}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center', padding: '40px 20px' }}>
                <Hash size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
                <p style={{ fontSize: '0.9rem', maxWidth: '380px' }}>
                  Fill in tourist identity details on the left to issue a verifiable digital credential and generate an on-chain receipt.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: REVOKE CREDENTIAL BY USER EMAIL
          ========================================================================= */}
      {activeTab === 'revoke' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Email Search Card */}
          <div className="clay-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', 
                  padding: '12px', 
                  borderRadius: '16px', 
                  color: '#FFFFFF',
                  boxShadow: 'var(--clay-pill)'
                }}
              >
                <Ban size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Search & Revoke by User Email</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Type a citizen or tourist's email to fetch their active credentials and broadcast a permanent revocation flag on-chain.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearchCredentialsByEmail} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  required
                  placeholder="Enter tourist / user email (e.g. tourist@domain.com)..."
                  value={searchRevokeEmail}
                  onChange={(e) => setSearchRevokeEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                />
              </div>

              <div style={{ minWidth: '240px' }}>
                <select
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="input-field"
                >
                  <option value="Safety Violation / Fraud Flagged by Authority">Safety Violation / Fraud Flagged</option>
                  <option value="Reported Stolen / Compromised Document">Reported Stolen / Compromised Document</option>
                  <option value="Expired Visa / Tourism Term Ended">Expired Visa / Tourism Term Ended</option>
                  <option value="Administrative Cancellation">Administrative Cancellation</option>
                </select>
              </div>

              <button type="submit" disabled={revokeSearching} className="btn-saffron" style={{ padding: '12px 24px', background: '#DC2626' }}>
                {revokeSearching ? 'Searching...' : <><Search size={16} /> Look Up Credentials</>}
              </button>
            </form>

            {revokeMsg && (
              <div 
                style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  background: revokeMsg.includes('successfully') ? 'var(--india-green-soft)' : 'rgba(239, 68, 68, 0.15)',
                  color: revokeMsg.includes('successfully') ? '#34D399' : '#F87171',
                  border: `1px solid ${revokeMsg.includes('successfully') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  fontSize: '0.85rem'
                }}
              >
                {revokeMsg}
              </div>
            )}
          </div>

          {/* Search Results / Credential Cards */}
          {userCredentialsToRevoke.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {userCredentialsToRevoke.map((cred) => (
                <div 
                  key={cred.id}
                  className="neu-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    border: cred.isRevoked ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                    background: cred.isRevoked ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-midnight-card)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--saffron)', textTransform: 'uppercase' }}>
                          CREDENTIAL ID: {cred.id}
                        </span>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                          {cred.holderName}
                        </h4>
                      </div>

                      {cred.isRevoked ? (
                        <span className="badge-revoked">⚠️ REVOKED</span>
                      ) : (
                        <span className="badge-valid">✅ ACTIVE</span>
                      )}
                    </div>

                    <div className="neu-card-inset" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>DID: </span>
                        <span className="mono-text" style={{ color: 'var(--digital-blue-light)', fontSize: '0.78rem' }}>{cred.did}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>ID Document: </span>
                        <strong>{cred.idType} ({cred.idNumber})</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Valid Until: </span>
                        <strong>{cred.validUntil}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Issuing Authority: </span>
                        <strong>{cred.issuer}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    {cred.isRevoked ? (
                      <span style={{ fontSize: '0.8rem', color: '#FBBF24', fontWeight: '700' }}>
                        Revocation Already Anchored On-Chain
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevokeCredential(cred.id)}
                        disabled={revokingId === cred.id}
                        className="btn-saffron"
                        style={{ background: '#DC2626', padding: '9px 18px', fontSize: '0.85rem' }}
                      >
                        {revokingId === cred.id ? 'Revoking On-Chain...' : <><Ban size={15} /> Revoke Credential</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

