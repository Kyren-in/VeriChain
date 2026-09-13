import React, { useState, useEffect } from 'react';
import { 
  Blocks, 
  RefreshCw, 
  Clock, 
  Hash, 
  Cpu, 
  Copy, 
  Check, 
  ShieldCheck, 
  Link2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Card, Button, Tabs, EmptyState } from './ui';
import { API_BASE_URL } from '../api';

export default function BlockchainExplorer() {
  const { showToast } = useApp();
  const [filterType, setFilterType] = useState('all');
  const [copiedHash, setCopiedHash] = useState(null);
  const [liveBlocks, setLiveBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleManualSync = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blocks`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.blocks && Array.isArray(data.blocks)) {
          setLiveBlocks(data.blocks);
          return;
        }
      }
      setLiveBlocks([]);
    } catch (err) {
      console.warn('[Explorer] Failed to fetch blocks:', err.message);
      showToast('Could not sync latest ledger blocks', 'warning');
      setLiveBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    fetch(`${API_BASE_URL}/api/blocks`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data && Array.isArray(data.blocks)) {
          setLiveBlocks(data.blocks);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn('[Explorer] Initial block fetch notice:', err.message);
          setLiveBlocks([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    showToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredBlocks = liveBlocks.filter((block) => {
    if (filterType === 'all') return true;
    if (filterType === 'issued') return block.action === 'CREDENTIAL_ISSUED';
    if (filterType === 'revoked') return block.action === 'CREDENTIAL_REVOKED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Top Banner Header */}
      <Card style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--grad-brand)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 20px var(--glow-accent)'
            }}
          >
            <Blocks size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                VeriChain SHA-256 Ledger Explorer
              </h2>
              <Badge status="verified" size="sm">LIVE AUDIT</Badge>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Immutable Cryptographic Commitments • Zero Raw PII on-chain
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right', padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: '700' }}>
              Total Blocks
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--brand-royal-blue)' }}>
              #{liveBlocks.length}
            </span>
          </div>

          <Button variant="secondary" size="sm" onClick={handleManualSync} isLoading={loading}>
            <RefreshCw size={14} />
            <span>Sync</span>
          </Button>
        </div>
      </Card>

      {/* Network Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Ledger Architecture
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={16} color="var(--brand-royal-blue)" />
            <span>SHA-256 Hash-Linked Ledger</span>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Privacy Standard
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--brand-success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            <span>DPDP Act 2023 Compliant</span>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Cryptography
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Hash size={16} color="var(--brand-cyan)" />
            <span>Deterministic SHA-256</span>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs
          tabs={[
            { id: 'all', label: `All Blocks (${liveBlocks.length})` },
            { id: 'issued', label: `Issuances` },
            { id: 'revoked', label: `Revocations` }
          ]}
          activeTab={filterType}
          onChange={setFilterType}
        />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          Real-time cryptographic hash chain
        </span>
      </div>

      {/* Blocks Stream Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredBlocks.length === 0 ? (
          <EmptyState
            icon={Blocks}
            title="No blocks recorded yet"
            description="Blocks are minted upon verifiable credential issuance and revocation."
          />
        ) : (
          filteredBlocks.map((block) => {
            const isRevoked = block.action === 'CREDENTIAL_REVOKED';
            const isGenesis = block.action === 'GENESIS';

            return (
              <Card
                key={`${block.index}-${block.hash}`}
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderLeft: isRevoked 
                    ? '4px solid var(--brand-danger)' 
                    : isGenesis 
                      ? '4px solid var(--brand-cyan)' 
                      : '4px solid var(--brand-success)'
                }}
              >
                {/* Block Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span 
                      style={{ 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'var(--bg-surface-2)', 
                        color: 'var(--brand-royal-blue)', 
                        fontSize: '0.82rem', 
                        fontWeight: '800',
                        border: '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      Block #{block.index}
                    </span>

                    <Badge 
                      status={isRevoked ? 'revoked' : isGenesis ? 'issued' : 'valid'} 
                      size="sm"
                    >
                      {block.action}
                    </Badge>

                    {block.credentialId && (
                      <span style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {block.credentialId}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <Clock size={13} />
                    <span>{new Date(block.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Block Hashes Grid */}
                <div 
                  style={{ 
                    padding: '14px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'var(--bg-surface-2)', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '12px' 
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Block Header Hash
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(block.hash, 'Block Hash')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        title="Copy Hash"
                      >
                        {copiedHash === block.hash ? <Check size={12} color="var(--brand-success)" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <div 
                      style={{ 
                        fontSize: '0.76rem', 
                        fontFamily: 'var(--font-mono)', 
                        color: 'var(--text-primary)', 
                        wordBreak: 'break-all' 
                      }}
                    >
                      {block.hash}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Credential Deterministic Digest
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(block.credentialHash, 'Credential Digest')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        title="Copy Digest"
                      >
                        {copiedHash === block.credentialHash ? <Check size={12} color="var(--brand-success)" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <div 
                      style={{ 
                        fontSize: '0.76rem', 
                        fontFamily: 'var(--font-mono)', 
                        color: 'var(--brand-royal-blue)', 
                        wordBreak: 'break-all' 
                      }}
                    >
                      {block.credentialHash || 'N/A (Genesis)'}
                    </div>
                  </div>
                </div>

                {/* DID and Previous Hash Linkage */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    Subject DID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: '600' }}>{block.did || 'did:verichain:root'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link2 size={13} color="var(--text-muted)" />
                    <span>Prev Hash:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      {(block.previousHash || '0').substring(0, 18)}...
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
}
