import React from 'react';
import { Shield, CheckCircle2, QrCode, Cpu, Lock, Fingerprint, Sparkles, Activity } from 'lucide-react';

export default function HeroIdentityBadge() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          right: '15%',
          bottom: '10%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, rgba(255, 138, 61, 0.18) 50%, rgba(22, 138, 91, 0.15) 80%, transparent 100%)',
          filter: 'blur(38px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Main Claymorphic Digital Identity Pass */}
      <div
        className="clay-card animate-float"
        style={{
          padding: '28px',
          borderRadius: '26px',
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.16)',
          background: 'linear-gradient(145deg, rgba(20, 32, 56, 0.92) 0%, rgba(11, 18, 32, 0.98) 100%)'
        }}
      >
        {/* Pass Top Header: GovTech Branding & Live Seal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF8A3D 0%, #2563EB 50%, #168A5B 100%)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#0B1220',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Shield size={22} color="#FF8A3D" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '-0.3px' }}>VeriChain ID</span>
                <span className="badge-valid" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>EVM ANCHOR</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Self-Sovereign Digital Identity</span>
            </div>
          </div>

          {/* Claymorphic 3D Verified Stamp */}
          <div
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)',
              padding: '6px 12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 6px 14px rgba(16, 185, 129, 0.3), inset 0 1.5px 2px rgba(255,255,255,0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <CheckCircle2 size={15} color="#FFFFFF" />
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.4px' }}>VERIFIED</span>
          </div>
        </div>

        {/* Identity Subject & Specimen Data */}
        <div
          className="neu-card-inset"
          style={{
            padding: '16px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--saffron)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.6px', display: 'block' }}>
              Authenticated Citizen / Tourist
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '2px', color: '#FFFFFF' }}>
              Aarav Sharma
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <span className="mono-text" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                DID: did:verichain:ind-84920
              </span>
            </div>
          </div>

          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(255, 138, 61, 0.2) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)'
            }}
          >
            <Fingerprint size={24} color="#60A5FA" />
          </div>
        </div>

        {/* QR Code & Blockchain Verification Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '16px', alignItems: 'center' }}>
          
          {/* Interactive QR Simulation */}
          <div
            style={{
              position: 'relative',
              background: '#FFFFFF',
              padding: '10px',
              borderRadius: '14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 1px 2px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <div className="scan-beam" />
            <QrCode size={90} color="#0B1220" />
          </div>

          {/* Cryptographic Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Zero-Raw Data:</span>
              <span style={{ color: '#34D399', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={12} /> Protected
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trust Score:</span>
              <span style={{ color: 'var(--saffron)', fontWeight: '800' }}>99.8% High</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Network Anchor:</span>
              <span className="mono-text" style={{ color: 'var(--digital-blue-light)' }}>Polygon Amoy</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span className="badge-valid" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Digest Tape */}
        <div
          style={{
            marginTop: '18px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(7, 12, 22, 0.7)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="var(--digital-blue-light)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SHA-256 Digest:</span>
          </div>
          <span className="mono-text" style={{ fontSize: '0.68rem', color: 'var(--digital-blue-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
            0x8f4c2e...b3a971c2
          </span>
        </div>
      </div>

      {/* Floating Auxiliary Widget 1: Instant Check-in Badge */}
      <div
        className="clay-card"
        style={{
          position: 'absolute',
          top: '-18px',
          right: '-14px',
          padding: '10px 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(20, 45, 95, 0.95) 100%)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
          zIndex: 2
        }}
      >
        <Sparkles size={16} color="#FFD166" />
        <div>
          <div style={{ fontSize: '0.68rem', color: '#BFDBFE', fontWeight: '600' }}>Instant Check-in</div>
          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#FFFFFF' }}>0.4s Verification</div>
        </div>
      </div>

      {/* Floating Auxiliary Widget 2: Node Synchronization */}
      <div
        className="clay-card"
        style={{
          position: 'absolute',
          bottom: '-16px',
          left: '-12px',
          padding: '10px 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, rgba(22, 138, 91, 0.95) 0%, rgba(12, 65, 42, 0.95) 100%)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
          zIndex: 2
        }}
      >
        <Activity size={16} color="#A7F3D0" />
        <div>
          <div style={{ fontSize: '0.68rem', color: '#D1FAE5', fontWeight: '600' }}>Blockchain Ledger</div>
          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#FFFFFF' }}>100% Tamper Proof</div>
        </div>
      </div>

    </div>
  );
}
