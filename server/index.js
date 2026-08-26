import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ledger } from './ledger.js';
import { sendEmail } from './brevo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

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

  const result = await sendEmail({
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

// 1. Issue Credential
app.post('/api/credentials/issue', (req, res) => {
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
      issuer: issuer || 'Ministry of Tourism & Public Safety'
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

// 2. Fetch Credentials (Holder or All)
app.get('/api/credentials', (req, res) => {
  const { did } = req.query;
  if (did) {
    return res.json(ledger.getHolderCredentials(did));
  }
  res.json(ledger.getAllCredentials());
});

// 3. Verify Credential Payload
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

// 4. Revoke Credential
app.post('/api/credentials/revoke', (req, res) => {
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

// 5. Public Blockchain Explorer / Audit Stream
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
