import React, { useState, useEffect } from 'react';
import { Blocks, RefreshCw, Clock, Hash, Cpu, ExternalLink, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function BlockchainExplorer() {
  const [blocks, setBlocks] = useState([]);
  const [chainLength, setChainLength] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blocks`);
      const data = await res.json();
      setBlocks(data.blocks || []);
      setChainLength(data.chainLength || 0);
    } catch (err) {
      console.error('Error fetching block stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Explorer Header */}
      <div className="clay-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
              padding: '12px', 
              borderRadius: '16px', 
              color: '#FFFFFF',
              boxShadow: 'var(--clay-pill), var(--neu-glow-blue)'
            }}
          >
            <Blocks size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Polygon Amoy Audit Ledger</h2>
              <span className="badge-valid" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>LIVE SYNC</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Immutable Cryptographic Hash Ledger & Instant Revocation Stream
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="neu-card-inset" style={{ padding: '8px 16px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              Total Anchored Blocks
            </span>
            <span className="mono-text" style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--digital-blue-light)' }}>
              #{chainLength}
            </span>
          </div>

          <button onClick={fetchBlocks} className="btn-secondary" style={{ padding: '10px 18px' }}>
            <RefreshCw size={15} /> Refresh Stream
          </button>
        </div>
      </div>

      {/* Blocks Stream Feed */}
      {loading && blocks.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
          Loading blockchain transactions...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {blocks.map((block) => (
            <div
              key={block.index}
              className="neu-card"
              style={{
                padding: '22px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: block.action === 'CREDENTIAL_REVOKED' ? '4px solid var(--saffron)' : '4px solid var(--india-green)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="mono-text" style={{ background: 'var(--bg-surface-sunken)', color: 'var(--digital-blue-light)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', border: '1px solid var(--border-subtle)' }}>
                    Block #{block.index}
                  </span>

                  <span className={block.action === 'CREDENTIAL_ISSUED' ? 'badge-valid' : block.action === 'CREDENTIAL_REVOKED' ? 'badge-revoked' : 'btn-secondary'} style={{ fontSize: '0.75rem' }}>
                    {block.action}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  <Clock size={14} />
                  <span>{new Date(block.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Block Detail Hashes */}
              <div className="neu-card-inset" style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>
                    Block Hash (Header):
                  </span>
                  <span className="mono-text" style={{ fontSize: '0.78rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {block.hash}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>
                    Credential SHA-256 Digest:
                  </span>
                  <span className="mono-text" style={{ fontSize: '0.78rem', color: 'var(--digital-blue-light)', wordBreak: 'break-all' }}>
                    {block.credentialHash}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  Holder DID: <span className="mono-text" style={{ color: '#FFFFFF' }}>{block.did}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Prev Hash:</span>
                  <span className="mono-text" style={{ color: 'var(--text-dim)' }}>{block.previousHash.substring(0, 16)}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
