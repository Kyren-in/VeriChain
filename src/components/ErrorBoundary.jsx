import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[VeriChain Runtime Error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary, #050B18)',
            color: 'var(--text-primary, #F8FAFC)',
            padding: '24px',
            fontFamily: "var(--font-sans, 'Plus Jakarta Sans', sans-serif)"
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: 'var(--bg-surface, #091326)',
              border: '1px solid var(--border-default, rgba(255, 255, 255, 0.14))',
              borderRadius: '20px',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <ShieldAlert size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                marginBottom: '10px',
                color: '#FFFFFF',
                letterSpacing: '-0.02em'
              }}
            >
              Application Encountered an Error
            </h2>

            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary, #94A3B8)',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}
            >
              VeriChain captured a client-side exception. Your cryptographic data remains safe on the ledger.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: 'var(--bg-surface-sunken, #030710)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.78rem',
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  color: '#EF4444',
                  marginBottom: '24px',
                  wordBreak: 'break-word',
                  textAlign: 'left'
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'var(--brand-royal-blue, #2563EB)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={16} />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-2, #0E1C38)',
                  color: 'var(--text-primary, #F8FAFC)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Home size={16} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
