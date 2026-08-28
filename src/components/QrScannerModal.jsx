import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Image, Upload, AlertCircle, Sparkles } from 'lucide-react';

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const scannerRef = useRef(null);
  const [galleryError, setGalleryError] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setGalleryError('');
      setIsProcessingFile(false);
      return;
    }

    // Small timeout to allow DOM node to render
    const timer = setTimeout(() => {
      try {
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
            // Ignore ongoing frame decode errors
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error("Camera init error:", err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [isOpen]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGalleryError('');
    setIsProcessingFile(true);

    try {
      // Create Html5Qrcode instance dedicated to file decoding
      const html5QrCode = new Html5Qrcode("qr-file-decoder-temp");
      const decodedText = await html5QrCode.scanFile(file, true);
      
      // Stop scanner if active
      if (scannerRef.current) {
        await scannerRef.current.clear().catch(() => {});
      }
      
      onScanSuccess(decodedText);
      onClose();
    } catch (err) {
      console.error("Failed to decode QR code from image file:", err);
      setGalleryError('No valid QR code detected in the selected image. Please upload a clear photo/screenshot of the VeriChain QR code.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-panel clay-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '24px',
          borderRadius: '24px',
          position: 'relative',
          background: 'linear-gradient(145deg, rgba(20, 32, 56, 0.96) 0%, rgba(11, 18, 32, 0.99) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF8A3D 0%, #EA580C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera color="#FFFFFF" size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#FFFFFF' }}>Scan Credential QR Code</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Camera feed or image upload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Gallery Upload Banner Button */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '0.88rem'
            }}
          >
            <Image size={18} color="#93C5FD" />
            <span>{isProcessingFile ? 'Decoding Image...' : '📁 Upload QR from Gallery / Photos'}</span>
          </button>
        </div>

        {galleryError && (
          <div
            style={{
              marginBottom: '14px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#FCA5A5',
              fontSize: '0.82rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{galleryError}</span>
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <div id="qr-reader-container" style={{ width: '100%', borderRadius: '14px', overflow: 'hidden' }}></div>
          {/* Hidden container for file scanning engine */}
          <div id="qr-file-decoder-temp" style={{ display: 'none' }}></div>
        </div>

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Align the QR code within the frame or select a screenshot from device storage.
        </div>
      </div>
    </div>
  );
}
