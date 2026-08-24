import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ledger } from './ledger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(distPath));

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
