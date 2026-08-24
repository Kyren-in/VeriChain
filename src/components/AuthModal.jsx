import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, Mail, Lock, User, UserCheck, X } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: input details, 2: enter OTP
  const [otpInput, setOtpInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user'); // 'user' default
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
        if (step === 1) {
          // Send Brevo OTP code to user's email
          const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, fullName, password })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to send OTP email.');
          }

          setStep(2);
          setMessage('An OTP code has been sent to your email! Please enter it below to verify.');
        } else if (step === 2) {
          // Verify OTP entered by user
          const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpInput })
          });
          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Invalid OTP code.');
          }

          // OTP verified -> create account in Supabase
          // Since Brevo OTP is already verified above, bypass Supabase confirmation email rate limiter
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: null,
              data: {
                full_name: fullName,
                role: 'user'
              }
            }
          });

          if (error) throw error;

          // Insert into Supabase 'profiles' table so user shows up in database queries
          if (data.user) {
            const { error: profileErr } = await supabase.from('profiles').upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              role: 'user',
              updated_at: new Date().toISOString()
            });
            if (profileErr) console.error('Profile upsert error:', profileErr);
          }

          setMessage('Account verified and created successfully!');
          setTimeout(() => {
            onAuthSuccess(data.user);
            onClose();
            setStep(1);
            setOtpInput('');
          }, 1500);
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Sync profile on login if missing
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || '',
            role: data.user.user_metadata?.role || 'user',
            updated_at: new Date().toISOString()
          }).catch(() => {});
        }

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
          {isRegister && step === 2 ? (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Enter 6-Digit Email OTP</label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--primary)',
                    color: '#fff',
                    letterSpacing: '4px',
                    fontSize: '1.1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '8px' }}
              >
                ← Back to Edit Email
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px', justifyContent: 'center' }}
          >
            {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isRegister ? (step === 2 ? 'Verify OTP & Create Account' : 'Send Verification OTP') : 'Sign In'}
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
