import React from 'react';
import { Home, Wallet, QrCode, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { currentRoute, navigateTo } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'verify', label: 'Scan', icon: QrCode },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => {
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
