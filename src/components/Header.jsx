import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Bell, CheckCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { 
    currentRoute, 
    navigateTo, 
    userProfile, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    isAuthenticated
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPageTitle = () => {
    switch (currentRoute) {
      case 'login': return 'Sign In / Identity';
      case 'landing': return 'Overview';
      case 'how-it-works': return 'How It Works';
      case 'dashboard': return 'Dashboard';
      case 'wallet': return 'Digital Wallet';
      case 'credentials': return 'My Credentials';
      case 'credential-detail': return 'Credential Details';
      case 'issue': return 'Issue Credential';
      case 'verify': return 'QR Verification';
      case 'verification-result': return 'Verification Result';
      case 'explorer': return 'Ledger Explorer';
      case 'admin': return 'Governance Panel';
      case 'profile': return 'Profile';
      case 'settings': return 'Settings';
      case 'activity': return 'Recent Activity';
      default: return 'VeriChain';
    }
  };

  const isSubPage = ['credential-detail', 'verification-result', 'issue', 'verify', 'settings'].includes(currentRoute);

  const handleBack = () => {
    if (currentRoute === 'credential-detail') navigateTo('credentials');
    else if (currentRoute === 'verification-result') navigateTo('verify');
    else if (currentRoute === 'settings') navigateTo('profile');
    else navigateTo('dashboard');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {isSubPage && (
          <button 
            type="button" 
            onClick={handleBack} 
            className="header-back-btn"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 className="header-page-title">{getPageTitle()}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="notification-bell-btn"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge-dot" />}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '320px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--card-shadow-hover)',
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: 'var(--brand-royal-blue)',
                        color: '#FFFFFF',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--brand-royal-blue)',
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCheck size={13} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: n.read ? 'transparent' : 'var(--bg-surface-2)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: n.read ? '600' : '700', color: 'var(--text-primary)' }}>
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-royal-blue)', marginTop: '4px', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                        {n.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Profile Link or Sign In */}
        {isAuthenticated ? (
          <div
            onClick={() => navigateTo('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            title="Go to Profile"
          >
            <img
              src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={userProfile?.name || 'User Profile'}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-full)',
                objectFit: 'cover'
              }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', paddingRight: '4px' }}>
              {userProfile?.name ? userProfile.name.split(' ')[0] : 'Citizen'}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigateTo('login')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--brand-royal-blue)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
