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
  User, Menu, X, ShieldAlert, Sparkles, Home, ChevronRight, Mail, FileText, AlertCircle
} from 'lucide-react';

const ADMIN_EMAIL = 'jyotirmay_das@outlook.com';

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('guest'); // 'guest' | 'user' | 'issuer' | 'verifier' | 'admin'
  const [activeTab, setActiveTab] = useState('landing'); // 'landing' default for public presentation
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accessAlert, setAccessAlert] = useState(null); // stores message if unauthorized attempt occurs

  useEffect(() => {
    const fetchUserRole = async (user) => {
      if (!user) {
        setUserRole('guest');
        return;
      }

      const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      if (isAdmin) {
        setUserRole('admin');
        setActiveTab((prev) => (prev === 'landing' ? 'admin' : prev));
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
        setActiveTab((prev) => {
          if (prev === 'landing') {
            if (role === 'admin') return 'admin';
            if (role === 'issuer') return 'issuer';
            if (role === 'verifier') return 'verifier';
            return 'wallet';
          }
          // If a standard user was on verifier tab, redirect to wallet
          if (role === 'user' && prev === 'verifier') return 'wallet';
          return prev;
        });
      } catch (err) {
        const fallbackRole = user.user_metadata?.role || 'user';
        setUserRole(fallbackRole);
        setActiveTab((prev) => (prev === 'landing' ? (fallbackRole === 'verifier' ? 'verifier' : fallbackRole === 'issuer' ? 'issuer' : 'wallet') : prev));
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
        setActiveTab('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserRole('guest');
    setActiveTab('landing');
  };

  const handleProtectedNavigate = (targetTab) => {
    if (!session) {
      setAccessAlert("Without login or registration you don't have permission to view this portal. Please sign in or create an account to proceed.");
      return;
    }
    // Check specific role restrictions if needed
    if (targetTab === 'admin' && userRole !== 'admin') {
      setAccessAlert("You do not have Administrator permissions to access the Admin Panel.");
      return;
    }
    if (targetTab === 'issuer' && userRole !== 'issuer' && userRole !== 'admin') {
      setAccessAlert("Access restricted. Only authorized Government & Issuer Authorities can access this portal.");
      return;
    }
    if (targetTab === 'verifier' && userRole !== 'verifier' && userRole !== 'issuer' && userRole !== 'admin') {
      setAccessAlert("Access restricted. Only verified Hotel / Checkpoint Terminals can access this module.");
      return;
    }
    setActiveTab(targetTab);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      
      {/* Top Institutional Tricolor & Notice Banner */}
      <div className="tricolor-stripe" />
      <div 
        style={{
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 32, 56, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '6px 24px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#FCD34D', fontWeight: '700' }}>
              Official GovTech Portal
            </span>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>Ministry of Tourism & Cybersecurity Initiative</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34D399', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', display: 'inline-block', boxShadow: '0 0 6px #34D399' }} />
              Polygon Amoy Testnet (Chain ID 80002)
            </span>
            <span style={{ color: 'var(--digital-blue-light)', fontSize: '0.72rem' }}>
              W3C DID v1.0 Standard
            </span>
          </div>
        </div>
      </div>

      {/* Floating Neumorphic Navbar */}
      <header
        style={{
          background: 'rgba(11, 18, 32, 0.92)',
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
            onClick={() => {
              if (!session) setActiveTab('landing');
              else if (userRole === 'admin') setActiveTab('admin');
              else if (userRole === 'issuer') setActiveTab('issuer');
              else if (userRole === 'verifier') setActiveTab('verifier');
              else setActiveTab('wallet');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
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
                <Shield size={24} color="#FF8A3D" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  VeriChain
                </h1>
                <span className="clay-badge-saffron" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                  SIH 2026
                </span>
                <span className="badge-valid" style={{ fontSize: '0.62rem', padding: '2px 8px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--digital-blue-light)', borderColor: 'rgba(37, 99, 235, 0.3)' }}>
                  EVM ANCHOR
                </span>
              </div>
              <p className="header-subtitle" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Decentralized Trust & DID Infrastructure</span>
                <span>•</span>
                <span style={{ color: '#34D399' }}>Zero Raw PII On-Chain</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            
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
              {/* Home button: ONLY visible when logged out (guest) */}
              {!session ? (
                <button
                  onClick={() => setActiveTab('landing')}
                  className={activeTab === 'landing' ? 'btn-saffron' : 'btn-ghost'}
                  style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                >
                  <Home size={16} /> Overview
                </button>
              ) : (
                <>
                  {/* Admin Panel: Admin ONLY */}
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={activeTab === 'admin' ? 'btn-primary' : 'btn-ghost'}
                      style={{ padding: '8px 14px', fontSize: '0.84rem', color: '#F87171' }}
                    >
                      <ShieldAlert size={16} /> Admin Panel
                    </button>
                  )}

                  {/* Issuer Portal: Issuer & Admin have permission */}
                  {(userRole === 'issuer' || userRole === 'admin') && (
                    <button
                      onClick={() => setActiveTab('issuer')}
                      className={activeTab === 'issuer' ? 'btn-primary' : 'btn-ghost'}
                      style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                    >
                      <UserCheck size={16} /> Issuer Portal
                    </button>
                  )}

                  {/* Verifier Terminal: Verifier, Issuer & Admin have permission */}
                  {(userRole === 'verifier' || userRole === 'issuer' || userRole === 'admin') && (
                    <button
                      onClick={() => setActiveTab('verifier')}
                      className={activeTab === 'verifier' ? 'btn-primary' : 'btn-ghost'}
                      style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                    >
                      <Scan size={16} /> Verifier Terminal
                    </button>
                  )}

                  {/* Holder Wallet: User, Issuer & Admin have permission */}
                  {(userRole === 'user' || userRole === 'issuer' || userRole === 'admin') && (
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className={activeTab === 'wallet' ? 'btn-primary' : 'btn-ghost'}
                      style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                    >
                      <Wallet size={16} /> Holder Wallet
                    </button>
                  )}

                  {/* Audit Explorer: Visible to ALL logged-in roles */}
                  <button
                    onClick={() => setActiveTab('explorer')}
                    className={activeTab === 'explorer' ? 'btn-primary' : 'btn-ghost'}
                    style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                  >
                    <Blocks size={16} /> Audit Explorer
                  </button>
                </>
              )}
            </nav>

            {/* Auth Action */}
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (userRole === 'admin') setActiveTab('admin');
                    else if (userRole === 'issuer') setActiveTab('issuer');
                    else if (userRole === 'verifier') setActiveTab('verifier');
                    else setActiveTab('wallet');
                  }}
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
                  title="View Account Role"
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
              <button onClick={() => setIsAuthOpen(true)} className="btn-saffron" style={{ padding: '8px 14px', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                <LogIn size={15} /> Sign In
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            {session && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="btn-secondary mobile-menu-btn"
                style={{ padding: '8px 10px' }}
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {session && isMobileMenuOpen && (
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
            {userRole === 'admin' && (
              <button 
                onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }} 
                className={activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'} 
                style={{ width: '100%', justifyContent: 'flex-start', color: '#F87171' }}
              >
                <ShieldAlert size={16} /> Admin Panel
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

            {(userRole === 'verifier' || userRole === 'issuer' || userRole === 'admin') && (
              <button 
                onClick={() => { setActiveTab('verifier'); setIsMobileMenuOpen(false); }} 
                className={activeTab === 'verifier' ? 'btn-primary' : 'btn-secondary'} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Scan size={16} /> Verifier Terminal
              </button>
            )}

            {(userRole === 'user' || userRole === 'issuer' || userRole === 'admin') && (
              <button 
                onClick={() => { setActiveTab('wallet'); setIsMobileMenuOpen(false); }} 
                className={activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'} 
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Wallet size={16} /> Holder Wallet
              </button>
            )}

            <button 
              onClick={() => { setActiveTab('explorer'); setIsMobileMenuOpen(false); }} 
              className={activeTab === 'explorer' ? 'btn-primary' : 'btn-secondary'} 
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Blocks size={16} /> Audit Explorer
            </button>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, maxWidth: '1320px', width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        {activeTab === 'landing' && (
          <LandingPage 
            onNavigateTab={(tab) => handleProtectedNavigate(tab)} 
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

      {/* Access Permission Alert Dialog */}
      {accessAlert && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="clay-card animate-float-alt" 
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, rgba(24, 34, 58, 0.98) 0%, rgba(13, 20, 36, 0.98) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldAlert size={26} color="#F87171" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
                  Access Permission Required
                </h3>
                <span className="clay-badge-saffron" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                  Authentication Guard
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              {accessAlert}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAccessAlert(null)}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setAccessAlert(null);
                  setIsAuthOpen(true);
                }}
                className="btn-saffron"
                style={{ padding: '10px 22px', fontSize: '0.85rem' }}
              >
                <LogIn size={15} /> Sign In / Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Enterprise GovTech Footer */}
      <footer 
        style={{ 
          borderTop: '1px solid var(--border-subtle)', 
          background: 'linear-gradient(180deg, rgba(11, 18, 32, 0.95) 0%, rgba(7, 12, 22, 0.98) 100%)', 
          padding: '48px 24px 28px', 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)',
          marginTop: 'auto'
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
          
          {/* Top Footer Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
            
            {/* Column 1: Brand & SIH Vision */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF8A3D 0%, #2563EB 50%, #168A5B 100%)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '100%', background: '#0B1220', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={18} color="#FF8A3D" />
                  </div>
                </div>
                <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#FFFFFF' }}>VeriChain</span>
                <span className="clay-badge-saffron" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>SIH 2026</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                Self-Sovereign Decentralized Identity Platform bridging physical travel IDs and zero-knowledge cryptographic verification for a safer Digital India.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', background: 'rgba(255, 138, 61, 0.12)', color: 'var(--saffron)', padding: '3px 8px', borderRadius: '8px', border: '1px solid rgba(255, 138, 61, 0.25)' }}>
                  Incredible India
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(22, 138, 91, 0.12)', color: '#34D399', padding: '3px 8px', borderRadius: '8px', border: '1px solid rgba(22, 138, 91, 0.25)' }}>
                  DPDP Act 2023
                </span>
              </div>
            </div>

            {/* Column 2: Architectural Protocols */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Protocol & Standards
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} color="#34D399" /> W3C Decentralized Identifiers (DIDs)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Blocks size={14} color="var(--digital-blue-light)" /> Polygon Amoy EVM Anchor (Chain ID 80002)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="var(--saffron)" /> Deterministic SHA-256 Commitments
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} color="#38BDF8" /> Zero Raw PII on Public Ledgers
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Modules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Platform Modules
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <li style={{ cursor: 'pointer' }} onClick={() => handleProtectedNavigate('wallet')}>📱 Citizen Digital Identity Wallet</li>
                <li style={{ cursor: 'pointer' }} onClick={() => handleProtectedNavigate('verifier')}>🏨 Hotel & Checkpoint Verifier Terminal</li>
                <li style={{ cursor: 'pointer' }} onClick={() => handleProtectedNavigate('issuer')}>🏛️ Authority Verifiable Credential Issuer</li>
                <li style={{ cursor: 'pointer' }} onClick={() => handleProtectedNavigate('explorer')}>⛓️ Public Audit Ledger & Block Explorer</li>
              </ul>
            </div>

            {/* Column 4: Team Larpthon & Support Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Competition Team
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Hackathon Team: <br />
                <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>Team Larpthon</strong>
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Smart India Hackathon (SIH) 2026 — Track: Blockchain / Digital Identity / Cybersecurity
              </p>

              {/* Support & Feedback Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <a 
                  href="mailto:verichain.support@gmail.com" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    color: 'var(--digital-blue-light)', 
                    fontSize: '0.8rem', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  title="Contact Support"
                >
                  <Mail size={14} color="#60A5FA" />
                  <span>verichain.support@gmail.com</span>
                </a>

                <a 
                  href="https://forms.gle/VVRNp3ZYeNV6nrbs5" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    color: '#FCD34D', 
                    fontSize: '0.8rem', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  title="Submit Feedback"
                >
                  <FileText size={14} color="#FCD34D" />
                  <span>Support & Feedback Form</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Security Strip */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              © 2026 Team Larpthon. All Rights Reserved. Built for Smart India Hackathon 2026.
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ color: '#34D399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={13} /> DPDP Act 2023 Compliant
              </span>
              <span style={{ color: 'var(--digital-blue-light)' }}>
                Sub-100ms Verifications
              </span>
              <span style={{ color: 'var(--saffron)' }}>
                GovTech India Ready
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
