import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { API_BASE_URL } from '../api';

export function adaptCredential(cred) {
  const idType = cred.idType || cred.documentType || cred.title || 'Identity Credential';
  const isRevoked = Boolean(cred.isRevoked || cred.is_revoked || cred.status === 'Revoked');
  const id = cred.id || `VC-${Date.now()}`;
  
  let category = 'National ID';
  let iconType = 'id-card';
  const lowerType = idType.toLowerCase();
  if (lowerType.includes('passport') || lowerType.includes('travel')) {
    category = 'Travel Document';
    iconType = 'passport';
  } else if (lowerType.includes('tourism') || lowerType.includes('access') || lowerType.includes('hotel')) {
    category = 'Tourism & Hospitality';
    iconType = 'building';
  } else if (lowerType.includes('degree') || lowerType.includes('education') || lowerType.includes('college')) {
    category = 'Education';
    iconType = 'academic';
  } else if (lowerType.includes('health') || lowerType.includes('medical')) {
    category = 'Healthcare';
    iconType = 'health';
  }

  // Exact payload required for deterministic SHA-256 ledger verification
  const fullPayload = cred.payload || {
    id: cred.id,
    did: cred.did || `did:verichain:${id}`,
    holderName: cred.holderName || cred.holder_name || 'Identity Subject',
    userEmail: cred.userEmail || cred.user_email || null,
    userId: cred.userId || cred.user_id || null,
    idType: idType,
    idNumber: cred.idNumber || cred.identifierNumber || cred.id_number || 'N/A',
    nationality: cred.nationality || 'Indian',
    issueDate: cred.issueDate || cred.issue_date || new Date().toISOString().split('T')[0],
    validUntil: cred.validUntil || cred.valid_until || cred.expiryDate || 'Lifetime',
    issuer: cred.issuer || 'VeriChain Authorized Authority'
  };

  return {
    id,
    title: idType,
    issuer: cred.issuer || 'VeriChain Authorized Authority',
    category,
    status: isRevoked ? 'Revoked' : 'Valid',
    iconType,
    holderName: cred.holderName || cred.holder_name || 'Identity Subject',
    identifierNumber: cred.idNumber || cred.identifierNumber || cred.id_number || 'N/A',
    issueDate: cred.issueDate || cred.issue_date || 'N/A',
    expiryDate: cred.validUntil || cred.valid_until || cred.expiryDate || 'Lifetime',
    revocationDate: cred.revocationDate || (isRevoked ? 'Recorded on Ledger' : undefined),
    revocationReason: cred.revocationReason || cred.reason || (isRevoked ? 'Revoked on-chain' : undefined),
    blockchainTx: cred.hash || cred.blockchainTx || '0x0',
    blockNumber: cred.blockNumber ? String(cred.blockNumber) : '1',
    schema: `urn:verichain:schema:${lowerType.replace(/\s+/g, '-')}:v1`,
    qrPayload: JSON.stringify(fullPayload),
    rawPayload: fullPayload
  };
}

export const DEFAULT_GUEST_PROFILE = {
  name: 'Guest User',
  email: '',
  phone: '',
  passportNumber: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  did: '',
  role: 'guest'
};

// 6. Role-Based Access Control (RBAC) Specification Matrix
export const RBAC_MODULES = [
  {
    id: 'landing',
    name: 'Public Landing Page & Simulation',
    description: 'Overview, interactive SIH hash tampering simulator, and architecture specifications',
    allowed: ['guest', 'user', 'verifier', 'issuer', 'admin'],
    primaryRoute: 'landing'
  },
  {
    id: 'wallet',
    name: 'Holder Digital Wallet',
    description: 'Self-sovereign credential storage, offline QR pass presentation, and identity management',
    allowed: ['user', 'issuer', 'admin'],
    primaryRoute: 'wallet'
  },
  {
    id: 'verify',
    name: 'Hotel Verifier Camera Terminal',
    description: 'Instant zero-knowledge QR camera verification and cryptographic integrity checks',
    allowed: ['verifier', 'issuer', 'admin'],
    primaryRoute: 'verify'
  },
  {
    id: 'issue',
    name: 'DID Issuance & Revocation Desk',
    description: 'Authorized issuance of digital credentials and real-time on-chain revocation anchors',
    allowed: ['issuer', 'admin'],
    primaryRoute: 'issue'
  },
  {
    id: 'explorer',
    name: 'Blockchain Ledger Explorer',
    description: 'Public audit trail, block validator stream, and SHA-256 state commitment verification',
    allowed: ['user', 'verifier', 'issuer', 'admin'],
    primaryRoute: 'explorer'
  },
  {
    id: 'admin',
    name: 'Admin Role Governance Panel',
    description: 'System-wide role governance, cryptographic authority management, and user registry',
    allowed: ['admin'],
    primaryRoute: 'admin'
  }
];

