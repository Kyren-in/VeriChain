import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plane, 
  GraduationCap, 
  HeartPulse, 
  Shield, 
  Plus, 
  QrCode, 
  ChevronRight, 
  ExternalLink,
  Wallet 
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { Badge, Button, Modal, EmptyState } from './ui';

export default function DigitalWallet() {
  const { credentials, navigateTo, setSelectedCredentialId } = useApp();
  const [selectedCredId, setSelectedCredId] = useState(null);
  const [qrModalCred, setQrModalCred] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const featured = 
    (selectedCredId && credentials.find((c) => c.id === selectedCredId)) ||
    credentials.find((c) => c.title && c.title.includes('Tourism')) ||
    credentials[0] ||
    null;

  // Generate QR code whenever qrModalCred opens
  useEffect(() => {
    if (!qrModalCred) return;
    let isMounted = true;
    QRCode.toDataURL(qrModalCred.qrPayload || `VERICHAIN:${qrModalCred.id}`, {
      width: 260,
      margin: 2,
      color: {
        dark: '#071A3D',
        light: '#FFFFFF'
      }
    }).then((url) => {
      if (isMounted) setQrCodeDataUrl(url);
    }).catch((err) => {
      console.error('Error generating QR', err);
    });
    return () => { isMounted = false; };
  }, [qrModalCred]);

  const getCredentialIcon = (iconType, isRevoked) => {
    const color = isRevoked ? 'var(--brand-danger)' : 'var(--brand-royal-blue)';
    switch (iconType) {
      case 'academic': return <GraduationCap size={20} color={color} />;
      case 'passport': return <Plane size={20} color={color} />;
      case 'building': return <Building2 size={20} color={color} />;
      case 'health': return <HeartPulse size={20} color={color} />;
      default: return <Shield size={20} color={color} />;
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top action header matching Reference */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            Digital Wallet
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Decentralized sovereign credential store
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigateTo('issue')}
          icon={Plus}
          style={{
            borderRadius: 'var(--radius-full)',
            padding: '8px 18px'
          }}
        >
          Add
        </Button>
      </div>

      {/* Featured Active Card at Top matching Reference Screen 8 */}
      {featured && (
        <div>
          <div style={{ fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Active Presented Credential
          </div>

          <div
            style={{
              borderRadius: 'var(--radius-2xl)',
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
              border: featured.status === 'Revoked' ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid rgba(37, 99, 235, 0.4)',
              boxShadow: 'var(--card-shadow-hover)',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: featured.status === 'Revoked' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getCredentialIcon(featured.iconType, featured.status === 'Revoked')}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {featured.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {featured.issuer}
                  </p>
                </div>
              </div>

              {/* Status Badge with Click to View details */}
              <div 
                onClick={() => {
                  setSelectedCredentialId(featured.id);
                  navigateTo('credential-detail', { credentialId: featured.id });
                }}
                style={{ cursor: 'pointer' }}
                title="View Credential Details"
              >
                <Badge status={featured.status}>
                  <span>{featured.status}</span>
                  <ChevronRight size={12} />
                </Badge>
              </div>
            </div>

            {/* Credential Data Strip */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '20px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Holder</span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>{featured.holderName}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Identifier</span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>{featured.identifierNumber}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Valid Till</span>
                <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>{featured.expiryDate}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                icon={QrCode}
                onClick={() => setQrModalCred(featured)}
                style={{ flex: 1, minWidth: '150px' }}
              >
                Present QR Code
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                onClick={() => {
                  setSelectedCredentialId(featured.id);
                  navigateTo('credential-detail', { credentialId: featured.id });
                }}
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Stack List matching Reference */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            All Stored Credentials ({credentials.length})
          </h4>
          <span 
            onClick={() => navigateTo('credentials')}
            style={{ fontSize: '0.82rem', color: 'var(--brand-royal-blue)', fontWeight: '600', cursor: 'pointer' }}
          >
            Filter & Search
          </span>
        </div>

        {credentials.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No credentials stored"
            description="Your digital wallet is currently empty. Issue a verifiable credential to anchor your first identity token to the ledger."
            actionText="Issue Credential"
            onAction={() => navigateTo('issue')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {credentials.map((cred) => {
              const isRevoked = cred.status === 'Revoked';
              const isFeatured = featured?.id === cred.id;

              return (
                <div
                  key={cred.id}
                  onClick={() => setSelectedCredId(cred.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-xl)',
                    background: isFeatured ? 'var(--bg-surface-2)' : 'var(--bg-surface)',
                    border: isFeatured 
                      ? '1.5px solid var(--brand-royal-blue)' 
                      : isRevoked 
                        ? '1px solid rgba(239, 68, 68, 0.25)' 
                        : '1px solid var(--border-subtle)',
                    boxShadow: 'var(--card-shadow)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: isRevoked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getCredentialIcon(cred.iconType, isRevoked)}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {cred.title}
                      </h4>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {cred.issuer}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge status={cred.status}>{cred.status}</Badge>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQrModalCred(cred);
                      }}
                      title="View QR"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-3)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <QrCode size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Presentation Modal */}
      <Modal
        isOpen={Boolean(qrModalCred)}
        onClose={() => setQrModalCred(null)}
        title={qrModalCred?.title}
        subtitle="Present this QR code to the verifier"
        maxWidth="420px"
      >
        {qrModalCred && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <div 
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-xl)',
                background: '#FFFFFF',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Credential QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Generating QR...
                </div>
              )}
            </div>

            <div style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Status:</span>
                <Badge status={qrModalCred.status}>{qrModalCred.status}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Holder:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{qrModalCred.holderName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Identifier:</span>
                <span className="mono-text" style={{ color: 'var(--brand-royal-blue)' }}>{qrModalCred.identifierNumber}</span>
              </div>
            </div>

            <Button
              variant="dark"
              fullWidth={true}
              onClick={() => {
                const credToInspect = qrModalCred;
                setQrModalCred(null);
                setSelectedCredentialId(credToInspect.id);
                navigateTo('credential-detail', { credentialId: credToInspect.id });
              }}
            >
              View Full Credential Specification
            </Button>
          </div>
        )}
      </Modal>

    </div>
  );
}
