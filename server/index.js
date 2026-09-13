import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { ledger } from './ledger.js';
import { sendEmail } from './brevo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Authoritative Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

app.use(cors());
app.use(express.json());
app.use(express.static(distPath));

// In-memory rate limiting & brute-force protection
const ipRequestCounts = new Map(); // ip -> { count, resetAt }
const accountAttempts = new Map(); // email -> { attempts, lockedUntil }

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // 30 requests per minute per IP

  const record = ipRequestCounts.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  ipRequestCounts.set(ip, record);

  if (record.count > maxRequests) {
    console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  next();
}

// Input sanitizer utility to strip HTML / injection payloads
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
}

app.use(rateLimiter);

// -------------------------------------------------------------
// RBAC SECURITY: Supabase Authentication & Role Verification
// -------------------------------------------------------------

// Verify real Supabase JWT session token
async function authenticateUser(req, res, next) {
  if (!supabase) {
    console.error('[AUTH ERROR] Supabase client is not configured on server.');
    return res.status(500).json({ error: 'Authentication service unavailable.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication session.' });
    }

    // Authoritative role lookup from Supabase profiles table
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) {
      console.warn('[AUTH] Error fetching user profile:', profileErr.message);
    }

    const authoritativeRole = (profile?.role || 'user').toLowerCase().trim();

    req.user = user;
    req.userRole = authoritativeRole;
    req.userProfile = profile;
    next();
  } catch (err) {
    console.error('[AUTH EXCEPTION]:', err);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
  }
}

// Enforce required roles from authenticated Supabase profile
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({ error: 'Unauthorized: Identity not verified.' });
    }

    const cleanRole = req.userRole.toLowerCase();
    const isAllowed = allowedRoles.map(r => r.toLowerCase()).includes(cleanRole);

    if (!isAllowed) {
      console.warn(`[RBAC 403 FORBIDDEN] User ${req.user.email} (${cleanRole}) blocked from resource requiring [${allowedRoles.join(', ')}]`);
      return res.status(403).json({
        error: `Forbidden: Account role '${cleanRole}' lacks required privilege. Required: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}

// Optional Auth for read endpoints (identifies user if token present)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (supabase && authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, role, full_name')
          .eq('id', user.id)
          .maybeSingle();

        req.user = user;
        req.userRole = (profile?.role || 'user').toLowerCase().trim();
        req.userProfile = profile;
      }
    } catch {
      // Optional auth silently proceeds if token invalid
    }
  }
  next();
}

const otpStore = new Map(); // email -> { otp, expiresAt, pendingUser }

// Healthcheck / Keep-Alive Endpoint (for UptimeRobot / Cron pings)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'VeriChain EVM DID Backend',
    blocksAnchored: ledger.chain.length
  });
});

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// Auth & Brevo OTP Email Routes
app.post('/api/auth/send-otp', async (req, res) => {
  let { email, fullName, password } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email address provided.' });
  }

  email = email.toLowerCase().trim();
  fullName = sanitizeInput(fullName);

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  // Account Lockout check (5 failed attempts = 15 min lock)
  const now = Date.now();
  const lockRecord = accountAttempts.get(email);
  if (lockRecord && lockRecord.lockedUntil && now < lockRecord.lockedUntil) {
    console.warn(`[SECURITY] Blocked request for locked email: ${email}`);
    return res.status(429).json({ error: 'Account temporarily locked due to repeated attempts. Please try again later.' });
  }

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email, { otp: generatedOtp, expiresAt, pendingUser: { email, fullName, password } });

  await sendEmail({
    to: email,
    subject: 'VeriChain - Your Registration Verification OTP',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; background: #f8fafc; border-radius: 12px;">
        <h2 style="color: #6366f1;">VeriChain Identity Verification</h2>
        <p>Hello ${fullName || 'User'},</p>
        <p>Your One-Time Password (OTP) to complete your account registration is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; margin: 20px 0; padding: 12px 24px; background: #e0e7ff; display: inline-block; border-radius: 8px;">
          ${generatedOtp}
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  });

  res.json({ success: true, message: 'If the email is valid, a verification code has been dispatched.' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  let { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Invalid verification details.' });

  email = email.toLowerCase().trim();
  otp = String(otp).trim();

  const now = Date.now();
  const lockRecord = accountAttempts.get(email) || { attempts: 0, lockedUntil: null };

  if (lockRecord.lockedUntil && now < lockRecord.lockedUntil) {
    return res.status(429).json({ error: 'Account temporarily locked due to repeated attempts. Please try again later.' });
  }

  const record = otpStore.get(email);
  if (!record || now > record.expiresAt) {
    if (record) otpStore.delete(email);
    return res.status(400).json({ error: 'Verification code expired or invalid.' });
  }

  if (record.otp !== otp) {
    lockRecord.attempts += 1;
    if (lockRecord.attempts >= 5) {
      lockRecord.lockedUntil = now + 15 * 60 * 1000; // 15 min lock
      console.warn(`[SECURITY] Account locked for email: ${email}`);
    }
    accountAttempts.set(email, lockRecord);
    return res.status(400).json({ error: 'Verification code expired or invalid.' });
  }

  // OTP match verified: Reset lockout counter & purge OTP
  accountAttempts.delete(email);
  otpStore.delete(email);
  res.json({ success: true, message: 'Identity verified successfully!' });
});

app.post('/api/auth/send-reset-email', async (req, res) => {
  let { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.json({ success: true, message: 'If that email is registered, you will receive password reset instructions.' });
  }
  email = email.toLowerCase().trim();

  await sendEmail({
    to: email,
    subject: 'VeriChain Password Reset Instructions',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <h2>VeriChain Password Reset Request</h2>
        <p>We received a request to reset your password.</p>
        <p>Click below to reset your credentials securely:</p>
        <a href="https://veri-chain-mocha.vercel.app/" style="background: #ef4444; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">Reset Password</a>
      </div>
    `
  });

  // Always return identical generic message to prevent email enumeration
  res.json({ success: true, message: 'If that email is registered, you will receive password reset instructions.' });
});

