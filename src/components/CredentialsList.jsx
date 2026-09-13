import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  Building2, 
  Plane, 
  GraduationCap, 
  HeartPulse, 
  Shield, 
  FileQuestion
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Input, Tabs, EmptyState } from './ui';

export default function CredentialsList() {
  const { credentials, navigateTo, setSelectedCredentialId } = useApp();
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Valid' | 'Revoked'
  const [searchQuery, setSearchQuery] = useState('');

  const validCount = credentials.filter((c) => c.status === 'Valid').length;
  const revokedCount = credentials.filter((c) => c.status === 'Revoked').length;

  const tabOptions = [
    { id: 'All', label: 'All', count: credentials.length },
    { id: 'Valid', label: 'Valid', count: validCount },
    { id: 'Revoked', label: 'Revoked', count: revokedCount }
  ];

  const filteredCredentials = credentials.filter((cred) => {
    // Tab filter
    if (activeFilter !== 'All' && cred.status !== activeFilter) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = cred.title.toLowerCase().includes(q);
      const matchIssuer = cred.issuer.toLowerCase().includes(q);
      const matchId = (cred.identifierNumber || '').toLowerCase().includes(q);
      const matchHolder = (cred.holderName || '').toLowerCase().includes(q);
      return matchTitle || matchIssuer || matchId || matchHolder;
    }
    return true;
  });

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

  const handleSelectCredential = (credId) => {
    setSelectedCredentialId(credId);
    navigateTo('credential-detail', { credentialId: credId });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', minHeight: '80vh' }}>
      
      {/* Top Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>
          My Credentials
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Manage your verified self-sovereign identity tokens
        </p>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search credentials by title, issuer or ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={Search}
      />

      {/* Filter Tabs matching Reference Screen 5 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs
          tabs={tabOptions}
          activeTab={activeFilter}
          onChange={(tab) => setActiveFilter(tab)}
          style={{ width: '100%', justifyContent: 'space-around', maxWidth: '420px' }}
        />
      </div>

      {/* Credentials List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredCredentials.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="No credentials found"
            description={
              searchQuery
                ? `No credentials match "${searchQuery}". Try changing your search query or filter.`
                : `You don't have any ${activeFilter.toLowerCase()} credentials at the moment.`
            }
            actionLabel={searchQuery ? 'Clear Search' : 'Issue New Credential'}
            onAction={() => {
              if (searchQuery) setSearchQuery('');
              else navigateTo('issue');
            }}
          />
        ) : (
          filteredCredentials.map((cred) => {
            const isRevoked = cred.status === 'Revoked';

            return (
              <div
                key={cred.id}
                onClick={() => handleSelectCredential(cred.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)',
                  border: isRevoked ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--card-shadow)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                className="credential-item-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
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
                    <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {cred.title}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {cred.issuer}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge status={cred.status}>{cred.status}</Badge>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (+) matching Reference Screen 5 */}
      <button
        type="button"
        onClick={() => navigateTo('issue')}
        aria-label="Add new credential"
        title="Issue New Credential"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '28px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#071A3D',
          color: '#FFFFFF',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 45,
          transition: 'var(--transition-fast)'
        }}
      >
        <Plus size={26} strokeWidth={2.4} />
      </button>

    </div>
  );
}
