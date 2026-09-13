import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Fingerprint, 
  ShieldCheck, 
  Cpu, 
  EyeOff, 
  ChevronRight, 
  Building, 
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  RefreshCw,
  Terminal,
  Sparkles,
  Hash,
  Copy, 
  Check,
  Crown,
  Camera,
  Wallet,
  Blocks,
  Database
} from 'lucide-react';
import { useApp, normalizeRole } from '../context/AppContext';
import { Button, Badge } from './ui';

// SIH 2026 Presentation Simulator Scenarios (Minute 1:00 - 2:00 Live Demo)
const SCENARIOS = {
  valid: {
    key: 'valid',
    title: 'Scenario 1: Valid Tourism Pass',
    badge: 'Genuine Holder',
    status: 'VALID',
    subtitle: 'Original issued payload matches blockchain hash anchor perfectly with 0 raw PII on-chain.',
    payload: {
      credentialId: 'VC-IND-2026-8921',
      holderName: 'Aditi Sharma',
      idNumber: 'XXXX-XXXX-8921',
      documentType: 'Tourism Access Pass',
      issuer: 'Ministry of Tourism, Govt of India',
      expiryDate: '2028-12-31',
      did: 'did:verichain:9f83a48e912048f'
    },
    blockIndex: 104,
    isRevoked: false,
    tamperedField: null
  },
  tampered: {
    key: 'tampered',
    title: 'Scenario 2: Tamper Attack',
    badge: 'Malicious Forgery',
    status: 'TAMPERED',
    subtitle: 'Attacker altered 1 digit in Aadhaar number (8921 → 8922). SHA-256 Avalanche Effect triggers security alert.',
    payload: {
      credentialId: 'VC-IND-2026-8921',
      holderName: 'Aditi Sharma',
      idNumber: 'XXXX-XXXX-8922',
      documentType: 'Tourism Access Pass',
      issuer: 'Ministry of Tourism, Govt of India',
      expiryDate: '2028-12-31',
      did: 'did:verichain:9f83a48e912048f'
    },
    blockIndex: 104,
    isRevoked: false,
    tamperedField: 'idNumber'
  },
  revoked: {
    key: 'revoked',
    title: 'Scenario 3: Revoked Medical Pass',
    badge: 'Blacklisted Credential',
    status: 'REVOKED',
    subtitle: 'Credential flagged on-chain revocation registry. Verifier immediately blocks entry attempt.',
    payload: {
      credentialId: 'VC-MED-2026-3021',
      holderName: 'Vikram Malhotra',
      idNumber: 'MED-IND-7712',
      documentType: 'Health Clearance Certificate',
      issuer: 'National Health Authority',
      expiryDate: '2026-05-15',
      did: 'did:verichain:3b29c910aef7814'
    },
    blockIndex: 107,
    isRevoked: true,
    revocationReason: 'Flagged compromised / invalidated by Health Authority',
    tamperedField: null
  }
};

