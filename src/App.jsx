import React, { useState } from 'react';
import IssuerPortal from './components/IssuerPortal';
import HolderWallet from './components/HolderWallet';
import VerifierPortal from './components/VerifierPortal';
import BlockchainExplorer from './components/BlockchainExplorer';
import { Shield, UserCheck, Wallet, Scan, Blocks, Sparkles, Lock, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('issuer');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Shield size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', tracking: '-0.5px' }}>VeriChain</h1>
                <span className="badge-valid" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>EVM TESTNET</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Decentralized Identity (DID) Verification System</p>
            </div>
          </div>

          {/* Role Navigation Tabs */}
          <nav style={{ display: 'flex', background: 'rgba(18, 24, 38, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('issuer')}
              className={activeTab === 'issuer' ? 'btn-primary' : 'btn-secondary'}
              style={{ border: 'none', boxShadow: activeTab === 'issuer' ? undefined : 'none' }}
            >
              <UserCheck size={18} /> Issuer Portal
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}
              style={{ border: 'none', boxShadow: activeTab === 'wallet' ? undefined : 'none' }}
            >
              <Wallet size={18} /> Holder Wallet
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className={activeTab === 'verifier' ? 'btn-primary' : 'btn-secondary'}
              style={{ border: 'none', boxShadow: activeTab === 'verifier' ? undefined : 'none' }}
            >
              <Scan size={18} /> Verifier Terminal
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={activeTab === 'explorer' ? 'btn-primary' : 'btn-secondary'}
              style={{ border: 'none', boxShadow: activeTab === 'explorer' ? undefined : 'none' }}
            >
              <Blocks size={18} /> On-Chain Explorer
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'issuer' && <IssuerPortal onCredentialIssued={() => {}} />}
        {activeTab === 'wallet' && <HolderWallet />}
        {activeTab === 'verifier' && <VerifierPortal />}
        {activeTab === 'explorer' && <BlockchainExplorer />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(11, 15, 25, 0.9)', padding: '20px 24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            Smart India Hackathon 2026 — <strong>VeriChain Tourist DID System</strong>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={14} /> Zero Raw Data On-Chain
            </span>
            <span style={{ color: 'var(--accent-cyan)' }}>Polygon Amoy Anchor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
