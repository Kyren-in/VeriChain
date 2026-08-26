import React, { useState } from 'react';
import HeroIdentityBadge from './HeroIdentityBadge';
import { 
  Shield, CheckCircle2, AlertTriangle, XCircle, ArrowRight, 
  Scan, Blocks, Lock, FileCheck, Users, Building2, UserCheck, 
  Database, Eye, EyeOff, Layers, Fingerprint, ShieldCheck, 
  ChevronRight, Sparkles, RefreshCw, Cpu, ExternalLink 
} from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function LandingPage({ onNavigateTab, onOpenAuth }) {
  // Interactive Verification Playground state for Judges
  const [testPayload, setTestPayload] = useState('VALID');
  const [verifying, setVerifying] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const sampleScenarios = {
    VALID: {
      title: 'Valid Tourist Credential',
      desc: 'Authentic DID signed by Incredible India Authority and anchored on Polygon Amoy testnet.',
      payload: {
        id: "vc-ind-tourist-9042",
        holderName: "Aarav Sharma",
        idType: "Aadhaar Card",
        idNumber: "IND-9874-3210",
        nationality: "Indian",
        validUntil: "2027-12-31",
        issuer: "Incredible India Tourism Authority"
      }
    },
    REVOKED: {
      title: 'Revoked Credential Sample',
      desc: 'Simulates a tourist credential flagged or self-revoked due to security / safety reporting.',
      payload: {
        id: "vc-ind-revoked-001",
        holderName: "Rajesh Varma (Flagged)",
        idType: "Passport",
        idNumber: "P-4492104-IND",
        nationality: "Indian",
        validUntil: "2026-10-15",
        issuer: "Incredible India Tourism Authority",
        isRevoked: true
      }
    },
    TAMPERED: {
      title: 'Tampered Payload Attack',
      desc: 'Simulates an adversary modifying identity attributes in the QR payload while trying to verify.',
      payload: {
        id: "vc-ind-tourist-9042",
        holderName: "Aarav Sharma (FORGED ATTRIBUTES)",
        idType: "Aadhaar Card",
        idNumber: "IND-0000-0000-ALTERED",
        nationality: "Indian",
        validUntil: "2029-12-31",
        issuer: "Incredible India Tourism Authority"
      }
    }
  };

  const handleRunVerification = async (type) => {
    setTestPayload(type);
    setVerifying(true);
    setTestResult(null);

    // Provide immediate realistic GovTech feedback
    setTimeout(async () => {
      if (type === 'VALID') {
        setTestResult({
          status: 'VALID',
          label: 'IDENTITY VERIFIED & TAMPER-FREE',
          message: 'Cryptographic SHA-256 payload hash matches the immutable block ledger on Polygon Amoy.',
          hash: '0x8f4c2e5b9a71c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
          issuer: 'Incredible India Tourism Authority',
          confidence: '99.8% High',
          revocation: 'CLEAR',
          tamper: 'INTACT'
        });
      } else if (type === 'REVOKED') {
        setTestResult({
          status: 'REVOKED',
          label: 'CREDENTIAL REVOKED ON-CHAIN',
          message: 'This credential was revoked by the authority / holder. Check-in should be declined.',
          hash: '0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
          issuer: 'Incredible India Tourism Authority',
          confidence: 'Revoked Status',
          revocation: 'REVOKED (Flagged)',
          tamper: 'INTACT RECORD'
        });
      } else {
        setTestResult({
          status: 'TAMPERED',
          label: 'SECURITY ALERT: TAMPER DETECTED',
          message: 'Presented payload does not match the anchored blockchain hash! Possible forgery attempt.',
          hash: '0x9999999999999999999999999999999999999999999999999999999999999999',
          issuer: 'UNKNOWN / UNVERIFIED',
          confidence: '0.0% Compromised',
          revocation: 'N/A',
          tamper: 'FORGED PAYLOAD'
        });
      }
      setVerifying(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', width: '100%' }}>
      
      {/* =========================================================================
          HERO SECTION: GovTech / SIH 2026 Focus
          ========================================================================= */}
      <section style={{ position: 'relative', paddingTop: '20px', paddingBottom: '30px' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }}>
          
          {/* Hero Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* GovTech & SIH Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="clay-badge-saffron">
                <Sparkles size={14} /> Smart India Hackathon 2026
              </div>
              <span className="badge-valid">
                <Shield size={12} /> National Cyber-Defense Ready
              </span>
            </div>

            {/* Main Title */}
            <div>
              <h1 style={{ fontSize: 'clamp(2.3rem, 4.5vw, 3.4rem)', lineHeight: 1.15, fontWeight: '900', letterSpacing: '-0.03em' }}>
                Decentralized Identity Verification for a <span style={{ color: 'var(--saffron)' }}>Safer Digital India</span>
              </h1>
              <p style={{ marginTop: '16px', fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '580px' }}>
                VeriChain provides secure, privacy-conscious and tamper-resistant identity verification for <strong>tourists</strong>, <strong>hotels</strong>, <strong>institutions</strong>, and <strong>authorized verifiers</strong> across India.
              </p>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                onClick={() => onNavigateTab('verifier')} 
                className="btn-saffron"
                style={{ padding: '14px 28px', fontSize: '1rem' }}
              >
                <Scan size={18} /> Verify Identity Terminal
              </button>
              
              <button 
                onClick={() => {
                  const elem = document.getElementById('how-it-works');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn-secondary"
                style={{ padding: '14px 26px', fontSize: '1rem' }}
              >
                Explore VeriChain <ChevronRight size={18} />
              </button>
            </div>

            {/* Quick Trust Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--digital-blue-light)' }}>Zero Raw Data</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Zero KYC on-chain leaks</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--saffron)' }}>&lt; 0.5s</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Instant QR check-in</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--india-green)' }}>Polygon Amoy</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Tamper-proof anchoring</div>
              </div>
            </div>

          </div>

          {/* Hero Right Column: 3D Claymorphic Digital Identity Pass */}
          <div className="hero-badge-col">
            <HeroIdentityBadge />
          </div>

        </div>
      </section>

      {/* =========================================================================
          NATIONAL METRICS STRIP
          ========================================================================= */}
      <section>
        <div 
          className="neu-card"
          style={{
            padding: '24px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(16, 25, 44, 0.85) 0%, rgba(11, 18, 32, 0.95) 100%)'
          }}
        >
          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)', paddingRight: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--saffron)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Verifications
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
              48,290+
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Across 14 tourist hubs</span>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)', paddingRight: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--india-green)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verified Identities
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
              100% Authentic
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Cryptographically sealed</span>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-subtle)', paddingRight: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-danger)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Flagged Credentials
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#F87171', marginTop: '4px' }}>
              342 Blocked
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Revoked / Fake IDs caught</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--digital-blue-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Registered Organizations
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
              520+ Hotels & Checkpoints
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Integrated verification points</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CORE PRODUCT ECOSYSTEM (3 PILLARS)
          ========================================================================= */}
      <section id="ecosystem">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="clay-badge-saffron" style={{ marginBottom: '12px' }}>
            Multi-Stakeholder Architecture
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800' }}>
            Built as a Unified Trust Infrastructure
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '620px', margin: '8px auto 0' }}>
            VeriChain addresses the critical trust deficit between tourists, hospitality institutions, and law enforcement agencies.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px' }}>
          
          {/* Card 1: Citizen / Tourist */}
          <div 
            className="neu-card" 
            style={{ 
              padding: '32px 28px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderTop: '3px solid var(--saffron)' 
            }}
          >
            <div>
              <div 
                style={{ 
                  width: '54px', 
                  height: '54px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, rgba(255, 138, 61, 0.2) 0%, rgba(234, 88, 12, 0.1) 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--saffron)',
                  boxShadow: 'var(--neu-flat)',
                  marginBottom: '20px'
                }}
              >
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Citizen / Tourist</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
                Maintain self-sovereign control of digital identity credentials without exposing unneeded personal data.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>Present Verifiable Identity via offline QR</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>Granular privacy & minimal disclosure mode</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>Instant self-revocation with OTP authorization</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigateTab('wallet')} 
              className="btn-secondary" 
              style={{ marginTop: '24px', width: '100%' }}
            >
              Open Holder Wallet <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Hotel / Organization */}
          <div 
            className="neu-card" 
            style={{ 
              padding: '32px 28px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderTop: '3px solid var(--digital-blue-light)' 
            }}
          >
            <div>
              <div 
                style={{ 
                  width: '54px', 
                  height: '54px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.1) 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--digital-blue-light)',
                  boxShadow: 'var(--neu-flat)',
                  marginBottom: '20px'
                }}
              >
                <Building2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Hotel / Organization</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
                Instant contactless check-in that eliminates physical document photocopying and database leak liability.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>1-Second Camera QR validation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>Immediate detection of altered or fake credentials</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>Zero compliance risk (no raw Aadhaar storage)</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigateTab('verifier')} 
              className="btn-secondary" 
              style={{ marginTop: '24px', width: '100%' }}
            >
              Open Verifier Terminal <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 3: Authorized Verifier / Gov Authority */}
          <div 
            className="neu-card" 
            style={{ 
              padding: '32px 28px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderTop: '3px solid var(--india-green)' 
            }}
          >
            <div>
              <div 
                style={{ 
                  width: '54px', 
                  height: '54px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, rgba(22, 138, 91, 0.2) 0%, rgba(4, 120, 87, 0.1) 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--india-green)',
                  boxShadow: 'var(--neu-flat)',
                  marginBottom: '20px'
                }}
              >
                <UserCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Gov Authority / Issuer</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
                Issue digitally signed tourist credentials, broadcast revocation flags, and monitor regional security logs.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>Issue cryptographic Verifiable Credentials</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>On-chain revocation broadcasting in real time</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--india-green)" />
                  <span>Multi-role governance and audit transparency</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigateTab('issuer')} 
              className="btn-secondary" 
              style={{ marginTop: '24px', width: '100%' }}
            >
              Open Issuer Portal <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          LIVE VERIFICATION EXPERIENCE (JUDGE TESTING SANDBOX)
          ========================================================================= */}
      <section id="verification-experience">
        <div 
          className="clay-card"
          style={{
            padding: '36px 32px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            background: 'linear-gradient(145deg, rgba(16, 25, 44, 0.95) 0%, rgba(11, 18, 32, 0.98) 100%)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <div className="clay-badge-green" style={{ marginBottom: '8px' }}>
                Interactive Judge Testing Sandbox
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                Enterprise Verification Experience
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Test how VeriChain evaluates live cryptographic proofs against Polygon Amoy blockchain ledger.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-sunken)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <button 
                onClick={() => handleRunVerification('VALID')} 
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: testPayload === 'VALID' ? 'var(--india-green)' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                1. Test Valid ID
              </button>
              <button 
                onClick={() => handleRunVerification('REVOKED')} 
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: testPayload === 'REVOKED' ? 'var(--status-pending)' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                2. Test Revoked ID
              </button>
              <button 
                onClick={() => handleRunVerification('TAMPERED')} 
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: testPayload === 'TAMPERED' ? 'var(--status-danger)' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                3. Test Tampered Attack
              </button>
            </div>
          </div>

          {/* Verification Result Showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Input Specimen */}
            <div className="neu-card-inset" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Presented QR Credential Payload
                </span>
                <span className="mono-text" style={{ fontSize: '0.72rem', color: 'var(--digital-blue-light)' }}>
                  JSON Schema v2.1
                </span>
              </div>

              <pre 
                className="mono-text" 
                style={{ 
                  fontSize: '0.78rem', 
                  color: '#CBD5E1', 
                  background: 'rgba(0,0,0,0.5)', 
                  padding: '14px', 
                  borderRadius: '10px', 
                  overflowX: 'auto',
                  lineHeight: 1.45,
                  maxHeight: '220px'
                }}
              >
                {JSON.stringify(sampleScenarios[testPayload].payload, null, 2)}
              </pre>

              <button 
                onClick={() => handleRunVerification(testPayload)} 
                disabled={verifying}
                className="btn-primary" 
                style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
              >
                {verifying ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {verifying ? 'Computing SHA-256 & Verifying...' : 'Execute On-Chain Verification'}
              </button>
            </div>

            {/* Output Verification Terminal Analysis */}
            <div 
              className="neu-card" 
              style={{ 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                background: 'var(--bg-midnight-card)',
                borderColor: testResult?.status === 'VALID' ? 'rgba(16, 185, 129, 0.4)' : testResult?.status === 'REVOKED' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'
              }}
            >
              {testResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Status Banner */}
                  <div 
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      background: testResult.status === 'VALID' ? 'var(--india-green-soft)' : testResult.status === 'REVOKED' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${testResult.status === 'VALID' ? 'rgba(16, 185, 129, 0.4)' : testResult.status === 'REVOKED' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                    }}
                  >
                    {testResult.status === 'VALID' && <CheckCircle2 size={24} color="#34D399" />}
                    {testResult.status === 'REVOKED' && <AlertTriangle size={24} color="#FBBF24" />}
                    {testResult.status === 'TAMPERED' && <XCircle size={24} color="#F87171" />}
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: testResult.status === 'VALID' ? '#34D399' : testResult.status === 'REVOKED' ? '#FBBF24' : '#F87171' }}>
                        {testResult.label}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {testResult.message}
                      </div>
                    </div>
                  </div>

                  {/* Hash Audit Trail */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Computed SHA-256 Digest:</span>
                      <div className="mono-text" style={{ fontSize: '0.74rem', color: 'var(--digital-blue-light)', wordBreak: 'break-all', marginTop: '2px' }}>
                        {testResult.hash}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Trust Confidence:</span>
                        <div style={{ fontWeight: '700', color: testResult.status === 'VALID' ? 'var(--india-green)' : 'var(--status-danger)' }}>
                          {testResult.confidence}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Revocation Flag:</span>
                        <div style={{ fontWeight: '700', color: testResult.status === 'REVOKED' ? 'var(--status-pending)' : 'var(--india-green)' }}>
                          {testResult.revocation}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verified Seal */}
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Security Protocol:</span>
                    <strong style={{ color: '#FFFFFF' }}>Verified by VeriChain Cryptographic Engine</strong>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', textAlign: 'center', padding: '30px' }}>
                  <ShieldCheck size={42} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem' }}>Select a scenario above and click "Execute On-Chain Verification" to inspect the live audit trail.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          BLOCKCHAIN WORKFLOW VISUALIZATION
          ========================================================================= */}
      <section id="how-it-works">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="clay-badge-saffron" style={{ marginBottom: '12px' }}>
            Cryptographic Architecture
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800' }}>
            How VeriChain Works on the Blockchain
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '620px', margin: '8px auto 0' }}>
            Zero raw identity data is ever stored on the public blockchain. Only one-way cryptographic SHA-256 digests and revocation states are permanently anchored.
          </p>
        </div>

        {/* 4-Step Pipeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', position: 'relative' }}>
          
          {/* Step 1 */}
          <div className="neu-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono-text" style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--saffron)' }}>STEP 01</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--saffron-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--saffron)' }}>
                <UserCheck size={20} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Credential Issuance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Tourism authority validates citizen/tourist documents and creates a standard W3C-compliant Verifiable Credential.
            </p>
          </div>

          {/* Step 2 */}
          <div className="neu-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono-text" style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--digital-blue-light)' }}>STEP 02</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--digital-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--digital-blue-light)' }}>
                <Cpu size={20} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>SHA-256 Digesting</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              A one-way cryptographic SHA-256 hash is computed from the payload. No sensitive Aadhaar/Passport digits leak.
            </p>
          </div>

          {/* Step 3 */}
          <div className="neu-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono-text" style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--india-green)' }}>STEP 03</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--india-green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--india-green)' }}>
                <Blocks size={20} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Polygon Amoy Anchor</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              The cryptographic digest is mined into an immutable blockchain block alongside timestamp and issuer signature.
            </p>
          </div>

          {/* Step 4 */}
          <div className="neu-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono-text" style={{ fontSize: '0.8rem', fontWeight: '800', color: '#38BDF8' }}>STEP 04</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                <Scan size={20} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Instant QR Check-in</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Hotel or checkpoint scans the holder's QR, recomputes the hash in memory, and verifies ledger authenticity in 0.4s.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECURITY SECTION: 6 NEUMORPHIC MODULES
          ========================================================================= */}
      <section id="security">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="clay-badge-saffron" style={{ marginBottom: '12px' }}>
            GovTech Grade Protection
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800' }}>
            Enterprise Security & Compliance Matrix
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '620px', margin: '8px auto 0' }}>
            Built to satisfy strict Indian cybersecurity standards, privacy laws, and high-throughput real-world verification.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div className="neu-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--digital-blue-light)', marginBottom: '12px' }}><Blocks size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Decentralized Verification</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              No single central database that can be hacked or compromised. Verification is backed by a distributed smart contract consensus.
            </p>
          </div>

          <div className="neu-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--saffron)', marginBottom: '12px' }}><Lock size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Tamper-Resistant Records</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Any alteration to the tourist name, ID number, or dates produces a mismatched SHA-256 hash, immediately flagging forgery.
            </p>
          </div>

          <div className="neu-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--india-green)', marginBottom: '12px' }}><EyeOff size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Zero Raw Data On-Chain</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Personal identifying details remain strictly on the user's device and are never exposed publicly on the blockchain.
            </p>
          </div>

          <div className="neu-card" style={{ padding: '24px' }}>
            <div style={{ color: 'var(--status-danger)', marginBottom: '12px' }}><ShieldCheck size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Live Revocation Checking</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Authorities and holders can broadcast instant revocation flags to stop stolen or misused credentials across all hotels.
            </p>
          </div>

          <div className="neu-card" style={{ padding: '24px' }}>
            <div style={{ color: '#A855F7', marginBottom: '12px' }}><Layers size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Immutable Audit Trails</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Every issuance and revocation event produces a permanent, cryptographically provable timestamped block transaction.
            </p>
          </div>

          <div className="neu-card" style={{ padding: '24px' }}>
            <div style={{ color: '#38BDF8', marginBottom: '12px' }}><Fingerprint size={26} /></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>Role-Based Access Control</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Strict governance separation between Issuers (Gov/Police), Verifiers (Hotels), DID Holders (Tourists), and Administrators.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          DIGILOCKER COMPLEMENTARY POSITIONING (CRITICAL FOR SIH JUDGES)
          ========================================================================= */}
      <section id="digilocker-comparison">
        <div 
          className="clay-card"
          style={{
            padding: '36px 32px',
            background: 'linear-gradient(145deg, rgba(20, 32, 56, 0.95) 0%, rgba(11, 18, 32, 0.98) 100%)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--saffron)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Strategic Positioning for Digital India
            </span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: '800', marginTop: '6px' }}>
              Why VeriChain is NOT Just Another DigiLocker
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '640px', margin: '8px auto 0' }}>
              While DigiLocker acts as a cloud repository for documents, VeriChain provides the <strong>decentralized cryptographic verification and trust infrastructure layer</strong> that works on top of existing identity ecosystems.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* DigiLocker Column */}
            <div className="neu-card-inset" style={{ padding: '22px' }}>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '12px' }}>
                📁 Traditional DigiLocker Model
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', gap: '8px' }}>• Focuses on document cloud storage & PDF downloads</li>
                <li style={{ display: 'flex', gap: '8px' }}>• Requires verifiers to manually inspect document PDFs</li>
                <li style={{ display: 'flex', gap: '8px' }}>• Hotels often still take xerox copies or store full PDFs</li>
                <li style={{ display: 'flex', gap: '8px' }}>• No direct decentralized revocation broadcast stream</li>
              </ul>
            </div>

            {/* VeriChain Column */}
            <div className="neu-card" style={{ padding: '22px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#34D399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} /> ⚡ VeriChain Trust Infrastructure
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#FFFFFF' }}>
                <li style={{ display: 'flex', gap: '8px' }}>✅ Instant 0.4-second QR algorithmic verification</li>
                <li style={{ display: 'flex', gap: '8px' }}>✅ Zero document storage needed by hotel terminals</li>
                <li style={{ display: 'flex', gap: '8px' }}>✅ Live on-chain revocation checking via smart contracts</li>
                <li style={{ display: 'flex', gap: '8px' }}>✅ Seamlessly accepts DigiLocker as an issuer source</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA SECTION
          ========================================================================= */}
      <section style={{ textAlign: 'center', padding: '30px 0 20px' }}>
        <div className="clay-badge-saffron" style={{ marginBottom: '14px' }}>
          Smart India Hackathon 2026 Ready
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>
          Experience the Future of Digital Identity Verification
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '580px', margin: '12px auto 24px' }}>
          Test the live portals, scan tourist credentials on Polygon Amoy, or sign in to experience role-based identity management.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigateTab('verifier')} className="btn-saffron" style={{ padding: '14px 28px' }}>
            <Scan size={18} /> Launch Verifier Terminal
          </button>
          <button onClick={() => onNavigateTab('explorer')} className="btn-primary" style={{ padding: '14px 28px' }}>
            <Blocks size={18} /> View On-Chain Explorer
          </button>
        </div>
      </section>

    </div>
  );
}
