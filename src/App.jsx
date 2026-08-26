import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import IssuerPortal from './components/IssuerPortal';
import HolderWallet from './components/HolderWallet';
import VerifierPortal from './components/VerifierPortal';
import BlockchainExplorer from './components/BlockchainExplorer';
import AdminPortal from './components/AdminPortal';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabaseClient';
import { 
  Shield, UserCheck, Wallet, Scan, Blocks, Lock, LogIn, LogOut, 
  User, Menu, X, ShieldAlert, Sparkles, Home, ChevronRight 
} from 'lucide-react';

const ADMIN_EMAIL = 'jyotirmay_das@outlook.com';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('guest'); // 'guest' | 'user' | 'issuer' | 'verifier' | 'admin'
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' default for public presentation
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async (user) => {
      if (!user) {
        setUserRole('guest');
        return;
      }

      const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      if (isAdmin) {
        setUserRole('admin');
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserRole('guest');
    setActiveTab('landing');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      
      {/* Top Tricolor Strip */}
      <div className="tricolor-stripe" />

      {/* Floating Neumorphic Navbar */}
      <header
        style={{
          background: 'rgba(11, 18, 32, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div 
          className="header-container" 
          style={{ 
            maxWidth: '1320px', 
            margin: '0 auto', 
            padding: '14px 24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          {/* Logo & SIH Identity Branding */}
          <div 
            onClick={() => setActiveTab('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '13px',
                background: 'linear-gradient(135deg, #FF8A3D 0%, #2563EB 50%, #168A5B 100%)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(0,0,0,0.5)'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#0B1220',
                  borderRadius: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Shield size={22} color="#FF8A3D" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  VeriChain
                </h1>
                <span className="clay-badge-saffron" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                  SIH 2026
                </span>
              </div>
              <p className="header-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Decentralized Trust & DID Infrastructure
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Desktop Navigation */}
            <nav 
              className="desktop-nav" 
              style={{ 
                display: 'flex', 
                background: 'var(--bg-surface-sunken)', 
                padding: '5px', 
                borderRadius: '14px', 
                border: '1px solid var(--border-subtle)', 
                boxShadow: 'var(--neu-pressed)',
                gap: '4px' 
              }}
            >
              <button
                onClick={() => setActiveTab('landing')}
                className={activeTab === 'landing' ? 'btn-saffron' : 'btn-ghost'}
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              >
                <Home size={16} /> Home
              </button>

              <button
                onClick={() => setActiveTab('verifier')}
                className={activeTab === 'verifier' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              >
                <Scan size={16} /> Verifier Terminal
              </button>

              <button
                onClick={() => setActiveTab('explorer')}
                className={activeTab === 'explorer' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              >
                <Blocks size={16} /> Audit Explorer
              </button>

              {(userRole === 'user' || userRole === 'admin') && (
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={activeTab === 'wallet' ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                >
                  <Wallet size={16} /> Holder Wallet
                </button>
              )}

              {(userRole === 'issuer' || userRole === 'admin') && (
                <button
                  onClick={() => setActiveTab('issuer')}
                  className={activeTab === 'issuer' ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                >
                  <UserCheck size={16} /> Issuer Portal
                </button>
              )}

              {userRole === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={activeTab === 'admin' ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '8px 14px', fontSize: '0.84rem', color: '#F87171' }}
                >
                  <ShieldAlert size={16} /> Admin Panel
                </button>
              )}
            </nav>

            {/* Auth Action */}
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="badge-valid user-profile-btn"
                  style={{ 
                    textTransform: 'uppercase', 
                    fontSize: '0.72rem', 
                    cursor: 'pointer', 
                    border: '1px solid var(--digital-blue)', 
                    background: 'rgba(37, 99, 235, 0.15)', 
                    color: '#FFFFFF', 
                    padding: '7px 12px', 
                    borderRadius: '10px' 
                  }}
                  title="View Identity Wallet"
                >
                  <User size={14} style={{ marginRight: '4px', color: 'var(--digital-blue-light)' }} />
                  <span className="profile-text">{userRole}</span>
                </button>

                <button onClick={handleSignOut} className="btn-secondary signout-btn" style={{ padding: '8px 12px', fontSize: '0.82rem' }} title="Sign Out">
                  <LogOut size={15} />
                  <span className="signout-text">Sign Out</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="btn-saffron" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                <LogIn size={15} /> Sign In
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-secondary mobile-menu-btn"
              style={{ padding: '8px 10px' }}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(11, 18, 32, 0.98)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <button 
              onClick={() => { setActiveTab('landing'); setIsMobileMenuOpen(false); }} 
              className={activeTab === 'landing' ? 'btn-saffron' : 'btn-secondary'} 
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Home size={16} /> Home Landing
            </button>
            
            <button 
              onClick={() => { setActiveTab('verifier'); setIsMobileMenuOpen(false); }} 
              className={activeTab === 'verifier' ? 'btn-primary' : 'btn-secondary'} 
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Scan size={16} /> Verifier Terminal
            </button>

            <button 
              onClick={() => { setActiveTab('explorer'); setIsMobileMenuOpen(false); }} 
              className={activeTab === 'explorer' ? 'btn-primary' : 'btn-secondary'} 
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Blocks size={16} /> Audit Explorer
            </button>

            {(userRole === 'user' || userRole === 'admin') && (
              <button 
                onClick={() => { setActiveTab('wallet'); setIsMobileMenuOpen(false); }} 
                className={activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Wallet size={16} /> Holder Wallet
              </button>
            )}

            {(userRole === 'issuer' || userRole === 'admin') && (
              <button 
                onClick={() => { setActiveTab('issuer'); setIsMobileMenuOpen(false); }} 
                className={activeTab === 'issuer' ? 'btn-primary' : 'btn-secondary'} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <UserCheck size={16} /> Issuer Portal
              </button>
            )}

            {userRole === 'admin' && (
              <button 
                onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} 
                className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'} 
                style={{ width: '100%', justifyContent: 'flex-start', color: '#F87171' }}
              >
                <ShieldAlert size={16} /> Admin Panel
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        {activeTab === 'landing' && (
          <LandingPage 
            onNavigateTab={(tab) => setActiveTab(tab)} 
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        )}
        {activeTab === 'verifier' && <VerifierPortal />}
        {activeTab === 'explorer' && <BlockchainExplorer />}
        {activeTab === 'wallet' && session && <HolderWallet user={session?.user} />}
        {activeTab === 'issuer' && (userRole === 'issuer' || userRole === 'admin') && <IssuerPortal onCredentialIssued={() => {}} />}
        {activeTab === 'admin' && userRole === 'admin' && <AdminPortal />}
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(user) => {
          const role = user.user_metadata?.role || 'user';
          setUserRole(role);
          if (role === 'admin') setActiveTab('admin');
          else if (role === 'issuer') setActiveTab('issuer');
          else if (role === 'verifier') setActiveTab('verifier');
          else setActiveTab('wallet');
        }} 
      />

      {/* Enterprise GovTech Footer */}
      <footer 
        style={{ 
          borderTop: '1px solid var(--border-subtle)', 
          background: 'rgba(7, 12, 22, 0.95)', 
          padding: '24px', 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)',
          marginTop: 'auto'
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            Smart India Hackathon 2026 — <strong>VeriChain Decentralized Identity Platform</strong>
            <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Built for a Safer Digital India • Zero Raw PII On-Chain
            </span>
          </div>

          <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#34D399', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Lock size={14} /> W3C DID Standard
            </span>
            <span style={{ color: 'var(--digital-blue-light)' }}>
              Polygon Amoy Anchor
            </span>
            <span style={{ color: 'var(--saffron)' }}>
              GovTech Ready
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
