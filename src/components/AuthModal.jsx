import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { API_BASE_URL } from '../api';
import { Shield, Mail, Lock, User, UserCheck, X, Phone, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otpInput, setOtpInput] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        await fetch(`${API_BASE_URL}/api/auth/send-reset-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }).catch(() => {});

        if (error) throw error;
        setMessage('Password reset link sent to your email address!');
      } else if (isRegister) {
        if (step === 1) {
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
          const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpInput })
          });
          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Invalid OTP code.');
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: null,
              data: {
                full_name: fullName,
                phone: phone,
                role: 'user'
              }
            }
          });

          if (error) throw error;

          if (data.user) {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              phone: phone,
              role: 'user',
              updated_at: new Date().toISOString()
            });
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (error) {
          // Safe, generic error message (Prevents user enumeration)
          throw new Error('Incorrect email or password.');
        }

        if (data.user) {
          try {
            // Check if profile already exists in Supabase 'profiles' table
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', data.user.id)
              .maybeSingle();

            if (!existingProfile) {
              // Only insert default 'user' role if the profile is brand new
              await supabase.from('profiles').insert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || '',
                role: 'user',
                updated_at: new Date().toISOString()
              });
            } else {
              // Profile already exists: update email/full_name timestamp ONLY, NEVER touch or overwrite role
              await supabase.from('profiles').update({
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || '',
                updated_at: new Date().toISOString()
              }).eq('id', data.user.id);
            }
          } catch (e) {
            console.error('Profile sync warning:', e);
          }
        }

        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      // Always show sanitized generic message on auth failures
      setMessage(err.message === 'Incorrect email or password.' ? err.message : (err.message || 'Authentication failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="clay-card"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '34px',
          borderRadius: '26px',
          position: 'relative',
          background: 'var(--bg-midnight-card)'
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #FF8A3D 0%, #2563EB 100%)',
              padding: '12px',
              borderRadius: '16px',
              color: '#FFFFFF',
              boxShadow: 'var(--clay-pill)'
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
              {isForgotPassword ? 'Reset Password' : isRegister ? 'Create VeriChain Account' : 'Sign In to VeriChain'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {isForgotPassword
                ? 'Enter your email for a secure password reset link'
                : isRegister
                ? 'Register with role authorization'
                : 'Access your decentralized identity portal'}
            </p>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: message.includes('error') ? 'rgba(239, 68, 68, 0.15)' : 'var(--india-green-soft)',
              color: message.includes('error') ? '#F87171' : '#34D399',
              fontSize: '0.85rem',
              marginBottom: '18px',
              border: `1px solid ${message.includes('error') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && step === 2 ? (
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Enter 6-Digit Email OTP</label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--digital-blue-light)' }} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="input-field"
                  style={{
                    paddingLeft: '44px',
                    letterSpacing: '4px',
                    fontSize: '1.15rem',
                    textAlign: 'center'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', marginTop: '8px' }}
              >
                ← Back to Edit Email
              </button>
            </div>
          ) : (
            <>
              {isRegister && (
                <>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: showPassword ? 'var(--saffron)' : 'var(--text-dim)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: '6px'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-saffron"
            style={{ width: '100%', marginTop: '6px', padding: '13px', justifyContent: 'center' }}
          >
            {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isRegister ? (step === 2 ? 'Verify OTP & Create Account' : 'Send Verification OTP') : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              style={{ background: 'none', border: 'none', color: 'var(--digital-blue-light)', cursor: 'pointer', fontWeight: '600' }}
            >
              Back to Sign In
            </button>
          ) : isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: 'var(--saffron)', cursor: 'pointer', fontWeight: '700' }}
              >
                Sign In
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setIsForgotPassword(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                Forgot Password?
              </button>
              <div>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--saffron)', cursor: 'pointer', fontWeight: '700' }}
                >
                  Register Here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
