import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Small timeout to allow DOM node to render
    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          scanner.clear().catch(console.error);
          onClose();
        },
        (error) => {
          // Ignore frame decode errors
        }
      );

      scannerRef.current = scanner;
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
          maxWidth: '480px',
          padding: '24px',
          borderRadius: '20px',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera color="var(--primary)" size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Scan Credential QR Code</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div id="qr-reader-container" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
      </div>
    </div>
  );
}
