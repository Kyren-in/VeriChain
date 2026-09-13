import React from 'react';
import { Home, Wallet, QrCode, User, HelpCircle, LogIn } from 'lucide-react';
import { useApp, canAccessRoute } from '../context/AppContext';

export default function MobileNav() {
  const { currentRoute, navigateTo, userProfile, isAuthenticated } = useApp();

  const allNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'verify', label: 'Scan', icon: QrCode },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'how-it-works', label: 'Guide', icon: HelpCircle },
    { id: 'login', label: 'Sign In', icon: LogIn }
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (item.id === 'login') return !isAuthenticated;
    return canAccessRoute(userProfile?.role, isAuthenticated, item.id);
  });

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = 
          currentRoute === item.id ||
          (item.id === 'dashboard' && currentRoute === 'landing') ||
          (item.id === 'wallet' && ['credentials', 'credential-detail'].includes(currentRoute)) ||
          (item.id === 'verify' && currentRoute === 'verification-result') ||
          (item.id === 'profile' && ['settings', 'activity'].includes(currentRoute));

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigateTo(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <div className="mobile-icon-wrap">
              <Icon size={20} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
