import React, { useState } from 'react';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from './ui';

export default function LoginView() {
  const { loginWithSupabase, registerWithSupabase, navigateTo } = useApp();
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');

  // Handle Form Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (authMode === 'signin') {
        await loginWithSupabase(email, password);
      } else {
        await registerWithSupabase({
          email,
          password,
          fullName: name,
          phone: '',
          role
        });
      }
    } catch (err) {
      setErrorMessage(
        err.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : (err.message || 'Authentication failed. Please verify your details.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '20px auto 40px', padding: '0 12px' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div 
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--grad-brand)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px var(--glow-accent)',
            marginBottom: '16px',
            color: '#FFFFFF'
          }}
        >
          <Shield size={36} strokeWidth={2.2} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {authMode === 'signin' ? 'Welcome Back' : 'Create Sovereign ID'}
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {authMode === 'signin' 
            ? 'Sign in to access your decentralized credentials' 
            : 'Register your decentralized DID identity on VeriChain'}
        </p>
      </div>

      {/* Main Authentication Card */}
      <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Sign In vs Register Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-2)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage('');
            }}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: authMode === 'signin' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: authMode === 'signin' ? '700' : '500',
              fontSize: '0.84rem',
              boxShadow: authMode === 'signin' ? 'var(--card-shadow)' : 'none',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
            }}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: authMode === 'register' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: authMode === 'register' ? '700' : '500',
              fontSize: '0.84rem',
              boxShadow: authMode === 'register' ? 'var(--card-shadow)' : 'none',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            Create Identity
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--brand-danger)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real Supabase Form */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {authMode === 'register' && (
            <Input
              label="Full Sovereign Name"
              placeholder="e.g. Aditi Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={true}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={true}
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Password / Master Passphrase"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="Enter password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={true}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '36px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {authMode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Identity Role
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'user', label: 'Holder / Citizen' },
                  { key: 'issuer', label: 'Issuer Authority' },
                  { key: 'verifier', label: 'Verifier Terminal' }
                ].map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      border: role === r.key ? '1.5px solid var(--brand-royal-blue)' : '1px solid var(--border-default)',
                      background: role === r.key ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-surface-2)',
                      color: role === r.key ? 'var(--brand-royal-blue)' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            type="submit"
            isLoading={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            <span>{authMode === 'signin' ? 'Sign In to VeriChain' : 'Register Identity'}</span>
            <ArrowRight size={18} />
          </Button>
        </form>

      </Card>

      {/* Back to Public Landing */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          type="button"
          onClick={() => navigateTo('landing')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--brand-royal-blue)',
            fontSize: '0.84rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back to VeriChain Home
        </button>
      </div>

    </div>
  );
}
