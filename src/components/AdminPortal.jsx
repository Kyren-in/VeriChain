import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Crown,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { Badge, Card, Button, Input, EmptyState } from './ui';

export default function AdminPortal() {
  const { showToast, userProfile, setUserProfile } = useApp();
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      if (data && Array.isArray(data)) {
        const dbUsers = data.map((p) => {
          const rawRole = (p.role || 'user').toLowerCase();
          let displayRole = 'Holder';
          if (rawRole === 'admin') displayRole = 'Admin';
          else if (rawRole === 'issuer') displayRole = 'Issuer';
          else if (rawRole === 'verifier') displayRole = 'Verifier';

          return {
            id: p.id,
            name: p.full_name || p.email?.split('@')[0] || 'User',
            email: p.email || 'N/A',
            phone: p.phone || '',
            role: displayRole,
            rawRole,
            did: `did:veri:80002:0x${p.id.replace(/-/g, '').substring(0, 24)}`,
            status: 'Active'
          };
        });
        setUsersList(dbUsers);
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.warn('[Admin Portal] Could not load profiles:', err.message);
      showToast(`Error fetching profiles: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    supabase
      .from('profiles')
      .select('*')
      .then(({ data, error }) => {
        if (error) throw error;
        if (!ignore && data && Array.isArray(data)) {
          const dbUsers = data.map((p) => {
            const rawRole = (p.role || 'user').toLowerCase();
            let displayRole = 'Holder';
            if (rawRole === 'admin') displayRole = 'Admin';
            else if (rawRole === 'issuer') displayRole = 'Issuer';
            else if (rawRole === 'verifier') displayRole = 'Verifier';

            return {
              id: p.id,
              name: p.full_name || p.email?.split('@')[0] || 'User',
              email: p.email || 'N/A',
              phone: p.phone || '',
              role: displayRole,
              rawRole,
              did: `did:veri:80002:0x${p.id.replace(/-/g, '').substring(0, 24)}`,
              status: 'Active'
            };
          });
          setUsersList(dbUsers);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn('[Admin Portal] Initial profile fetch notice:', err.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleRoleChange = async (userId, targetRole) => {
    setUpdatingId(userId);
    const dbRole = targetRole.toLowerCase() === 'holder' ? 'user' : targetRole.toLowerCase();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: dbRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: targetRole, rawRole: dbRole } : u))
      );

      if (userProfile && userProfile.email) {
        const targetUser = usersList.find((u) => u.id === userId);
        if (targetUser && userProfile.email.toLowerCase() === targetUser.email.toLowerCase()) {
          setUserProfile((prev) => ({ ...prev, role: dbRole }));
        }
      }

      showToast(`Role updated to ${targetRole} for user.`, 'success');
    } catch (err) {
      console.error('[Admin Role Update Error]:', err);
      showToast(`Failed to update role: ${err.message}`, 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
      
      {/* Admin Panel Header */}
      <Card style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Crown size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                Identity Governance & RBAC Panel
              </h2>
              <Badge status="danger" size="sm">ROOT ACCESS</Badge>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Assign system governance privileges: Holder Citizen, Issuer Authority, Hotel Verifier, or Admin
            </p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleManualRefresh} isLoading={loading}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </Button>
      </Card>

      {/* RBAC Matrix Overview Card */}
      <Card style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Role-Based Access Control (RBAC) Architecture
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--brand-royal-blue)' }}>📱 Citizen (Holder)</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sovereign Digital Wallet, View Credentials, Present Dynamic QR.
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--brand-success)' }}>🏛️ Issuer Authority</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Issue Verifiable Credentials, Broadcast On-Chain Revocations.
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--brand-cyan)' }}>🏨 Hotel Verifier</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              High-Speed Terminal Scanner, Edge SHA-256 Validation.
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--brand-danger)' }}>👑 System Admin</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Root Privileges, Assign Roles, Inspect Immutable Ledger.
            </div>
          </div>
        </div>
      </Card>

      {/* Users Search & Directory */}
      <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ width: '100%', maxWidth: '340px' }}>
            <Input
              icon={Search}
              placeholder="Search user by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Showing {filteredUsers.length} Supabase user profiles
          </div>
        </div>

        {/* User Items List */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No user profiles found"
            description={searchQuery ? 'No profiles matched your search criteria.' : 'No profiles found in Supabase database.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredUsers.map((user) => {
              const isSelf = userProfile?.email && userProfile.email.toLowerCase() === user.email.toLowerCase();

              return (
                <div
                  key={user.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {user.name}
                      </span>
                      {isSelf && (
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--brand-royal-blue)', fontWeight: '700' }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {user.email} {user.phone ? `• ${user.phone}` : ''}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: '3px' }}>
                      {user.did}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                      Assigned Role:
                    </span>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['Holder', 'Issuer', 'Verifier', 'Admin'].map((r) => {
                        const isCurrent = user.role.toLowerCase() === r.toLowerCase();

                        return (
                          <button
                            key={r}
                            type="button"
                            disabled={updatingId === user.id}
                            onClick={() => handleRoleChange(user.id, r)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: isCurrent ? '1.5px solid var(--brand-royal-blue)' : '1px solid var(--border-default)',
                              background: isCurrent ? 'var(--brand-royal-blue)' : 'var(--bg-surface)',
                              color: isCurrent ? '#FFFFFF' : 'var(--text-primary)',
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)'
                            }}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}
