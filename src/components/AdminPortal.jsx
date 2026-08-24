import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldAlert, UserCheck, Shield, CheckCircle, RefreshCw, Search } from 'lucide-react';

export default function AdminPortal() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from Supabase or memory store
      const { data, error } = await supabase.from('profiles').select('*');
      if (error || !data) {
        // Mock default demo list if database table is empty or initializing
        setUsersList([
          { id: '1', email: 'jyotiprakashpanda072@gmail.com', full_name: 'Jyotiprakash Panda', role: 'user', created_at: '2026-08-24' },
          { id: '2', email: 'aarav.sharma@gov.in', full_name: 'Aarav Sharma', role: 'user', created_at: '2026-08-24' },
          { id: '3', email: 'elena.rostova@tourism.org', full_name: 'Elena Rostova', role: 'user', created_at: '2026-08-24' }
        ]);
      } else {
        setUsersList(data);
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
      // Update local state for immediate UI feedback
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      // Update Supabase profiles table
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '14px', color: 'var(--accent-pink)' }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Admin Identity Governance Panel</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Review identity credentials & assign system roles (Issuer, Verifier, User)</p>
          </div>
        </div>

        <button onClick={fetchUsers} className="btn-secondary">
          <RefreshCw size={16} /> Refresh List
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
          {statusMsg}
        </div>
      )}

      {/* Users Table Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing {filteredUsers.length} Registered Identities</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading registered users...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>User Details</th>
                  <th style={{ padding: '12px 16px' }}>Current Role</th>
                  <th style={{ padding: '12px 16px' }}>Re-Assign System Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{user.full_name || 'Standard User'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        className="badge-valid"
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.7rem',
                          background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : user.role === 'issuer' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: user.role === 'admin' ? 'var(--accent-pink)' : user.role === 'issuer' ? 'var(--primary)' : 'var(--accent-emerald)'
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
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(20, 27, 45, 0.95)',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
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
        )}
      </div>
    </div>
  );
}
