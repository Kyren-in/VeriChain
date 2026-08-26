import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldAlert, UserCheck, Shield, CheckCircle, RefreshCw, Search, Users } from 'lucide-react';

export default function AdminPortal() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data) {
        setUsersList(data);
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setStatusMsg('');

    try {
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      setStatusMsg(`Role updated to ${newRole.toUpperCase()} successfully!`);
    } catch (err) {
      setStatusMsg('Error updating role: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* Header */}
      <div className="clay-card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', 
              padding: '12px', 
              borderRadius: '16px', 
              color: '#FFFFFF',
              boxShadow: 'var(--clay-pill)'
            }}
          >
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Admin Identity Governance Panel</h2>
              <span className="badge-valid" style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                ROOT ACCESS
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Assign system governance roles (Issuer Authority, Hotel Verifier, Citizen User)
            </p>
          </div>
        </div>

        <button onClick={fetchUsers} className="btn-secondary" style={{ padding: '10px 18px' }}>
          <RefreshCw size={15} /> Refresh List
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--india-green-soft)', color: '#34D399', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          {statusMsg}
        </div>
      )}

      {/* Users Table Panel */}
      <div className="neu-card" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredUsers.length}</strong> Registered Identities
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading registered users...</div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="admin-desktop-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>User Details</th>
                    <th style={{ padding: '12px 16px' }}>Current Role</th>
                    <th style={{ padding: '12px 16px' }}>Re-Assign System Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '700', color: '#FFFFFF' }}>{user.full_name || 'Standard User'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{user.email}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span
                          className="badge-valid"
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.72rem',
                            background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : user.role === 'issuer' ? 'rgba(255, 138, 61, 0.2)' : user.role === 'verifier' ? 'rgba(37, 99, 235, 0.2)' : 'var(--india-green-soft)',
                            color: user.role === 'admin' ? '#F87171' : user.role === 'issuer' ? 'var(--saffron)' : user.role === 'verifier' ? 'var(--digital-blue-light)' : '#34D399'
                          }}
                        >
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={user.role || 'user'}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="input-field"
                          style={{ maxWidth: '240px', padding: '8px 12px' }}
                        >
                          <option value="user">User (Identity Holder)</option>
                          <option value="issuer">Issuer (Govt / Authority)</option>
                          <option value="verifier">Verifier (Hotel / Checkpoint)</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="admin-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="neu-card-inset"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.95rem' }}>{user.full_name || 'Standard User'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{user.email}</div>
                    </div>
                    <span
                      className="badge-valid"
                      style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}
                    >
                      {user.role || 'user'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Re-Assign Role:
                    </label>
                    <select
                      value={user.role || 'user'}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="input-field"
                    >
                      <option value="user">User (Identity Holder)</option>
                      <option value="issuer">Issuer (Govt / Authority)</option>
                      <option value="verifier">Verifier (Hotel / Checkpoint)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
