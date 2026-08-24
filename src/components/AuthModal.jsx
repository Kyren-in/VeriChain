import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, Mail, Lock, User, UserCheck, X } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'issuer' | 'verifier'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isForgotPassword) {
        // Brevo / Supabase Password Reset Request
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        // Trigger Brevo API backend fallback notification
        await fetch(`${API_BASE_URL}/api/auth/send-reset-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }).catch(() => {});

        if (error) throw error;
        setMessage('Password reset link sent to your email address!');
      } else if (isRegister) {
        // Sign Up with Supabase & user metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role
            }
          }
        });

        if (error) throw error;

        // Send Brevo welcome & email verification trigger
        await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fullName, role })
        }).catch(() => {});

        setMessage('Account created! Please check your email to verify your account.');
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 2000);
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setMessage(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '32px',
          borderRadius: '24px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              padding: '10px',
              borderRadius: '12px',
              color: '#fff'
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              {isForgotPassword ? 'Reset Password' : isRegister ? 'Create VeriChain Account' : 'Sign In to VeriChain'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isForgotPassword
                ? 'Enter your email for a Brevo reset link'
                : isRegister
                ? 'Register with role authorization'
                : 'Select your account credentials'}
            </p>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: message.includes('error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: message.includes('error') ? 'var(--accent-pink)' : 'var(--accent-emerald)',
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {isRegister && (
            <div style={{ padding: '8px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Registration defaults to Standard Identity Holder role. Advanced roles (Issuer / Verifier) can be granted by the System Administrator after detail verification.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px', justifyContent: 'center' }}
          >
            {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              Back to Sign In
            </button>
          ) : isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
              >
                Sign In
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setIsForgotPassword(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Forgot Password?
              </button>
              <div>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