export function normalizeRole(role) {
  const r = (role || 'guest').toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('issuer') || r.includes('govt')) return 'issuer';
  if (r.includes('verifier') || r.includes('hotel')) return 'verifier';
  if (r.includes('user') || r.includes('citizen') || r.includes('holder')) return 'user';
  return 'guest';
}

export function hasModuleAccess(role, moduleId) {
  const cleanRole = normalizeRole(role);
  const mod = RBAC_MODULES.find((m) => m.id === moduleId);
  if (!mod) return true;
  return mod.allowed.includes(cleanRole);
}

export function canAccessRoute(role, isAuthenticated, route) {
  const cleanRole = !isAuthenticated ? 'guest' : normalizeRole(role);

  // Public Routes (Accessible by all including Guest)
  if (['landing', 'how-it-works', 'login'].includes(route)) {
    return true;
  }

  // Unauthenticated visitors are redirected for non-public routes
  if (!isAuthenticated && cleanRole === 'guest') {
    return false;
  }

  // Route-to-RBAC Matrix Enforcement
  if (['dashboard', 'wallet', 'credentials', 'credential-detail'].includes(route)) {
    return ['user', 'issuer', 'admin'].includes(cleanRole);
  }
  if (['verify', 'verification-result'].includes(route)) {
    return ['verifier', 'issuer', 'admin'].includes(cleanRole);
  }
  if (['issue'].includes(route)) {
    return ['issuer', 'admin'].includes(cleanRole);
  }
  if (['explorer', 'blockchain'].includes(route)) {
    return ['user', 'verifier', 'issuer', 'admin'].includes(cleanRole);
  }
  if (['admin'].includes(route)) {
    return cleanRole === 'admin';
  }
  if (['profile', 'settings', 'activity'].includes(route)) {
    return isAuthenticated;
  }

  return true;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState('landing');
  const [credentials, setCredentials] = useState([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [lastVerificationResult, setLastVerificationResult] = useState(null);

  // Authentication & Session State
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // User Profile loaded from Supabase
  const [userProfile, setUserProfile] = useState(DEFAULT_GUEST_PROFILE);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (route, params = {}) => {
    if (params.credentialId) {
      setSelectedCredentialId(params.credentialId);
    }
    if (params.verificationResult) {
      setLastVerificationResult(params.verificationResult);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to load Supabase Profile
  const loadUserProfileFromSupabase = useCallback(async (supabaseUser) => {
    if (!supabaseUser) return;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('[Supabase Profile] fetch error:', error);
      }

      const role = (profile?.role || supabaseUser.user_metadata?.role || 'user').toLowerCase();
      const fullName = profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User';
      const phone = profile?.phone || supabaseUser.user_metadata?.phone || '';
      const passportNumber = profile?.passport_number || '';
      const did = `did:veri:80002:0x${supabaseUser.id.replace(/-/g, '').substring(0, 24)}`;
      const avatar = profile?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`;

      setUserProfile({
        name: fullName,
        email: supabaseUser.email,
        phone,
        passportNumber,
        avatar,
        did,
        role
      });
    } catch (err) {
      console.error('[Supabase Profile] uncaught error:', err);
    }
  }, []);

  // Fetch real credentials from Express ledger
  const fetchCredentials = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const adaptedList = data.map(adaptCredential);
          setCredentials(adaptedList);
          if (adaptedList.length > 0) {
            setSelectedCredentialId((prev) => {
              const exists = adaptedList.some((c) => c.id === prev);
              return exists ? prev : adaptedList[0].id;
            });
          } else {
            setSelectedCredentialId(null);
          }
          return;
        }
      }
      setCredentials([]);
    } catch (err) {
      console.warn('[Fetch Credentials] Network notice:', err.message);
      setCredentials([]);
    }
  }, []);

  // Fetch real blocks from Express ledger
  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blocks`);
      if (res.ok) {
        const data = await res.json();
        if (data.blocks && Array.isArray(data.blocks)) {
          const validBlocks = data.blocks.filter((b) => b.action !== 'GENESIS');
          const mappedActivities = validBlocks.slice(0, 20).map((b, idx) => ({
            id: `act-${b.index || idx}`,
            type: b.action === 'CREDENTIAL_ISSUED' ? 'issuance' : (b.action === 'CREDENTIAL_REVOKED' ? 'revocation' : 'verification'),
            title: b.action === 'CREDENTIAL_ISSUED' ? 'Credential Issuance' : (b.action === 'CREDENTIAL_REVOKED' ? 'Credential Revoked' : 'Block Anchor'),
            subtitle: `Block #${b.index} • ${b.did || 'did:verichain'}`,
            timestamp: new Date(b.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            badgeText: b.action === 'CREDENTIAL_ISSUED' ? 'Issued' : (b.action === 'CREDENTIAL_REVOKED' ? 'Revoked' : 'Confirmed'),
            badgeType: b.action === 'CREDENTIAL_ISSUED' ? 'issued' : (b.action === 'CREDENTIAL_REVOKED' ? 'revoked' : 'verified'),
            credentialTitle: b.credentialId || 'Identity Record',
            hash: b.hash ? `${b.hash.substring(0, 10)}...${b.hash.substring(b.hash.length - 8)}` : '0x...'
          }));
          setActivities(mappedActivities);
        }
      }
    } catch (err) {
      console.warn('[Fetch Blocks] Network notice:', err.message);
    }
  }, []);

  // Initial Supabase Session Detection & Auth Listener
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data && data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsAuthenticated(true);
          await loadUserProfileFromSupabase(data.session.user);
        } else {
          setIsAuthenticated(false);
          setUserProfile(DEFAULT_GUEST_PROFILE);
        }

        await fetchCredentials();
        await fetchBlocks();
      } catch (err) {
        console.error('[Auth Init] Error checking session:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    initSession();

    // Subscribe to Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
        setIsAuthenticated(true);
        await loadUserProfileFromSupabase(newSession.user);
        await fetchCredentials();
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        setUserProfile(DEFAULT_GUEST_PROFILE);
        setCredentials([]);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [loadUserProfileFromSupabase, fetchCredentials, fetchBlocks]);

  // Real Supabase Email/Password Login
  const loginWithSupabase = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      throw error;
    }

    if (data && data.user) {
      setSession(data.session);
      setUser(data.user);
      setIsAuthenticated(true);
      await loadUserProfileFromSupabase(data.user);
      await fetchCredentials();
      showToast(`Welcome back, ${data.user.email}!`, 'success');
      navigateTo('dashboard');
      return { success: true, user: data.user };
    }
  };

  // Real Supabase Account Registration with Profiles Table sync
  const registerWithSupabase = async ({ email, password, fullName, phone, role }) => {
    const cleanEmail = email.trim().toLowerCase();
    const dbRole = (role || 'user').toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          role: dbRole
        }
      }
    });

    if (error) throw error;

    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName,
          phone: phone || '',
          role: dbRole,
          updated_at: new Date().toISOString()
        });
      } catch (upsertErr) {
        console.warn('[Profiles Upsert Notice]:', upsertErr);
      }

      showToast('Account registered successfully! Signing you in...', 'success');
      setSession(data.session);
      setUser(data.user);
      setIsAuthenticated(true);
      await loadUserProfileFromSupabase(data.user);
      await fetchCredentials();
      navigateTo('dashboard');
      return { success: true, user: data.user };
    }
  };

  // Unified Sign Out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase SignOut Notice]:', err);
    }

    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
    setUserProfile(DEFAULT_GUEST_PROFILE);
    setCredentials([]);
    setSelectedCredentialId(null);
    setActivities([]);
    showToast('You have been securely signed out.', 'info');
    navigateTo('landing');
  };

  // Issue Credential to Express / Supabase Ledger
  const addCredential = async (newCred) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderName: newCred.holderName || userProfile?.name || 'Authorized Holder',
          userEmail: newCred.userEmail || userProfile?.email || null,
          userId: user?.id || null,
          idType: newCred.title || newCred.idType || 'Tourism Access Pass',
          idNumber: newCred.identifierNumber || newCred.idNumber || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
          nationality: newCred.nationality || 'Indian',
          validUntil: newCred.expiryDate || newCred.validUntil || '2028-12-31',
          issuer: newCred.issuer || userProfile?.name || 'VeriChain Ministry Authority'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const adapted = adaptCredential({
          ...data.credential,
          hash: data.credentialHash,
          blockNumber: data.block?.index
        });

        setCredentials((prev) => [adapted, ...prev]);

        const newActivity = {
          id: 'act-' + Date.now(),
          type: 'issuance',
          title: `${adapted.title} Issuance`,
          subtitle: `${adapted.issuer} Authority`,
          timestamp: 'Just now',
          badgeText: 'Issued',
          badgeType: 'issued',
          credentialTitle: adapted.title,
          hash: (adapted.blockchainTx || '').substring(0, 12) + '...'
        };
        setActivities((prev) => [newActivity, ...prev]);
        showToast(`Successfully anchored ${adapted.title} to ledger`, 'success');
        return adapted;
      } else {
        throw new Error(data.error || 'Server rejected credential issuance');
      }
    } catch (err) {
      console.error('[Credential Issuance Error]:', err);
      showToast(`Issuance failed: ${err.message}`, 'danger');
      throw err;
    }
  };

  // Revoke Credential on Express / Supabase Ledger
  const revokeCredential = async (credentialId, reason = 'Administrative revocation') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/credentials/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: credentialId, reason })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCredentials((prev) =>
          prev.map((c) => {
            if (c.id === credentialId) {
              const updatedRaw = { ...(c.rawPayload || {}), isRevoked: true };
              return {
                ...c,
                status: 'Revoked',
                revocationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                revocationReason: reason,
                qrPayload: JSON.stringify(updatedRaw),
                rawPayload: updatedRaw
              };
            }
            return c;
          })
        );

        const newActivity = {
          id: 'act-' + Date.now(),
          type: 'revocation',
          title: 'Credential Revoked',
          subtitle: `${credentialId} • ${reason}`,
          timestamp: 'Just now',
          badgeText: 'Revoked',
          badgeType: 'revoked',
          credentialTitle: credentialId,
          hash: (data.block?.hash || '0xrevoked').substring(0, 12) + '...'
        };
        setActivities((prev) => [newActivity, ...prev]);
        showToast(`Credential ${credentialId} revoked on-chain`, 'warning');
        return true;
      } else {
        throw new Error(data.error || 'Server failed to record revocation');
      }
    } catch (err) {
      console.error('[Credential Revocation Error]:', err);
      showToast(`Revocation failed: ${err.message}`, 'danger');
      throw err;
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Change user role dynamically and persist directly to Supabase
  const changeUserRole = async (newRole) => {
    const cleanRole = (newRole || 'user').toLowerCase();
    
    // Update local state immediately
    setUserProfile((prev) => ({
      ...(prev || DEFAULT_GUEST_PROFILE),
      role: cleanRole
    }));

    // If signed into Supabase, persist to profiles table
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            role: cleanRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.warn('[Supabase Role Update Notice]:', error);
          showToast(`Role updated locally (${cleanRole}), database sync notice: ${error.message}`, 'warning');
        } else {
          showToast(`Role updated to ${cleanRole.toUpperCase()} & saved in Supabase!`, 'success');
        }
      } catch (err) {
        console.error('[Supabase Role Update Error]:', err);
        showToast(`Role updated locally to ${cleanRole.toUpperCase()}`, 'info');
      }
    } else {
      showToast(`Active demo role switched to ${cleanRole.toUpperCase()} (Demo Mode)`, 'info');
    }
  };

  const selectedCredential =
    credentials.find((c) => c.id === selectedCredentialId) || credentials[0] || null;

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        navigateTo,
        credentials,
        selectedCredential,
        selectedCredentialId,
        setSelectedCredentialId,
        addCredential,
        revokeCredential,
        activities,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        userProfile,
        setUserProfile,
        changeUserRole,
        session,
        user,
        authLoading,
        isAuthenticated,
        loginWithSupabase,
        registerWithSupabase,
        logout,
        fetchCredentials,
        fetchBlocks,
        toasts,
        showToast,
        removeToast,
        lastVerificationResult,
        setLastVerificationResult
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
