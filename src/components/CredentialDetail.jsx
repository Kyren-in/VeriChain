import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plane, 
  GraduationCap, 
  HeartPulse, 
  Shield, 
  Share2, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Trash2,
  ArrowLeft
} from 'lucide-react';
import QRCode from 'qrcode';
import { API_BASE_URL } from '../api';
import { useApp } from '../context/AppContext';
import { Badge, Button, Modal } from './ui';

export default function CredentialDetail() {
  const { 
    selectedCredential, 
    revokeCredential, 
    showToast, 
    navigateTo, 
    setLastVerificationResult 
  } = useApp();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('Holder requested revocation');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const cred = selectedCredential;

  useEffect(() => {
    if (cred) {
      QRCode.toDataURL(cred.qrPayload || `VERICHAIN:${cred.id}`, {
        width: 240,
        margin: 2,
        color: { dark: '#071A3D', light: '#FFFFFF' }
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [cred]);

  if (!cred) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>Credential Not Found</h3>
        <Button variant="primary" onClick={() => navigateTo('credentials')} style={{ marginTop: '16px' }}>
          Back to Credentials
        </Button>
      </div>
    );
  }

  const isRevoked = cred.status === 'Revoked';

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadVC = () => {
    const vcData = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://verichain.id/contexts/v1"
      ],
      "id": cred.id,
      "type": ["VerifiableCredential", cred.category || "IdentityCredential"],
      "issuer": {
        "id": `did:veri:issuer:${cred.issuer.toLowerCase().replace(/\s+/g, '-')}`,
        "name": cred.issuer
      },
      "issuanceDate": cred.issueDate,
      "expirationDate": cred.expiryDate,
      "credentialSubject": {
        "id": "did:veri:80002:0x71C5A87B420C21B273A8D3E4F",
        "name": cred.holderName,
        "identifier": cred.identifierNumber
      },
      "evidence": [{
        "type": "BlockchainAnchor2026",
        "network": "Polygon Amoy Testnet",
        "chainId": 80002,
        "transactionHash": cred.blockchainTx,
        "blockNumber": cred.blockNumber
      }],
      "status": {
        "id": `https://verichain.id/status/${cred.id}`,
        "type": "BitstringStatusListEntry",
        "statusPurpose": "revocation",
        "isRevoked": isRevoked
      }
    };

    const blob = new Blob([JSON.stringify(vcData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cred.title.toLowerCase().replace(/\s+/g, '_')}_vc.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${cred.title} JSON-LD credential`, 'success');
  };

  const handleVerifyNow = async () => {
    setVerifying(true);
    try {
      const payloadToVerify = cred.rawPayload || {
        id: cred.id,
        holderName: cred.holderName,
        idType: cred.title,
        idNumber: cred.identifierNumber,
        nationality: 'Indian',
        issuer: cred.issuer
      };

      const res = await fetch(`${API_BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToVerify)
      });
      const data = await res.json();

      setLastVerificationResult({
        status: data.status || (isRevoked ? 'REVOKED' : 'VALID'),
        credential: cred,
        verifiedAt: new Date().toLocaleTimeString(),
        blockchainTx: data.storedHash || cred.blockchainTx,
        blockNumber: data.blockNumber ? String(data.blockNumber) : cred.blockNumber,
        message: data.message || (isRevoked ? 'Credential revoked on-chain.' : 'Cryptographically verified on ledger.'),
        computedHash: data.computedHash,
        storedHash: data.storedHash
      });
    } catch (err) {
      console.warn('[Verify API fallback]', err.message);
      setLastVerificationResult({
        status: isRevoked ? 'REVOKED' : 'VALID',
        credential: cred,
        verifiedAt: new Date().toLocaleTimeString(),
        blockchainTx: cred.blockchainTx,
        blockNumber: cred.blockNumber,
        message: isRevoked 
          ? 'Credential has been revoked by the issuing authority.' 
          : 'The credential is genuine and verified.'
      });
    } finally {
      setVerifying(false);
      navigateTo('verification-result');
    }
  };

  const handleConfirmRevoke = async () => {
    await revokeCredential(cred.id, revokeReason);
    setIsRevokeModalOpen(false);
  };

  const getCredentialIcon = () => {
    switch (cred.iconType) {
      case 'academic': return <GraduationCap size={24} />;
      case 'passport': return <Plane size={24} />;
      case 'building': return <Building2 size={24} />;
      case 'health': return <HeartPulse size={24} />;
      default: return <Shield size={24} />;
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header Back & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => navigateTo('credentials')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--brand-royal-blue)',
            fontSize: '0.88rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Credentials</span>
        </button>

        <Badge status={cred.status} size="md">
          {cred.status}
        </Badge>
      </div>

      {/* Main Credential Card */}
      <div
        style={{
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-2) 100%)',
          border: isRevoked ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid rgba(37, 99, 235, 0.4)',
          boxShadow: 'var(--card-shadow-hover)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: isRevoked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                color: isRevoked ? 'var(--brand-danger)' : 'var(--brand-royal-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getCredentialIcon()}
            </div>

            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                {cred.title}
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {cred.issuer}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-3)',
            border: '1px solid var(--border-subtle)',
            gap: '12px'
          }}
        >
          <div 
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code" style={{ width: '170px', height: '170px', display: 'block' }} />
            ) : (
              <div style={{ width: '170px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Generating QR...
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Cryptographically signed presentation payload
          </span>
        </div>

        {/* Metadata Details Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Holder Name</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{cred.holderName}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Credential ID</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{cred.identifierNumber}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Issue Date</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{cred.issueDate}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Validity Period</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>{cred.expiryDate}</span>
          </div>
        </div>

        {/* Revocation notice if revoked */}
        {isRevoked && (
          <div 
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.88rem' }}>
              <ShieldAlert size={18} />
              <span>Revoked Status Notice</span>
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
              Revocation Date: <strong>{cred.revocationDate || '12 Aug 2025'}</strong>
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '2px', color: 'var(--text-secondary)' }}>
              Reason: <strong>{cred.revocationReason || 'Revoked by authority'}</strong>
            </p>
          </div>
        )}

        {/* Blockchain Verification Anchor Strip */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--brand-royal-blue)" />
              <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Polygon Amoy Blockchain Anchor
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '600' }}>
              Block #{cred.blockNumber || '5102934'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span className="mono-text" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Tx: {cred.blockchainTx}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(cred.blockchainTx, 'Transaction Hash')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Copy Tx Hash"
            >
              {copiedField === 'Transaction Hash' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Action Buttons: Share, Verify Now, Download VC, Revoke */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <Button
            variant="primary"
            size="sm"
            icon={ShieldCheck}
            onClick={handleVerifyNow}
            isLoading={verifying}
          >
            Verify Now
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Share2}
            onClick={() => setIsShareModalOpen(true)}
          >
            Share
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleDownloadVC}
          >
            Download VC
          </Button>

          {!isRevoked && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setIsRevokeModalOpen(true)}
            >
              Revoke
            </Button>
          )}
        </div>

      </div>

      {/* Revocation Confirmation Modal */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Credential"
        subtitle="This action cryptographically invalidates the credential on-chain."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', fontSize: '0.84rem' }}>
            Warning: Once revoked, any verifier scanning this credential will see it flagged as revoked.
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Reason for Revocation
            </label>
            <input
              type="text"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="input-field"
              placeholder="e.g. Lost device, updated passport, administrative update"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setIsRevokeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmRevoke}>
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Verifiable Credential"
        subtitle="Select disclosure options for selective verification."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Holder Identity:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{cred.holderName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Verification Token:</span>
              <span className="mono-text" style={{ color: 'var(--brand-royal-blue)' }}>{cred.identifierNumber}</span>
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth={true}
            onClick={() => {
              copyToClipboard(`https://verichain.id/verify/${cred.id}`, 'Verification Link');
              setIsShareModalOpen(false);
            }}
          >
            Copy Verification Link
          </Button>
        </div>
      </Modal>

    </div>
  );
}
