import React, { useState, useEffect } from 'react';
import IssuerPortal from './components/IssuerPortal';
import HolderWallet from './components/HolderWallet';
import VerifierPortal from './components/VerifierPortal';
import BlockchainExplorer from './components/BlockchainExplorer';
import AdminPortal from './components/AdminPortal';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { Shield, UserCheck, Wallet, Scan, Blocks, Lock, LogIn, LogOut, User, Menu, X, ShieldAlert } from 'lucide-react';

const ADMIN_EMAIL = 'jyotirmay_das@outlook.com';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('guest'); // 'guest' | 'user' | 'issuer' | 'verifier' | 'admin'
  const [activeTab, setActiveTab] = useState('explorer');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async (user) => {
      if (!user) {
        setUserRole('guest');
        setActiveTab('explorer');
        return;
      }

      const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      if (isAdmin) {
        setUserRole('admin');
        setActiveTab('admin');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || user.user_metadata?.role || 'user';
        setUserRole(role);
        if (role === 'admin') setActiveTab('admin');
        else if (role === 'issuer') setActiveTab('issuer');
        else if (role === 'verifier') setActiveTab('verifier');
        else setActiveTab('wallet');
      } catch (err) {
        const fallbackRole = user.user_metadata?.role || 'user';
        setUserRole(fallbackRole);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user);
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
        <div className="header-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Shield size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>VeriChain</h1>
                <span className="badge-valid header-badge" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>EVM</span>
              </div>
              <p className="header-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DID Verification System</p>
            </div>
          </div>

          {/* Navigation & Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Desktop Navigation Tabs */}
            <nav className="desktop-nav" style={{ display: 'flex', background: 'rgba(18, 24, 38, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '4px' }}>
              {userRole === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}
                  style={{ border: 'none', boxShadow: activeTab === 'admin' ? undefined : 'none', color: 'var(--accent-pink)' }}
                >
                  <ShieldAlert size={18} /> Admin Panel
                </button>
              )}

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="badge-valid user-profile-btn"
                  style={{ textTransform: 'uppercase', fontSize: '0.7rem', cursor: 'pointer', border: '1px solid var(--primary)', background: 'rgba(99, 102, 241, 0.15)', color: '#fff', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                  title="Click to view Account & Security Options"
                >
                  <User size={14} style={{ marginRight: '4px', color: 'var(--primary)' }} />
                  <span className="profile-text">{userRole}</span>
                </button>
                <button onClick={handleSignOut} className="btn-secondary signout-btn" style={{ padding: '6px 10px', fontSize: '0.8rem' }} title="Sign Out">
                  <LogOut size={15} />
                  <span className="signout-text">Sign Out</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
                <LogIn size={15} /> Sign In
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-secondary mobile-menu-btn"
              style={{ padding: '8px 10px' }}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
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
            {userRole === 'admin' && (
              <button onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', justifyContent: 'flex-start' }}>
                <ShieldAlert size={18} /> Admin Panel
              </button>
            )}
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
        {activeTab === 'admin' && userRole === 'admin' && <AdminPortal />}
        {activeTab === 'issuer' && (userRole === 'issuer' || userRole === 'admin') && <IssuerPortal onCredentialIssued={() => {}} />}
        {activeTab === 'wallet' && session && <HolderWallet user={session?.user} />}
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
