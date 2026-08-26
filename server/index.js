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
  const { email, fullName, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email.toLowerCase(), { otp: generatedOtp, expiresAt, pendingUser: { email, fullName, password } });

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

  res.json({ success: true, message: 'OTP sent successfully to your email.', ...result });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ error: 'OTP not found or expired. Please request a new OTP.' });

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP code. Please check your email and try again.' });
  }

  // OTP match verified!
  otpStore.delete(email.toLowerCase());
  res.json({ success: true, message: 'OTP verified successfully!' });
});

app.post('/api/auth/send-reset-email', async (req, res) => {
  const { email } = req.body;
  const result = await sendEmail({
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
  res.json(result);
});

// API Routes

// 1. Issue Credential
app.post('/api/credentials/issue', (req, res) => {
  try {
    const { holderName, idType, idNumber, nationality, validUntil, issuer } = req.body;
    
    if (!holderName || !idNumber) {
      return res.status(400).json({ error: 'Holder Name and ID Number are required.' });
    }

    const id = `VC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const result = ledger.issueCredential({
      id,
      holderName,
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
