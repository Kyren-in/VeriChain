import React, { useState, useEffect } from 'react';
import IssuerPortal from './components/IssuerPortal';
import HolderWallet from './components/HolderWallet';
import VerifierPortal from './components/VerifierPortal';
import BlockchainExplorer from './components/BlockchainExplorer';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { Shield, UserCheck, Wallet, Scan, Blocks, Lock, LogIn, LogOut, User, Menu, X } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('guest'); // 'guest' | 'user' | 'issuer' | 'verifier'
  const [activeTab, setActiveTab] = useState('explorer');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'user';
        setUserRole(role);
        // Default tab according to role
        if (role === 'issuer') setActiveTab('issuer');
        else if (role === 'verifier') setActiveTab('verifier');
        else setActiveTab('wallet');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'user';
        setUserRole(role);
        if (role === 'issuer') setActiveTab('issuer');
        else if (role === 'verifier') setActiveTab('verifier');
        else setActiveTab('wallet');
      } else {
        setUserRole('guest');
        setActiveTab('explorer');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserRole('guest');
    setActiveTab('explorer');
  };

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

          {/* Navigation & Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Desktop Navigation Tabs */}
            <nav className="desktop-nav" style={{ display: 'flex', background: 'rgba(18, 24, 38, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '4px' }}>
              {(userRole === 'issuer' || userRole === 'admin') && (
                <button
                  onClick={() => setActiveTab('issuer')}
                  className={activeTab === 'issuer' ? 'btn-primary' : 'btn-secondary'}
                  style={{ border: 'none', boxShadow: activeTab === 'issuer' ? undefined : 'none' }}
                >
                  <UserCheck size={18} /> Issuer Portal
                </button>
              )}

              {(userRole === 'user' || userRole === 'admin') && (
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}
                  style={{ border: 'none', boxShadow: activeTab === 'wallet' ? undefined : 'none' }}
                >
                  <Wallet size={18} /> Holder Wallet
                </button>
              )}

              {(userRole === 'verifier' || userRole === 'admin') && (
                <button
                  onClick={() => setActiveTab('verifier')}
                  className={activeTab === 'verifier' ? 'btn-primary' : 'btn-secondary'}
                  style={{ border: 'none', boxShadow: activeTab === 'verifier' ? undefined : 'none' }}
                >
                  <Scan size={18} /> Verifier Terminal
                </button>
              )}

              {/* On-Chain Explorer visible to all */}
              <button
                onClick={() => setActiveTab('explorer')}
                className={activeTab === 'explorer' ? 'btn-primary' : 'btn-secondary'}
                style={{ border: 'none', boxShadow: activeTab === 'explorer' ? undefined : 'none' }}
              >
                <Blocks size={18} /> On-Chain Explorer
              </button>
            </nav>

            {/* Auth Action Button */}
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge-valid" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  <User size={12} style={{ marginRight: '4px' }} /> {userRole}
                </span>
                <button onClick={handleSignOut} className="btn-secondary" style={{ padding: '8px 14px' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="btn-primary" style={{ padding: '8px 16px' }}>
                <LogIn size={16} /> Sign In
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-secondary mobile-menu-btn"
              style={{ display: 'none', padding: '8px' }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Responsive Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(11, 15, 25, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {(userRole === 'issuer' || userRole === 'admin') && (
              <button onClick={() => { setActiveTab('issuer'); setIsMobileMenuOpen(false); }} className={activeTab === 'issuer' ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'flex-start' }}>
                <UserCheck size={18} /> Issuer Portal
              </button>
            )}
            {(userRole === 'user' || userRole === 'admin') && (
              <button onClick={() => { setActiveTab('wallet'); setIsMobileMenuOpen(false); }} className={activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Wallet size={18} /> Holder Wallet
              </button>
            )}
            {(userRole === 'verifier' || userRole === 'admin') && (
              <button onClick={() => { setActiveTab('verifier'); setIsMobileMenuOpen(false); }} className={activeTab === 'verifier' ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Scan size={18} /> Verifier Terminal
              </button>
            )}
            <button onClick={() => { setActiveTab('explorer'); setIsMobileMenuOpen(false); }} className={activeTab === 'explorer' ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Blocks size={18} /> On-Chain Explorer
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'issuer' && (userRole === 'issuer' || userRole === 'admin') && <IssuerPortal onCredentialIssued={() => {}} />}
        {activeTab === 'wallet' && (userRole === 'user' || userRole === 'admin') && <HolderWallet />}
        {activeTab === 'verifier' && (userRole === 'verifier' || userRole === 'admin') && <VerifierPortal />}
        {activeTab === 'explorer' && <BlockchainExplorer />}
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={(user) => {
        const role = user.user_metadata?.role || 'user';
        setUserRole(role);
      }} />

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
