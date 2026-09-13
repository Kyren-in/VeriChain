import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Loader2,
  QrCode
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from './ui';
import { API_BASE_URL } from '../api';

export default function QRVerificationView() {
  const { credentials, navigateTo, setLastVerificationResult, showToast } = useApp();

  const [isScanning, setIsScanning] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const fileInputRef = useRef(null);

  // Real backend cryptographic ledger verification
  const verifyPayload = useCallback(async (payloadData) => {
    setVerifying(true);
    try {
      let bodyData = payloadData;
      if (typeof payloadData === 'string') {
        const trimmed = payloadData.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            bodyData = JSON.parse(trimmed);
          } catch {
            bodyData = { id: trimmed };
          }
        } else if (trimmed.startsWith('VERICHAIN:')) {
          const credId = trimmed.replace('VERICHAIN:', '');
          const matched = credentials.find((c) => c.id === credId);
          bodyData = matched?.rawPayload || { id: credId };
        } else {
          const matched = credentials.find((c) => c.id === trimmed || c.identifierNumber === trimmed);
          if (matched && matched.rawPayload) {
            bodyData = matched.rawPayload;
          } else {
            bodyData = {
              id: trimmed,
              holderName: 'Identity Subject',
              idNumber: trimmed,
              idType: 'Identity Credential',
              nationality: 'Indian'
            };
          }
        }
      }

      // Execute real cryptographic ledger verification against SHA-256 hash anchor
      const res = await fetch(`${API_BASE_URL}/api/credentials/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();

      const matchedVisual = credentials.find(
        (c) => c.id === bodyData.id || c.identifierNumber === bodyData.idNumber
      ) || {
        title: bodyData.idType || 'VeriChain Verifiable Credential',
        issuer: bodyData.issuer || 'Government Authority',
        holderName: bodyData.holderName || 'Identity Holder',
        identifierNumber: bodyData.idNumber || bodyData.identifierNumber || 'N/A',
        expiryDate: bodyData.validUntil || 'Lifetime',
        status: data.isRevoked ? 'Revoked' : (data.status === 'VALID' ? 'Valid' : 'Invalid'),
        blockchainTx: data.storedHash || data.computedHash || '0x0',
        blockNumber: data.blockNumber ? String(data.blockNumber) : '1',
        iconType: (bodyData.idType || '').toLowerCase().includes('pass') ? 'passport' : 'id-card'
      };

      setLastVerificationResult({
        status: data.status,
        credential: matchedVisual,
        verifiedAt: new Date().toLocaleTimeString(),
        message: data.message,
        blockchainTx: data.storedHash || data.computedHash || matchedVisual.blockchainTx,
        blockNumber: data.blockNumber ? String(data.blockNumber) : matchedVisual.blockNumber,
        computedHash: data.computedHash,
        storedHash: data.storedHash,
        checks: [
          { label: 'Deterministic SHA-256 Digest', pass: data.status === 'VALID', detail: data.computedHash ? `${data.computedHash.substring(0, 12)}...` : 'Verified' },
          { label: 'Blockchain Anchor Block', pass: data.status !== 'INVALID', detail: data.blockNumber ? `Block #${data.blockNumber}` : 'Anchor Confirmed' },
          { label: 'Revocation Status', pass: !data.isRevoked && data.status !== 'REVOKED', detail: (data.isRevoked || data.status === 'REVOKED') ? 'REVOKED' : 'CLEARED' },
          { label: 'Document Tamper Check', pass: !data.tampered && data.status !== 'TAMPERED', detail: data.tampered ? 'TAMPER DETECTED' : 'UNALTERED' },
          { label: 'Expiration Status', pass: !data.isExpired && data.status !== 'EXPIRED', detail: (data.isExpired || data.status === 'EXPIRED') ? 'EXPIRED' : 'VALID' }
        ]
      });

      navigateTo('verification-result');
    } catch (err) {
      console.warn('[Verification Error]', err);
      showToast(`Verification error: ${err.message}`, 'danger');
      setIsScanning(true);
    } finally {
      setVerifying(false);
    }
  }, [credentials, navigateTo, setLastVerificationResult, showToast]);

  // Camera integration with Html5Qrcode
  useEffect(() => {
    let qrScanner = null;
    let isCancelled = false;

    async function startCamera() {
      try {
        qrScanner = new Html5Qrcode('qr-reader-viewport');
        await qrScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (isCancelled) return;
            qrScanner.stop().catch(() => {});
            verifyPayload(decodedText);
          },
          () => {}
        );
        if (!isCancelled) setCameraError(null);
      } catch (err) {
        if (!isCancelled) {
          console.warn('Camera access unavailable:', err);
          setCameraError('Camera access unavailable. Please use image upload or enter the credential ID below.');
        }
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (qrScanner) {
        try {
          if (qrScanner.isScanning) {
            qrScanner.stop().catch(() => {});
          }
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [verifyPayload]);

  // Direct QR Image File Upload & Decoding
  const handleDirectGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    setIsScanning(false);
    try {
      const html5QrCode = new Html5Qrcode('qr-file-decoder');
      const decodedText = await html5QrCode.scanFile(file, true);
      await verifyPayload(decodedText);
    } catch (err) {
      console.warn('File decode notice:', err);
      showToast('No readable QR code found in the image. Please select a clear QR code image.', 'warning');
      setIsScanning(true);
      setVerifying(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      showToast('Please enter a verification code or ID', 'error');
      return;
    }
    verifyPayload(manualCode);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Hidden container for QR file decoder */}
      <div id="qr-file-decoder" style={{ display: 'none' }} />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleDirectGalleryUpload}
      />

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => navigateTo('dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--brand-royal-blue)',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Verification Terminal
        </span>
      </div>

      {/* Camera Viewfinder & Scanner Frame */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-2xl)',
          background: '#040814',
          border: '1.5px solid rgba(37, 99, 235, 0.4)',
          overflow: 'hidden',
          minHeight: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
          textAlign: 'center'
        }}
      >
        {/* Ambient Dark Viewfinder Background watermark */}
        <div 
          style={{
            position: 'absolute',
            top: '30px',
            letterSpacing: '0.3em',
            fontSize: '1.4rem',
            fontWeight: '900',
            color: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
            textTransform: 'uppercase'
          }}
        >
          VERIFICATION TERMINAL
        </div>

        <p 
          style={{ 
            fontSize: '0.86rem', 
            color: 'rgba(255, 255, 255, 0.75)', 
            maxWidth: '320px', 
            lineHeight: 1.4,
            marginBottom: '20px',
            zIndex: 2 
          }}
        >
          Point the camera at the VeriChain QR code to instantly verify authenticity against the ledger.
        </p>

        {/* Center Scanner Frame with Target Corners */}
        <div
          style={{
            position: 'relative',
            width: '230px',
            height: '230px',
            borderRadius: '20px',
            border: '2px solid rgba(6, 182, 212, 0.5)',
            background: 'rgba(7, 15, 33, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)',
            zIndex: 2
          }}
        >
          {/* Target Corners */}
          <div style={{ position: 'absolute', top: '8px', left: '8px', width: '18px', height: '18px', borderTop: '3px solid #06B6D4', borderLeft: '3px solid #06B6D4', borderRadius: '4px 0 0 0', zIndex: 3 }} />
          <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderTop: '3px solid #06B6D4', borderRight: '3px solid #06B6D4', borderRadius: '0 4px 0 0', zIndex: 3 }} />
          <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '18px', height: '18px', borderBottom: '3px solid #06B6D4', borderLeft: '3px solid #06B6D4', borderRadius: '0 0 0 4px', zIndex: 3 }} />
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '18px', height: '18px', borderBottom: '3px solid #06B6D4', borderRight: '3px solid #06B6D4', borderRadius: '0 0 4px 0', zIndex: 3 }} />

          {/* Real video container if camera active */}
          {!cameraError ? (
            <div 
              id="qr-reader-viewport" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '12px' }}>
              <QrCode size={130} color="#071A3D" />
            </div>
          )}

          {/* Animated Glowing Scan Beam Line */}
          {isScanning && !verifying && !cameraError && (
            <div 
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #06B6D4, #34D399, transparent)',
                boxShadow: '0 0 16px #06B6D4, 0 0 8px #34D399',
                animation: 'scanLine 2.2s infinite ease-in-out',
                zIndex: 3
              }} 
            />
          )}

          {verifying && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(4, 8, 20, 0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 4 }}>
              <Loader2 size={36} color="#06B6D4" className="spinner-icon" />
              <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: '700' }}>Verifying SHA-256 Hash...</span>
            </div>
          )}
        </div>

        {/* Scanning status label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '22px', zIndex: 2 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: verifying ? '#F59E0B' : (cameraError ? '#EF4444' : '#34D399'), boxShadow: `0 0 8px ${verifying ? '#F59E0B' : (cameraError ? '#EF4444' : '#34D399')}` }} />
          <span style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: '0.04em' }}>
            {verifying ? 'Checking Immutable Ledger...' : (cameraError ? 'Camera Standby' : 'Camera Active')}
          </span>
        </div>

        {cameraError && (
          <div style={{ marginTop: '14px', fontSize: '0.76rem', color: '#FCD34D', maxWidth: '340px', zIndex: 2 }}>
            {cameraError}
          </div>
        )}
      </div>

      {/* Alternative Verification Options */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Alternative Verification Methods
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Upload a QR image file or enter a Credential ID to execute cryptographic ledger validation.
          </p>
        </div>

        {/* Manual Code Entry & Image Upload */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Enter verification ID (e.g. VC-1741...)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button variant="dark" type="submit" isLoading={verifying} style={{ whiteSpace: 'nowrap', background: '#071A3D', alignSelf: 'flex-end', height: '42px' }}>
              Verify ID
            </Button>
          </form>

          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()} 
            icon={Upload}
            isLoading={verifying}
            style={{ alignSelf: 'flex-end', height: '42px', whiteSpace: 'nowrap' }}
          >
            Upload QR Image
          </Button>
        </div>
      </Card>

    </div>
  );
}