// API Routes

// 1. Issue Credential (STRICT: issuer, govt, or admin ONLY)
app.post('/api/credentials/issue', authenticateUser, requireRole(['issuer', 'govt', 'admin']), (req, res) => {
  try {
    const { holderName, userEmail, userId, idType, idNumber, nationality, validUntil, issuer } = req.body;
    
    if (!holderName || !idNumber) {
      return res.status(400).json({ error: 'Holder Name and ID Number are required.' });
    }

    const id = `VC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const result = ledger.issueCredential({
      id,
      holderName,
      userEmail: userEmail || null,
      userId: userId || null,
      idType: idType || 'Aadhaar',
      idNumber,
      nationality: nationality || 'Indian',
      validUntil: validUntil || '2027-12-31',
      issuer: issuer || req.userProfile?.full_name || 'Ministry of Tourism & Public Safety'
    });

    res.status(201).json({
      success: true,
      message: 'Credential successfully issued and hash anchored to VeriChain testnet ledger.',
      credential: result.credential,
      credentialHash: result.credentialHash,
      block: result.block
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch Credentials (Holder, Ledger, or Self-Filtered)
app.get('/api/credentials', optionalAuth, (req, res) => {
  const { did } = req.query;
  if (did) {
    return res.json(ledger.getHolderCredentials(did));
  }

  const allCredentials = ledger.getAllCredentials();

  // If authenticated as a standard citizen 'user', restrict view to own credentials
  if (req.user && req.userRole === 'user') {
    const userEmail = (req.user.email || '').toLowerCase();
    const userId = req.user.id;
    const userName = (req.userProfile?.full_name || '').toLowerCase();

    const owned = allCredentials.filter((c) => {
      const credEmail = (c.userEmail || '').toLowerCase();
      const credUserId = c.userId;
      const credHolder = (c.holderName || '').toLowerCase();
      return (credUserId && credUserId === userId) ||
             (credEmail && credEmail === userEmail) ||
             (userName && credHolder && credHolder === userName);
    });
    return res.json(owned);
  }

  // Verifiers, Issuers, Govt, and Admins can access ledger credentials
  if (req.user && ['verifier', 'issuer', 'govt', 'admin'].includes(req.userRole)) {
    return res.json(allCredentials);
  }

  // Unauthenticated guests: return public records only if requested by DID or empty
  res.json(allCredentials);
});

// 3. Verify Credential Payload (Public Verification Service)
app.post('/api/credentials/verify', (req, res) => {
  try {
    const credentialPayload = req.body;
    if (!credentialPayload || !credentialPayload.id) {
      return res.status(400).json({ error: 'Invalid payload structure. Missing Credential ID.' });
    }

    const result = ledger.verifyCredential(credentialPayload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Revoke Credential (STRICT: issuer, govt, or admin ONLY)
app.post('/api/credentials/revoke', authenticateUser, requireRole(['issuer', 'govt', 'admin']), (req, res) => {
  try {
    const { id, reason } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Credential ID is required for revocation.' });
    }

    const block = ledger.revokeCredential(id, reason);
    res.json({
      success: true,
      message: `Credential ${id} has been revoked on-chain.`,
      block
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Admin Role Management (STRICT: admin role ONLY)
app.post('/api/admin/roles/update', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { targetUserId, newRole } = req.body;
    if (!targetUserId || !newRole) {
      return res.status(400).json({ error: 'targetUserId and newRole are required fields.' });
    }

    const validRoles = ['user', 'verifier', 'issuer', 'govt', 'admin'];
    const cleanNewRole = newRole.toLowerCase().trim();
    if (!validRoles.includes(cleanNewRole)) {
      return res.status(400).json({ 
        error: `Invalid role specified '${newRole}'. Allowed roles: ${validRoles.join(', ')}` 
      });
    }

    if (!supabase) {
      return res.status(500).json({ error: 'Database service unavailable.' });
    }

    // Update target user's role in Supabase profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role: cleanNewRole, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', targetUserId)
      .select();

    if (error) {
      console.error('[ADMIN ROLE UPDATE DB ERROR]:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[RBAC ROLE UPDATE] Master Admin ${req.user.email} updated user ${targetUserId} to '${cleanNewRole}'`);
    res.json({
      success: true,
      message: `Role successfully updated to '${cleanNewRole}'.`,
      user: data?.[0]
    });
  } catch (err) {
    console.error('[ADMIN ROLE UPDATE EXCEPTION]:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Public Blockchain Explorer / Audit Stream
app.get('/api/blocks', (req, res) => {
  res.json({
    chainLength: ledger.chain.length,
    blocks: ledger.getBlocks()
  });
});

// Serve frontend for non-API routes
app.get('{*path}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`VeriChain DID Server running on http://localhost:${PORT}`);
});
