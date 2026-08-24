import React, { useState, useEffect } from 'react';
import { Blocks, RefreshCw, ExternalLink, Hash, Clock, FileText } from 'lucide-react';

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
      setBlocks(data.blocks);
      setChainLength(data.chainLength);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Explorer Header */}
      <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '12px', borderRadius: '14px', color: 'var(--primary)' }}>
            <Blocks size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Polygon Amoy Testnet Audit Explorer</h2>
              <span className="badge-valid" style={{ fontSize: '0.7rem' }}>LIVE SYNC</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Immutable Cryptographic Hash Ledger & Revocation Stream</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL BLOCKS</span>
            <span className="mono-text" style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>#{chainLength}</span>
          </div>

          <button onClick={fetchBlocks} className="btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Blocks Stream */}
      {loading && blocks.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading blockchain transactions...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {blocks.map((block) => (
            <div
              key={block.index}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderColor: block.action === 'CREDENTIAL_REVOKED' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="mono-text" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}>
                    Block #{block.index}
                  </span>

                  <span className={block.action === 'CREDENTIAL_ISSUED' ? 'badge-valid' : block.action === 'CREDENTIAL_REVOKED' ? 'badge-revoked' : 'btn-secondary'} style={{ fontSize: '0.75rem' }}>
                    {block.action}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Clock size={14} />
                  <span>{new Date(block.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.85rem', background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Block Hash:</span>
                  <span className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {block.hash}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Credential SHA-256 Digest:</span>
                  <span className="mono-text" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
                    {block.credentialHash}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>
                  Holder DID: <span className="mono-text" style={{ color: 'var(--primary)' }}>{block.did}</span>
                </div>
                <div>
                  Prev Hash: <span className="mono-text" style={{ color: 'var(--text-dim)' }}>{block.previousHash.substring(0, 16)}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
