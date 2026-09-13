import React from 'react';
import { 
  Sun, 
  Moon, 
  Laptop, 
  RefreshCw, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Card, Toggle } from './ui';

export default function SettingsView() {
  const { navigateTo, showToast } = useApp();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { key: 'dark', label: 'Dark Theme', desc: 'Deep navy background (#050B1C, #0B1530)', icon: Moon },
    { key: 'light', label: 'Light Theme', desc: 'Clean high-contrast background (#F7F8FC, #FFFFFF)', icon: Sun },
    { key: 'system', label: 'System Theme', desc: 'Matches your OS appearance preference', icon: Laptop }
  ];

  const handleResetPreferences = () => {
    try {
      localStorage.removeItem('verichain_theme');
      showToast('Application preferences reset to default', 'info');
      setTheme('dark');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            Settings & Appearance
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Customize your VeriChain wallet experience
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => navigateTo('profile')}>
          <ArrowLeft size={16} />
          <span>Profile</span>
        </Button>
      </div>

      {/* Theme Selection Cards */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Interface Theme
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>
          Select your preferred visual mode. Changes take effect immediately.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.key;

            return (
              <div
                key={opt.key}
                onClick={() => {
                  setTheme(opt.key);
                  showToast(`Theme changed to ${opt.label}`, 'info');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  background: isSelected ? 'var(--bg-surface-2)' : 'transparent',
                  border: isSelected ? '2px solid var(--brand-royal-blue)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: isSelected ? 'var(--brand-royal-blue)' : 'var(--bg-surface-3)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {opt.desc}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div 
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--brand-royal-blue)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Security Preferences */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Security & Verification Defaults
        </h3>

        <Toggle
          label="Auto-validate On-Chain Commitments"
          description="Check cryptographic integrity against Polygon Amoy testnet on startup"
          checked={true}
          onChange={() => showToast('Blockchain auto-validation enabled', 'info')}
        />

        <Toggle
          label="Strict Revocation List Cache"
          description="Refetch revocation roots immediately upon every verification attempt"
          checked={true}
          onChange={() => showToast('Revocation list setting updated', 'info')}
        />
      </Card>

      {/* Reset State Card */}
      <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Reset Application Preferences
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Restore theme and local appearance settings to default values.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={handleResetPreferences}
        >
          Reset
        </Button>
      </Card>

    </div>
  );
}
