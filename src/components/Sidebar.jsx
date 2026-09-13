import React from 'react';
import { 
  Shield, 
  HelpCircle, 
  LayoutDashboard, 
  Wallet, 
  FileBadge, 
  PlusCircle, 
  QrCode, 
  History, 
  User, 
  Settings,
  Sparkles,
  LogOut,
  LogIn,
  Blocks,
  Crown
} from 'lucide-react';
import { useApp, canAccessRoute, normalizeRole } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const { currentRoute, navigateTo, userProfile, isAuthenticated, logout } = useApp();

  const activeRole = normalizeRole(userProfile?.role);
  const isAdmin = activeRole === 'admin';

  const roleDisplayNames = {
    guest: 'Guest (Visitor)',
    user: 'Citizen (Holder)',
    verifier: 'Hotel Verifier',
    issuer: 'Issuer Authority',
    govt: 'Govt Department',
    admin: 'Platform Admin'
  };

  const navSections = [
    {
      title: 'Public',
      items: [
        { id: 'landing', label: 'Welcome / Landing', icon: Sparkles },
        { id: 'how-it-works', label: 'How It Works', icon: HelpCircle }
      ]
    },
    {
      title: 'Holder Wallet',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
        { id: 'credentials', label: 'My Credentials', icon: FileBadge }
      ]
    },
    {
      title: 'Operations & Ledger',
      items: [
        { id: 'issue', label: 'Issue Credential', icon: PlusCircle },
        { id: 'verify', label: 'QR Verification', icon: QrCode },
        { id: 'explorer', label: 'Audit Explorer', icon: Blocks }
      ]
    },
    {
      title: 'Governance & Account',
      items: [
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Governance', icon: Crown }] : []),
        { id: 'activity', label: 'Activity Log', icon: History },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'login', label: isAuthenticated ? 'Sign Out / Switch' : 'Sign In', icon: isAuthenticated ? LogOut : LogIn }
      ]
    }
  ];

  // Strictly filter out any module the current user is not authorized to access
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessRoute(userProfile?.role, isAuthenticated, item.id))
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div 
          className="brand-logo-wrap" 
          onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')}
        >
          <div className="brand-shield-icon">
            <Shield size={22} />
          </div>
          <div>
            <div className="brand-title">VeriChain</div>
            <span className="brand-badge">SSI Platform</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <div className="nav-group-title">{section.title}</div>
            <ul className="nav-list">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id || 
                  (item.id === 'credentials' && currentRoute === 'credential-detail') ||
                  (item.id === 'verify' && currentRoute === 'verification-result');

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigateTo(item.id)}
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} className="nav-icon" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer with Profile & Theme */}
      <div className="sidebar-footer">
        {/* Compact Theme Selector */}
        <ThemeToggle compact={true} />

        {/* User Card & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            className="sidebar-user-card"
            onClick={() => navigateTo(isAuthenticated ? 'profile' : 'login')}
            style={{ flex: 1 }}
          >
            <img 
              src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
              alt={userProfile?.name || 'User Profile'} 
              className="user-avatar-img"
            />
            <div className="sidebar-user-info">
              <div className="user-info-name">{isAuthenticated ? (userProfile?.name || 'Citizen') : 'Guest User'}</div>
              <div className="user-info-role">
                <Shield size={11} />
                <span>{isAuthenticated ? (roleDisplayNames[activeRole] || 'Citizen') : 'Guest / Sign In'}</span>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Sign Out"
              aria-label="Sign Out"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--brand-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                flexShrink: 0
              }}
            >
              <LogOut size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigateTo('login')}
              title="Sign In"
              aria-label="Sign In"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-royal-blue)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                flexShrink: 0
              }}
            >
              <LogIn size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
