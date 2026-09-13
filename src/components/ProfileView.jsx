import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Key, 
  Link2, 
  Bell, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  Edit3, 
  Copy, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { Button, Modal, Input, Toggle } from './ui';

export default function ProfileView() {
  const { userProfile, setUserProfile, user, showToast, navigateTo, logout } = useApp();

  const [activeSectionModal, setActiveSectionModal] = useState(null); // 'personal' | 'security' | 'linked' | 'about' | null
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    passportNumber: userProfile?.passportNumber || ''
  });

  // Security preferences
  const [securitySettings, setSecuritySettings] = useState({
    biometrics: true,
    zkProofs: true,
    autoLock: true,
    anonymousAnalytics: false
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUserProfile((prev) => ({ ...prev, ...formData }));

    if (user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: formData.name,
            phone: formData.phone,
            passport_number: formData.passportNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('[Profile Save DB Notice]:', err);
      }
    }

    setActiveSectionModal(null);
    showToast('Personal information updated successfully', 'success');
  };

  const copyDid = () => {
    if (userProfile?.did) {
      navigator.clipboard.writeText(userProfile.did);
      showToast('Copied DID identifier to clipboard', 'info');
    }
  };

  const menuItems = [
    {
      id: 'personal',
      label: 'Personal Information',
      subtitle: 'Name, email, phone, and travel ID details',
      icon: User,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.12)'
    },
    {
      id: 'security',
      label: 'Security & Privacy',
      subtitle: 'Biometric authorization & cryptographic proof settings',
      icon: Shield,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.12)'
    },
    {
      id: 'linked',
      label: 'Linked Accounts',
      subtitle: 'Decentralized Identifiers (DIDs) & Web3 Wallets',
      icon: Link2,
      color: '#06B6D4',
      bg: 'rgba(6, 182, 212, 0.12)'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      subtitle: 'Alerts on issuance, verifications, and status changes',
      icon: Bell,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      onClick: () => navigateTo('activity')
    },
    {
      id: 'settings',
      label: 'Settings',
      subtitle: 'Theme, appearance, and platform preferences',
      icon: Key,
      color: '#64748B',
      bg: 'rgba(100, 116, 139, 0.12)',
      onClick: () => navigateTo('settings')
    },
    {
      id: 'help',
      label: 'Help & Support',
      subtitle: 'Verification FAQs, troubleshooting, and documentation',
      icon: HelpCircle,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      onClick: () => navigateTo('how-it-works')
    },
    {
      id: 'about',
      label: 'About VeriChain',
      subtitle: 'Version 2.4.0 • W3C DID Standard & Polygon Amoy',
      icon: Info,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.12)'
    }
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Header matching Reference Screen 11 */}
      <div
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--card-shadow)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px'
        }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={userProfile?.name || 'User'}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--brand-royal-blue)',
              boxShadow: '0 8px 24px var(--glow-accent)'
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (userProfile) setFormData({ name: userProfile.name, phone: userProfile.phone, passportNumber: userProfile.passportNumber });
              setActiveSectionModal('personal');
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--brand-royal-blue)',
              color: '#FFFFFF',
              border: '2px solid var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Edit Profile"
          >
            <Edit3 size={13} />
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            {userProfile?.name || 'Authorized Citizen'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {userProfile?.email || 'Authenticated User'}
          </p>
        </div>

        {/* DID Badge */}
        {userProfile?.did && (
          <div
            onClick={copyDid}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-3)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--brand-royal-blue)',
              cursor: 'pointer'
            }}
            title="Click to copy DID"
          >
            <ShieldCheck size={14} />
            <span className="mono-text">{userProfile?.did ? `${userProfile.did.substring(0, 24)}...` : 'did:verichain:anonymous'}</span>
            <Copy size={12} color="var(--text-muted)" />
          </div>
        )}
      </div>

      {/* Menu Navigation List matching Reference */}
      <div 
        style={{ 
          borderRadius: 'var(--radius-xl)', 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          boxShadow: 'var(--card-shadow)',
          overflow: 'hidden' 
        }}
      >
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === menuItems.length - 1;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.onClick) item.onClick();
                else setActiveSectionModal(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              className="profile-menu-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {item.label}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          );
        })}
      </div>

      {/* Promo Banner matching bottom of Reference Screen 11 */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #071A3D 0%, #0B2A66 100%)',
          color: '#FFFFFF',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', lineHeight: 1.3 }}>
            Your data. <br />
            Your identity. <br />
            Always yours.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.85 }}>
          <Shield size={28} color="#60A5FA" />
          <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.02em' }}>VeriChain</span>
        </div>
      </div>

      {/* Sign Out Card */}
      <div
        onClick={logout}
        style={{
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: 'var(--card-shadow)',
          transition: 'var(--transition-fast)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-danger)'
            }}
          >
            <LogOut size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--brand-danger)' }}>
              Sign Out & Lock Wallet
            </h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Safely end your session and lock sovereign cryptographic keys
            </p>
          </div>
        </div>

        <Button 
          variant="danger" 
          size="sm" 
          onClick={(e) => { 
            e.stopPropagation(); 
            logout(); 
          }}
        >
          Sign Out
        </Button>
      </div>

      {/* MODAL 1: Personal Information */}
      <Modal
        isOpen={activeSectionModal === 'personal'}
        onClose={() => setActiveSectionModal(null)}
        title="Personal Information"
        subtitle="Update your self-sovereign profile attributes"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required={true}
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required={true}
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Passport Number"
            value={formData.passportNumber}
            onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setActiveSectionModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Security & Privacy */}
      <Modal
        isOpen={activeSectionModal === 'security'}
        onClose={() => setActiveSectionModal(null)}
        title="Security & Privacy"
        subtitle="Manage cryptographic identity security preferences"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Toggle
            label="Biometric Passkey Authentication"
            description="Require Face ID / Touch ID when presenting credentials"
            checked={securitySettings.biometrics}
            onChange={(val) => setSecuritySettings({ ...securitySettings, biometrics: val })}
          />
          <Toggle
            label="Zero-Knowledge Range Proofs"
            description="Disclose age / validity without revealing raw birthdate or ID number"
            checked={securitySettings.zkProofs}
            onChange={(val) => setSecuritySettings({ ...securitySettings, zkProofs: val })}
          />
          <Toggle
            label="Auto-Lock Wallet"
            description="Automatically lock credentials after 5 minutes of inactivity"
            checked={securitySettings.autoLock}
            onChange={(val) => setSecuritySettings({ ...securitySettings, autoLock: val })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button 
              variant="primary" 
              onClick={() => {
                setActiveSectionModal(null);
                showToast('Security preferences updated', 'success');
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Linked Accounts */}
      <Modal
        isOpen={activeSectionModal === 'linked'}
        onClose={() => setActiveSectionModal(null)}
        title="Linked Accounts & DIDs"
        subtitle="Connected decentralized identities"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>Primary Sovereign DID</span>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700' }}>Active</span>
            </div>
            <div className="mono-text" style={{ fontSize: '0.76rem', color: 'var(--brand-royal-blue)', wordBreak: 'break-all' }}>
              {userProfile?.did || 'did:verichain:not-generated'}
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>Polygon Amoy Anchor Account</span>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700' }}>Chain 80002</span>
            </div>
            <div className="mono-text" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              0x71C5A87B420C21B273A8D3E4FD08B3420E418A92
            </div>
          </div>

          <Button variant="secondary" fullWidth={true} onClick={() => setActiveSectionModal(null)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* MODAL 4: About VeriChain */}
      <Modal
        isOpen={activeSectionModal === 'about'}
        onClose={() => setActiveSectionModal(null)}
        title="About VeriChain"
        subtitle="Self-Sovereign Digital Identity Architecture"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p>
            <strong>VeriChain</strong> is a privacy-first digital identity platform conforming to the W3C Verifiable Credentials Data Model v2.0 and Decentralized Identifiers (DIDs) v1.0 specifications.
          </p>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', fontSize: '0.8rem' }}>
            <div><strong>Version:</strong> 2.4.0-production</div>
            <div><strong>Anchor Ledger:</strong> Polygon Amoy Testnet (EVM)</div>
            <div><strong>Cryptographic Hash:</strong> SHA-256 with asymmetric ECDSA signatures</div>
            <div><strong>Zero-Knowledge:</strong> Selective disclosure enabled</div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Engineered for high-security identity management across government, travel, education, and healthcare sectors.
          </p>
          <Button variant="primary" onClick={() => setActiveSectionModal(null)}>
            Close
          </Button>
        </div>
      </Modal>

    </div>
  );
}
