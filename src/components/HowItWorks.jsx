import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  QrCode, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Card } from './ui';

export default function HowItWorks() {
  const { navigateTo } = useApp();
  const [activeStepIndex, setActiveStepIndex] = useState(1); // Default to Step 2 (Holder), as in reference mockup

  const steps = [
    {
      stepNumber: 1,
      role: 'Issuer',
      title: 'Authorized organizations issue digital credentials.',
      subtitle: 'Government authorities, universities, and enterprise employers create digitally signed, tamper-proof credentials.',
      icon: Building2,
      color: '#2563EB',
      bgGlow: 'rgba(37, 99, 235, 0.15)',
      details: [
        'Authority generates W3C Verifiable Credential using their institutional cryptographic key.',
        'An immutable cryptographic SHA-256 hash digest is committed to the blockchain registry.',
        'Zero raw personal identifiable information (PII) is exposed on the public ledger.'
      ],
      actionLabel: 'Try Issuing a Credential',
      actionRoute: 'issue'
    },
    {
      stepNumber: 2,
      role: 'Holder',
      title: 'You store your credentials in your digital wallet.',
      subtitle: 'Citizens and users store their credentials securely on their local device under their sovereign ownership.',
      icon: User,
      color: '#1D4ED8',
      bgGlow: 'rgba(29, 78, 216, 0.15)',
      details: [
        'Credentials stay in your encrypted device storage with biometric access protection.',
        'You decide whom to share with and can disclose only necessary attributes.',
        'Access passes, degrees, and identity records are accessible offline.'
      ],
      actionLabel: 'View Digital Wallet',
      actionRoute: 'wallet'
    },
    {
      stepNumber: 3,
      role: 'Verifier',
      title: 'They scan a QR code and verify the authenticity.',
      subtitle: 'Hotels, border checkpoints, or employers verify genuine credentials instantly without contacting the issuer.',
      icon: QrCode,
      color: '#06B6D4',
      bgGlow: 'rgba(6, 182, 212, 0.15)',
      details: [
        'Verifier terminal scans the holder’s presented dynamic QR code.',
        'Mathematical cryptographic proof is evaluated against the anchored on-chain root in sub-seconds.',
        'Immediate confirmation of authenticity and active non-revoked status.'
      ],
      actionLabel: 'Open QR Scanner',
      actionRoute: 'verify'
    }
  ];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
      
      {/* Header matching Reference */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
          How It Works
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          You control your data. We just make it verifiable.
        </p>
      </div>

      {/* 3 Steps Timeline Card matching Reference Mockup */}
      <div 
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--card-shadow-hover)',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStepIndex === idx;

            return (
              <div
                key={s.stepNumber}
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '18px',
                  padding: '20px',
                  borderRadius: 'var(--radius-xl)',
                  background: isSelected ? 'var(--bg-surface-2)' : 'transparent',
                  border: isSelected ? `1.5px solid ${s.color}` : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                  boxShadow: isSelected ? `0 4px 20px ${s.bgGlow}` : 'none'
                }}
              >
                {/* Step Circle Badge */}
                <div 
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isSelected ? s.color : s.bgGlow,
                    color: isSelected ? '#FFFFFF' : s.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isSelected ? `0 4px 14px ${s.color}60` : 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Icon size={24} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {s.stepNumber}. {s.role}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '0.68rem', padding: '1px 8px', borderRadius: 'var(--radius-full)', background: s.bgGlow, color: s.color, fontWeight: '700' }}>
                        Active Step
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {s.title}
                  </h3>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {s.subtitle}
                  </p>

                  {/* Expanded Step Deep Dive */}
                  {isSelected && (
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                        {s.details.map((d, dIdx) => (
                          <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                            <CheckCircle2 size={16} color={s.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo(s.actionRoute);
                        }}
                        icon={ArrowRight}
                        iconPosition="right"
                        style={{ background: s.color }}
                      >
                        {s.actionLabel}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Pagination Dots matching Reference */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '8px' }}>
          {steps.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setActiveStepIndex(dotIdx)}
              style={{
                width: activeStepIndex === dotIdx ? '24px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: activeStepIndex === dotIdx ? 'var(--brand-royal-blue)' : 'var(--border-strong)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              aria-label={`Go to step ${dotIdx + 1}`}
            />
          ))}
        </div>

        {/* Next / Action Button matching Reference */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
          <Button
            variant="dark"
            size="lg"
            onClick={() => {
              if (activeStepIndex < steps.length - 1) {
                setActiveStepIndex(activeStepIndex + 1);
              } else {
                navigateTo('dashboard');
              }
            }}
            style={{
              background: '#071A3D',
              borderRadius: 'var(--radius-full)',
              padding: '12px 36px',
              minWidth: '180px'
            }}
            icon={ArrowRight}
            iconPosition="right"
          >
            {activeStepIndex < steps.length - 1 ? 'Next' : 'Enter Dashboard'}
          </Button>
        </div>
      </div>

      {/* Security Architecture Deep Dive */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="var(--brand-royal-blue)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Cryptographic Trust Architecture
          </h3>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Traditional verification systems rely on centralized phone calls, database queries, and raw ID uploads that risk data breaches. VeriChain utilizes asymmetric cryptography: an Issuer signs with a private key, the Holder stores the cryptographic proof, and any Verifier validates the signature using the Issuer's public DID on the blockchain.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '8px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '4px' }}>W3C DID Specification</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Decentralized Identifiers decouple identity authentication from centralized identity providers.</div>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Sub-Second Verification</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mathematical verification happens on the verifier device without phone calls or API roundtrips.</div>
          </div>

          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Immutable Revocation Roots</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Revocation status is updated cryptographically on Polygon Amoy, immediately detectable worldwide.</div>
          </div>
        </div>
      </Card>

    </div>
  );
}