export default function LandingPage() {
  const { navigateTo, isAuthenticated, userProfile, changeUserRole } = useApp();

  const [activeScenarioKey, setActiveScenarioKey] = useState('valid');
  const [selectedMatrixRole, setSelectedMatrixRole] = useState(null);
  const [simPayload, setSimPayload] = useState(SCENARIOS.valid.payload);
  const [computedHash, setComputedHash] = useState('');
  const [validAnchorHash, setValidAnchorHash] = useState('');
  const [revokedAnchorHash, setRevokedAnchorHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Deterministic SHA-256 computation matching server/ledger.js
  const computeSha256 = async (data) => {
    try {
      const sortedKeys = Object.keys(data).sort();
      const canonical = sortedKeys.map(k => `${k}:${data[k]}`).join('|');
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(canonical);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      return '9f83a48e912048f0bc4219a7751c1402830deca559e26a4574972bc5df382104';
    } catch {
      return '9f83a48e912048f0bc4219a7751c1402830deca559e26a4574972bc5df382104';
    }
  };

  useEffect(() => {
    let isMounted = true;
    computeSha256(SCENARIOS.valid.payload).then(h => {
      if (isMounted) setValidAnchorHash(h);
    });
    computeSha256(SCENARIOS.revoked.payload).then(h => {
      if (isMounted) setRevokedAnchorHash(h);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      computeSha256(simPayload).then(h => {
        if (isMounted) {
          setComputedHash(h);
          setIsVerifying(false);
        }
      });
    }, 100);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [simPayload]);

  const handleSelectScenario = (key) => {
    setIsVerifying(true);
    setActiveScenarioKey(key);
    setSimPayload(SCENARIOS[key].payload);
  };

  const handleToggleDigit = () => {
    setIsVerifying(true);
    setSimPayload(prev => {
      const isCurrently8921 = prev.idNumber?.endsWith('8921');
      const newId = isCurrently8921 ? 'XXXX-XXXX-8922' : 'XXXX-XXXX-8921';
      return {
        ...prev,
        idNumber: newId
      };
    });
    if (activeScenarioKey !== 'tampered' && activeScenarioKey !== 'valid') {
      setActiveScenarioKey('tampered');
    }
  };

  const currentScenario = SCENARIOS[activeScenarioKey];
  const expectedAnchor = activeScenarioKey === 'revoked' 
    ? (revokedAnchorHash || '3b29c910aef78148b8120e23419bb60b13590e8c7401a89c31405eef3782bca9')
    : (validAnchorHash || '9f83a48e912048f0bc4219a7751c1402830deca559e26a4574972bc5df382104');

  const hashMatches = Boolean(computedHash && expectedAnchor && computedHash === expectedAnchor);
  const isRevokedOnChain = currentScenario.isRevoked;

  let simStatus = 'VALID';
  if (!hashMatches) {
    simStatus = 'TAMPERED';
  } else if (isRevokedOnChain) {
    simStatus = 'REVOKED';
  }

  return (
    <div className="landing-container" style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
      
      {/* SECTION 1: Reference Splash & Hero Banner */}
      <section 
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #071A3D 0%, #0B2A66 60%, #050B1C 100%)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--card-shadow-hover)',
          padding: '60px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '480px'
        }}
      >
        {/* Ambient background glow */}
        <div 
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(29, 78, 216, 0.10) 50%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(40px)',
            zIndex: 0
          }} 
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '720px' }}>
          
          {/* Logo Shield matching Reference */}
          <div 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'var(--grad-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 26px var(--glow-accent), inset 0 1.5px 2px rgba(255, 255, 255, 0.3)',
              marginBottom: '20px',
              animation: 'floatSmooth 4s infinite ease-in-out'
            }}
          >
            <Shield size={44} color="#FFFFFF" strokeWidth={2.2} />
          </div>

          <h1 
            style={{ 
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', 
              fontWeight: '900', 
              letterSpacing: '-0.03em', 
              color: 'var(--text-primary)',
              marginBottom: '10px',
              lineHeight: 1.1
            }}
          >
            VeriChain
          </h1>

          <p 
            style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', 
              fontWeight: '700', 
              color: 'var(--brand-royal-blue)', 
              marginBottom: '8px',
              letterSpacing: '-0.01em'
            }}
          >
            Your Identity. Your Control. Our Blockchain.
          </p>

          <p 
            style={{ 
              fontSize: '0.95rem', 
              color: 'var(--text-muted)', 
              marginBottom: '32px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Secure</span>
            <span>•</span>
            <span>Private</span>
            <span>•</span>
            <span>Tamper-Proof</span>
          </p>

          {/* Inspirational Tagline from Reference Mockup */}
          <div 
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-2)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-default)',
              marginBottom: '36px',
              color: 'var(--text-primary)',
              fontStyle: 'italic',
              fontSize: '0.92rem'
            }}
          >
            "Real people. Real identities. A safer tomorrow."
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="dark" 
              size="lg" 
              onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'login')}
              style={{
                background: '#071A3D',
                borderRadius: 'var(--radius-full)',
                padding: '14px 32px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              icon={ArrowRight}
              iconPosition="right"
            >
              {isAuthenticated ? 'Enter Dashboard' : 'Sign In / Get Started'}
            </Button>

            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => navigateTo('login')}
              style={{ borderRadius: 'var(--radius-full)', padding: '14px 28px' }}
            >
              Sign In / Identity Roles
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Welcome to VeriChain (Screen 2 in Reference) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
        <div>
          <span 
            style={{ 
              fontSize: '0.78rem', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              color: 'var(--brand-royal-blue)',
              display: 'inline-block',
              marginBottom: '8px'
            }}
          >
            Next-Generation Identity
          </span>

          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '14px' }}>
            Welcome to VeriChain
          </h2>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            A self-sovereign digital identity platform for a safer, simpler and more private tomorrow. Store verified credentials securely on your device and share cryptographic proofs without exposing personal data.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-royal-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Fingerprint size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>Biometric & Sovereign Control</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>Your private keys and credentials never leave your digital wallet without your consent.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--brand-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>Zero Raw PII on Blockchain</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>Only irreversible cryptographic commitments and revocation roots are anchored on-chain.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button 
              variant="dark" 
              onClick={() => navigateTo('wallet')}
              style={{ borderRadius: 'var(--radius-full)', background: '#071A3D', padding: '12px 26px' }}
              icon={ArrowRight}
              iconPosition="right"
            >
              Open Digital Wallet
            </Button>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              or <span onClick={() => navigateTo('verify')} style={{ color: 'var(--brand-royal-blue)', cursor: 'pointer', fontWeight: '600' }}>Scan QR Code</span>
            </span>
          </div>
        </div>

        {/* 3D Mockup Graphic Card matching reference */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{
              width: '100%',
              maxWidth: '360px',
              padding: '28px 24px',
              borderRadius: 'var(--radius-2xl)',
              background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--card-shadow-hover)',
              position: 'relative'
            }}
          >
            {/* Inner Phone frame mockup */}
            <div 
              style={{
                borderRadius: '24px',
                border: '2px solid rgba(37, 99, 235, 0.3)',
                padding: '24px 18px',
                background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.08) 0%, transparent 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--grad-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 24px var(--glow-accent)',
                  marginBottom: '16px'
                }}
              >
                <Fingerprint size={34} />
              </div>

              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                VeriChain Passport
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--brand-royal-blue)', fontWeight: '600', marginBottom: '16px' }}>
                W3C DID: did:veri:80002:...4e89
              </span>

              {/* Sample card inside phone */}
              <div 
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <Building size={16} color="var(--brand-royal-blue)" />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>Tourism Access Pass</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Government of India</div>
                  </div>
                </div>
                <Badge status="valid" size="sm">Valid</Badge>
              </div>

              <div 
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <GraduationCap size={16} color="var(--brand-royal-blue)" />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>College Degree</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ABC University</div>
                  </div>
                </div>
                <Badge status="valid" size="sm">Valid</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: 6. Role-Based Access Control (RBAC) Matrix */}
      <section id="rbac-matrix" style={{ scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(37, 99, 235, 0.12)',
              color: 'var(--brand-royal-blue)',
              fontSize: '0.8rem',
              fontWeight: '700',
              marginBottom: '12px',
              border: '1px solid rgba(37, 99, 235, 0.25)'
            }}
          >
            <Shield size={14} />
            <span>Security Architecture & Governance</span>
          </div>

          <h3 style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            6. Role-Based Access Control (RBAC) Matrix
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Granular access permissions dynamically governed by verified identities and synchronized with the Supabase database. Operational modules adapt instantly based on cryptographically verified roles.
          </p>
        </div>

        {/* Live Role Synchronizer / Interactive Presentation Tester */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--card-shadow)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--brand-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                flexShrink: 0
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Active Account Role:</span>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--brand-royal-blue)',
                    color: '#FFFFFF',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    letterSpacing: '0.04em'
                  }}
                >
                  {(selectedMatrixRole || normalizeRole(userProfile?.role)).toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Persisted & validated in Supabase <span className="mono-text" style={{ color: 'var(--brand-royal-blue)' }}>profiles.role</span> table
              </div>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              Switch & Save in Supabase:
            </span>
            {[
              { id: 'guest', label: 'Guest' },
              { id: 'user', label: 'User (Citizen)' },
              { id: 'verifier', label: 'Verifier (Hotel)' },
              { id: 'issuer', label: 'Issuer (Govt)' },
              { id: 'admin', label: 'Admin' }
            ].map((r) => {
              const currentActive = (selectedMatrixRole || normalizeRole(userProfile?.role));
              const isSelected = currentActive === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setSelectedMatrixRole(r.id);
                    changeUserRole(r.id);
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--brand-royal-blue)' : 'var(--bg-surface-2)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--brand-royal-blue)' : '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* The RBAC Matrix Table */}
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow-hover)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '0.86rem', fontWeight: '800', color: 'var(--text-primary)', width: '35%' }}>
                    Module / Privilege
                  </th>
                  {[
                    { key: 'guest', title: 'Guest' },
                    { key: 'user', title: 'User (Citizen)' },
                    { key: 'verifier', title: 'Verifier (Hotel)' },
                    { key: 'issuer', title: 'Issuer (Govt)' },
                    { key: 'admin', title: 'Admin' }
                  ].map((col) => {
                    const currentActive = (selectedMatrixRole || normalizeRole(userProfile?.role));
                    const isColActive = currentActive === col.key;
                    return (
                      <th
                        key={col.key}
                        onClick={() => {
                          setSelectedMatrixRole(col.key);
                          changeUserRole(col.key);
                        }}
                        style={{
                          padding: '16px 12px',
                          fontSize: '0.84rem',
                          fontWeight: '800',
                          textAlign: 'center',
                          color: isColActive ? 'var(--brand-royal-blue)' : 'var(--text-primary)',
                          background: isColActive ? 'rgba(37, 99, 235, 0.10)' : 'transparent',
                          cursor: 'pointer',
                          borderLeft: '1px solid var(--border-subtle)',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <span>{col.title}</span>
                          {isColActive && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--brand-success)', fontWeight: '700' }}>Active</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    title: 'Public Landing Page & Simulation',
                    desc: 'Platform overview, SIH hash tampering simulator, and architectural specifications',
                    icon: Sparkles,
                    targetRoute: 'landing',
                    access: { guest: true, user: true, verifier: true, issuer: true, admin: true }
                  },
                  {
                    title: 'Holder Digital Wallet',
                    desc: 'Self-sovereign credential storage, offline QR pass presentation, and identity disclosure',
                    icon: Wallet,
                    targetRoute: 'wallet',
                    access: { guest: false, user: true, verifier: false, issuer: true, admin: true }
                  },
                  {
                    title: 'Hotel Verifier Camera Terminal',
                    desc: 'Instant zero-knowledge QR camera verification and cryptographic integrity checks',
                    icon: Camera,
                    targetRoute: 'verify',
                    access: { guest: false, user: false, verifier: true, issuer: true, admin: true }
                  },
                  {
                    title: 'DID Issuance & Revocation Desk',
                    desc: 'Authorized digital credential issuance and real-time on-chain revocation anchors',
                    icon: ShieldCheck,
                    targetRoute: 'issue',
                    access: { guest: false, user: false, verifier: false, issuer: true, admin: true }
                  },
                  {
                    title: 'Blockchain Ledger Explorer',
                    desc: 'Public audit trail, block validator stream, and SHA-256 state commitment verification',
                    icon: Blocks,
                    targetRoute: 'explorer',
                    access: { guest: false, user: true, verifier: true, issuer: true, admin: true }
                  },
                  {
                    title: 'Admin Role Governance Panel',
                    desc: 'System-wide role governance, cryptographic authority management, and user registry',
                    icon: Crown,
                    targetRoute: 'admin',
                    access: { guest: false, user: false, verifier: false, issuer: false, admin: true }
                  }
                ].map((row, idx) => {
                  const RowIcon = row.icon;
                  const currentActive = (selectedMatrixRole || normalizeRole(userProfile?.role));
                  const isCurrentAllowed = row.access[currentActive];

                  return (
                    <tr
                      key={row.title}
                      style={{
                        borderBottom: idx === 5 ? 'none' : '1px solid var(--border-subtle)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-md)',
                              background: isCurrentAllowed ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-2)',
                              color: isCurrentAllowed ? 'var(--brand-royal-blue)' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}
                          >
                            <RowIcon size={18} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                {row.title}
                              </strong>
                              <button
                                type="button"
                                onClick={() => navigateTo(row.targetRoute)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--brand-royal-blue)',
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  padding: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                                title={`Navigate to ${row.title}`}
                              >
                                <span>Launch</span>
                                <ChevronRight size={12} />
                              </button>
                            </div>
                            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>
                              {row.desc}
                            </p>
                          </div>
                        </div>
                      </td>

                      {['guest', 'user', 'verifier', 'issuer', 'admin'].map((roleKey) => {
                        const allowed = row.access[roleKey];
                        const currentActive = (selectedMatrixRole || normalizeRole(userProfile?.role));
                        const isColActive = currentActive === roleKey;

                        return (
                          <td
                            key={roleKey}
                            style={{
                              padding: '16px 12px',
                              textAlign: 'center',
                              background: isColActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                              borderLeft: '1px solid var(--border-subtle)',
                              verticalAlign: 'middle'
                            }}
                          >
                            {allowed ? (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: 'rgba(16, 185, 129, 0.14)',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  color: 'var(--brand-success)'
                                }}
                                title="Allowed Privilege"
                              >
                                <CheckCircle2 size={18} />
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: 'rgba(239, 68, 68, 0.08)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  color: 'var(--brand-danger)',
                                  opacity: 0.65
                                }}
                                title="Restricted Privilege"
                              >
                                <XCircle size={18} />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3.5: Interactive Verification Simulator (Judge Presentation Sandbox) */}
      <section 
        id="presentation-simulator"
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
          border: '1px solid var(--border-default)',
          padding: '40px 28px',
          boxShadow: 'var(--card-shadow-hover)',
          position: 'relative'
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px' }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 16px', 
              borderRadius: 'var(--radius-full)', 
              background: 'rgba(37, 99, 235, 0.12)', 
              color: 'var(--brand-royal-blue)', 
              fontSize: '0.8rem', 
              fontWeight: '700', 
              letterSpacing: '0.04em', 
              marginBottom: '12px' 
            }}
          >
            <Sparkles size={14} /> SIH 2026 LIVE DEMO SANDBOX (MINUTE 1:00 - 2:00)
          </div>

          <h3 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Interactive Verification Simulator
          </h3>

          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Experience VeriChain's zero-knowledge cryptographic verification live. Select a presentation scenario or toggle attributes to witness the SHA-256 Avalanche Effect in real time.
          </p>
        </div>

        {/* 3 Scenario Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {Object.keys(SCENARIOS).map((key) => {
            const sc = SCENARIOS[key];
            const isSelected = activeScenarioKey === key;
            const isTampered = key === 'tampered';
            const isRevoked = key === 'revoked';

            let activeBorder = '2px solid var(--border-default)';
            let activeBg = 'var(--bg-surface)';
            if (isSelected) {
              if (key === 'valid') {
                activeBorder = '2px solid var(--brand-success)';
                activeBg = 'rgba(16, 185, 129, 0.06)';
              } else if (isTampered) {
                activeBorder = '2px solid var(--brand-danger)';
                activeBg = 'rgba(239, 68, 68, 0.06)';
              } else {
                activeBorder = '2px solid var(--brand-warning)';
                activeBg = 'rgba(245, 158, 11, 0.06)';
              }
            }

            return (
              <div 
                key={key}
                onClick={() => handleSelectScenario(key)}
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)',
                  background: activeBg,
                  border: activeBorder,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.12)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {key === 'valid' && <CheckCircle2 size={18} color="var(--brand-success)" />}
                    {isTampered && <ShieldAlert size={18} color="var(--brand-danger)" />}
                    {isRevoked && <XCircle size={18} color="var(--brand-warning)" />}
                    <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {sc.title}
                    </span>
                  </div>
                  <Badge status={key === 'valid' ? 'valid' : key === 'tampered' ? 'danger' : 'warning'} size="sm">
                    {sc.badge}
                  </Badge>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {sc.subtitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Simulator Workbench */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Scanned Payload & Interactive Controls */}
          <div 
            style={{ 
              padding: '24px', 
              borderRadius: 'var(--radius-xl)', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="var(--brand-royal-blue)" />
                <span style={{ fontWeight: '700', fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  Scanned Credential Payload
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--brand-royal-blue)', fontWeight: '600' }}>
                W3C Verifiable Presentation
              </span>
            </div>

            {/* Field Breakdown Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-2)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Holder Full Name</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{simPayload.holderName}</span>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px 12px', 
                  borderRadius: 'var(--radius-sm)', 
                  background: simPayload.idNumber?.endsWith('8922') ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-surface-2)',
                  border: simPayload.idNumber?.endsWith('8922') ? '1px solid var(--brand-danger)' : '1px solid transparent',
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Aadhaar / ID Number</span>
                  {simPayload.idNumber?.endsWith('8922') && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--brand-danger)', fontWeight: '700', marginTop: '2px' }}>
                      ⚠ Maliciously Modified (+1 Digit)
                    </div>
                  )}
                </div>
                <span style={{ fontWeight: '800', fontFamily: 'monospace', color: simPayload.idNumber?.endsWith('8922') ? 'var(--brand-danger)' : 'var(--text-primary)' }}>
                  {simPayload.idNumber}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-2)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Document Type</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{simPayload.documentType}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-2)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Issuing Authority</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', textAlign: 'right' }}>{simPayload.issuer}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-2)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Anchored Block Index</span>
                <span style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--brand-royal-blue)' }}>
                  Block #{currentScenario.blockIndex}
                </span>
              </div>
            </div>

            {/* Live Interactive Attack Controls */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Judge Demonstration Actions:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleToggleDigit}
                  style={{ 
                    flex: '1 1 auto', 
                    borderRadius: 'var(--radius-full)',
                    borderColor: simPayload.idNumber?.endsWith('8922') ? 'var(--brand-danger)' : 'var(--border-default)',
                    color: simPayload.idNumber?.endsWith('8922') ? 'var(--brand-danger)' : 'var(--text-primary)'
                  }}
                  icon={RefreshCw}
                >
                  {simPayload.idNumber?.endsWith('8922') ? 'Restore ID (8922 → 8921)' : 'Tamper 1 Digit (8921 → 8922)'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSelectScenario(activeScenarioKey)}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Cryptographic Engine & Verdict */}
          <div 
            style={{ 
              padding: '24px', 
              borderRadius: 'var(--radius-xl)', 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hash size={18} color="var(--brand-royal-blue)" />
                <span style={{ fontWeight: '700', fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  Cryptographic Hashing & Ledger Proof
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: isVerifying ? 'var(--brand-royal-blue)' : 'var(--brand-success)', fontWeight: '600' }}>
                {isVerifying ? 'Computing...' : 'Sub-50ms Verification'}
              </span>
            </div>

            {/* Computed Hash Box */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.76rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Live Computed SHA-256 Digest:</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(computedHash);
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-royal-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '600' }}
                >
                  {copiedHash ? <Check size={12} /> : <Copy size={12} />}
                  {copiedHash ? 'Copied' : 'Copy Hash'}
                </button>
              </div>
              <div 
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg-surface-3)', 
                  fontFamily: 'monospace', 
                  fontSize: '0.76rem', 
                  color: hashMatches ? 'var(--brand-success)' : 'var(--brand-danger)',
                  wordBreak: 'break-all',
                  border: hashMatches ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                0x{computedHash || '...'}
              </div>
            </div>

            {/* Expected Anchor Hash Box */}
            <div>
              <div style={{ marginBottom: '6px', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Anchored Blockchain State (Block #{currentScenario.blockIndex}):
              </div>
              <div 
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg-surface-3)', 
                  fontFamily: 'monospace', 
                  fontSize: '0.76rem', 
                  color: 'var(--text-secondary)',
                  wordBreak: 'break-all',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                0x{expectedAnchor}
              </div>
            </div>

            {/* Avalanche Effect Explainer Callout */}
            {!hashMatches && (
              <div 
                style={{ 
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid var(--brand-danger)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <AlertTriangle size={18} color="var(--brand-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--brand-danger)' }}>
                    SHA-256 Avalanche Effect Triggered
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                    Altering just 1 digit changed the resulting hash by 100%. The mathematical mismatch prevents forged credentials from ever passing verification.
                  </div>
                </div>
              </div>
            )}

            {/* BIG VERIFICATION VERDICT BANNER */}
            <div 
              style={{ 
                padding: '20px', 
                borderRadius: 'var(--radius-lg)', 
                background: simStatus === 'VALID' 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)' 
                  : simStatus === 'TAMPERED'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
                border: simStatus === 'VALID' 
                  ? '2px solid var(--brand-success)' 
                  : simStatus === 'TAMPERED'
                  ? '2px solid var(--brand-danger)'
                  : '2px solid var(--brand-warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: simStatus === 'VALID' 
                  ? '0 8px 24px rgba(16, 185, 129, 0.2)' 
                  : simStatus === 'TAMPERED'
                  ? '0 8px 24px rgba(239, 68, 68, 0.2)'
                  : '0 8px 24px rgba(245, 158, 11, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              <div 
                style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '50%', 
                  background: simStatus === 'VALID' ? 'var(--brand-success)' : simStatus === 'TAMPERED' ? 'var(--brand-danger)' : 'var(--brand-warning)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {simStatus === 'VALID' && <CheckCircle2 size={30} strokeWidth={2.5} />}
                {simStatus === 'TAMPERED' && <ShieldAlert size={30} strokeWidth={2.5} />}
                {simStatus === 'REVOKED' && <XCircle size={30} strokeWidth={2.5} />}
              </div>

              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                  {simStatus === 'VALID' && 'IDENTITY VERIFIED & VALID'}
                  {simStatus === 'TAMPERED' && 'SECURITY ALERT: TAMPER DETECTED'}
                  {simStatus === 'REVOKED' && 'ACCESS DENIED: CREDENTIAL REVOKED'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: '1.4' }}>
                  {simStatus === 'VALID' && 'Cryptographic digest perfectly matches Block #104 anchor. Zero raw PII exposed. Check-in approved!'}
                  {simStatus === 'TAMPERED' && 'Cryptographic hash mismatch! Presented payload diverges from on-chain anchor. Check-in rejected!'}
                  {simStatus === 'REVOKED' && 'Credential flagged on Polygon Amoy Revocation Registry (Block #107). Check-in rejected!'}
                </div>
              </div>
            </div>

            {/* Terminal / Explorer Direct Links */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '6px' }}>
              <Button 
                variant="dark" 
                size="sm" 
                onClick={() => navigateTo('verify')}
                style={{ borderRadius: 'var(--radius-full)', background: '#071A3D', padding: '10px 20px' }}
                icon={ArrowRight}
                iconPosition="right"
              >
                Open Verifier Terminal
              </Button>

              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => navigateTo('explorer')}
                style={{ borderRadius: 'var(--radius-full)', padding: '10px 18px' }}
              >
                Audit Block #{currentScenario.blockIndex} in Explorer
              </Button>
            </div>

          </div>

        </div>

      </section>

      {/* SECTION 4: Reference Bottom Banner (Four Trust Pillars) */}
      <section 
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
          border: '1px solid var(--border-default)',
          padding: '40px 28px',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--brand-royal-blue)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            <Shield size={16} /> VeriChain Architecture
          </div>
          <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Identity is personal. Trust is decentralized.
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Engineered on W3C DID specifications and EVM cryptographic commitments.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          
          <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-royal-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EyeOff size={20} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>Privacy by Design</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Zero raw personal information is ever broadcast on public blockchains. Selective disclosure protects privacy.
            </p>
          </div>

          <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(29, 78, 216, 0.14)', color: 'var(--brand-royal-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>Cryptographic Integrity</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Immutable SHA-256 state commitments guarantee that any unauthorized change renders the credential invalid.
            </p>
          </div>

          <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>Decentralized Verification</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Verifiers authenticate credentials locally in sub-seconds without contacting the issuing authority's servers.
            </p>
          </div>

          <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--brand-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>Granular Revocation</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Issuers can revoke single credentials instantly. Verifiers identify revoked credentials immediately during scanning.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5: Footer */}
      <footer 
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
            <Shield size={16} />
          </div>
          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>VeriChain</span>
          <span>•</span>
          <span>Self-Sovereign Digital Identity Platform</span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => navigateTo('how-it-works')}>How It Works</span>
          <span style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => navigateTo('wallet')}>Wallet</span>
          <span style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => navigateTo('verify')}>Verifier</span>
          <span style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => navigateTo('dashboard')}>Dashboard</span>
        </div>
      </footer>

    </div>
  );
}
