import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dgsljqltsotzaeeqvidw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2xqcWx0c290emFlZXF2aWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTQwNjYsImV4cCI6MjEwMzE3MDA2Nn0.iZzfoEsUOzFYhvu14Ljd6yvGGAgHkJdIBQe06O3VslY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const LEDGER_FILE = path.join(process.cwd(), 'ledger_store.json');

class BlockchainLedger {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.credentials = new Map(); // id -> credentialData
    this.revocations = new Set();  // id
    this.loadFromSupabase();
  }

  async loadFromSupabase() {
    try {
      // Ensure Genesis Block 0 exists in Supabase
      const genesis = this.createGenesisBlock();
      await supabase.from('blocks').upsert({
        index: 0,
        timestamp: genesis.timestamp,
        action: genesis.action,
        credential_id: null,
        credential_hash: genesis.credentialHash,
        did: genesis.did,
        previous_hash: genesis.previousHash,
        hash: genesis.hash
      }, { onConflict: 'index' });

      // 1. Fetch all blocks from Supabase 'blocks' table
      const { data: dbBlocks } = await supabase.from('blocks').select('*').order('index', { ascending: true });
      if (dbBlocks && dbBlocks.length > 0) {
        // Guarantee Genesis block 0 is at the start
        const mappedBlocks = dbBlocks.map(b => ({
          index: b.index,
          timestamp: b.timestamp,
          action: b.action,
          credentialId: b.credential_id,
          credentialHash: b.credential_hash,
          did: b.did,
          previousHash: b.previous_hash,
          hash: b.hash
        }));

        const hasGenesis = mappedBlocks.some(b => b.index === 0);
        if (!hasGenesis) {
          this.chain = [genesis, ...mappedBlocks];
        } else {
          this.chain = mappedBlocks;
        }
      } else {
        this.chain = [genesis];
      }

      // 2. Fetch credentials from Supabase 'issued_credentials' table
      const { data: dbCreds } = await supabase.from('issued_credentials').select('*');
      if (dbCreds && dbCreds.length > 0) {
        dbCreds.forEach(c => {
          this.credentials.set(c.id, c.payload);
          if (c.is_revoked) this.revocations.add(c.id);
        });
      }
      console.log(`[Supabase Ledger] Loaded ${this.chain.length} blocks and ${this.credentials.size} credentials.`);
    } catch (err) {
      console.error('[Supabase Ledger] Fallback to disk load:', err);
      this.loadFromDisk();
    }
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(LEDGER_FILE)) {
        const raw = fs.readFileSync(LEDGER_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.chain && data.chain.length > 0) this.chain = data.chain;
        if (data.credentials) this.credentials = new Map(data.credentials);
        if (data.revocations) this.revocations = new Set(data.revocations);
      }
    } catch (err) {
      console.error('[Ledger Disk] Error loading disk file:', err);
    }
  }

  async saveBlockToSupabase(block, credentialPayload = null) {
    try {
      // Upsert block record into Supabase
      await supabase.from('blocks').upsert({
        index: block.index,
        timestamp: block.timestamp,
        action: block.action,
        credential_id: block.credentialId || null,
        credential_hash: block.credentialHash || null,
        did: block.did || null,
        previous_hash: block.previousHash,
        hash: block.hash
      });

      // Upsert credential payload if issuing
      if (credentialPayload) {
        await supabase.from('issued_credentials').upsert({
          id: credentialPayload.id,
          did: credentialPayload.did,
          holder_name: credentialPayload.holderName,
          user_email: credentialPayload.userEmail || null,
          user_id: credentialPayload.userId || null,
          payload: credentialPayload,
          is_revoked: false,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[Supabase Ledger Save Error]:', err);
    }
  }

  createGenesisBlock() {
    return {
      index: 0,
      timestamp: new Date('2026-08-23T00:00:00Z').toISOString(),
      action: 'GENESIS',
      credentialHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      did: 'did:verichain:root',
      previousHash: '0',
      hash: this.calculateBlockHash(0, '2026-08-23T00:00:00Z', 'GENESIS', '0x00', 'did:verichain:root', '0')
    };
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  calculateBlockHash(index, timestamp, action, credentialHash, did, previousHash) {
    return '0x' + crypto
      .createHash('sha256')
      .update(index + timestamp + action + credentialHash + did + previousHash)
      .digest('hex');
  }

  computeCredentialHash(credentialPayload) {
    // Sort keys to ensure deterministic hashing
    const sortedString = JSON.stringify(credentialPayload, Object.keys(credentialPayload).sort());
    return '0x' + crypto.createHash('sha256').update(sortedString).digest('hex');
  }

  issueCredential(credential) {
    const { id, holderName, userEmail, userId, idType, idNumber, nationality, validUntil, issuer } = credential;
    
    const did = `did:verichain:${crypto.createHash('md5').update(idNumber + holderName).digest('hex').substring(0, 12)}`;
    const issueDate = new Date().toISOString().split('T')[0];

    const fullCredentialPayload = {
      id,
      did,
      holderName,
      userEmail: userEmail || null,
      userId: userId || null,
      idType,
      idNumber,
      nationality,
      issueDate,
      validUntil,
      issuer: issuer || 'Ministry of Tourism & Civil Aviation'
    };

    const credentialHash = this.computeCredentialHash(fullCredentialPayload);

    // Save to DB store
    this.credentials.set(id, fullCredentialPayload);

    // Add Block to Chain
    const previousBlock = this.getLatestBlock();
    const newBlock = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      action: 'CREDENTIAL_ISSUED',
      credentialId: id,
      credentialHash,
      did,
      previousHash: previousBlock.hash,
      hash: ''
    };
    newBlock.hash = this.calculateBlockHash(
      newBlock.index,
      newBlock.timestamp,
      newBlock.action,
      newBlock.credentialHash,
      newBlock.did,
      newBlock.previousHash
    );

    this.chain.push(newBlock);
    this.saveBlockToSupabase(newBlock, fullCredentialPayload);

    return {
      credential: fullCredentialPayload,
      credentialHash,
      block: newBlock
    };
  }

  revokeCredential(id, reason) {
    if (!this.credentials.has(id)) {
      throw new Error(`Credential with ID ${id} not found.`);
    }

    this.revocations.add(id);
    const credential = this.credentials.get(id);

    const previousBlock = this.getLatestBlock();
    const newBlock = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      action: 'CREDENTIAL_REVOKED',
      credentialId: id,
      reason: reason || 'Revoked by Issuer',
      credentialHash: this.computeCredentialHash(credential),
      did: credential.did,
      previousHash: previousBlock.hash,
      hash: ''
    };

    newBlock.hash = this.calculateBlockHash(
      newBlock.index,
      newBlock.timestamp,
      newBlock.action,
      newBlock.credentialHash,
      newBlock.did,
      newBlock.previousHash
    );

    this.chain.push(newBlock);
    this.saveBlockToSupabase(newBlock);
    
    // Update revoked status in Supabase
    supabase.from('issued_credentials')
      .update({ is_revoked: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .then(() => {})
      .catch(() => {});

    return newBlock;
  }

  verifyCredential(credentialPayload) {
    if (!credentialPayload || !credentialPayload.id) {
      return {
        status: 'INVALID',
        valid: false,
        message: 'Invalid credential payload structure.',
        computedHash: '0x0',
        storedHash: null,
        isRevoked: false,
        tampered: true
      };
    }

    const { id } = credentialPayload;

    // Check if ID exists
    const stored = this.credentials.get(id);

    // 1. Calculate presented hash
    const computedHash = this.computeCredentialHash(credentialPayload);

    // 2. Check if revoked
    const isRevoked = this.revocations.has(id);
    if (isRevoked) {
      return {
        status: 'REVOKED',
        valid: false,
        message: 'Credential has been revoked by the issuing authority.',
        computedHash,
        storedHash: stored ? this.computeCredentialHash(stored) : null,
        isRevoked: true,
        tampered: false
      };
    }

    // 3. Find block issuance record
    const issueBlock = this.chain.find(
      (b) => b.action === 'CREDENTIAL_ISSUED' && b.credentialId === id
    );

    if (!issueBlock) {
      return {
        status: 'INVALID',
        valid: false,
        message: 'Credential record not found on the VeriChain blockchain.',
        computedHash,
        storedHash: null,
        isRevoked: false,
        tampered: true
      };
    }

    // 4. Check hash match against stored on-chain hash
    const isHashValid = computedHash === issueBlock.credentialHash;

    if (!isHashValid) {
      return {
        status: 'TAMPERED',
        valid: false,
        message: 'Cryptographic hash mismatch! The credential data has been altered or tampered with.',
        computedHash,
        storedHash: issueBlock.credentialHash,
        isRevoked: false,
        tampered: true
      };
    }

    return {
      status: 'VALID',
      valid: true,
      message: 'Authentic Credential! Verified on-chain hash & zero revocation flags.',
      computedHash,
      storedHash: issueBlock.credentialHash,
      isRevoked: false,
      tampered: false,
      blockNumber: issueBlock.index,
      blockHash: issueBlock.hash
    };
  }

  getAllCredentials() {
    return Array.from(this.credentials.values()).map(cred => ({
      ...cred,
      isRevoked: this.revocations.has(cred.id),
      hash: this.computeCredentialHash(cred)
    }));
  }

  getHolderCredentials(did) {
    return this.getAllCredentials().filter(c => c.did === did || did === 'all');
  }

  getBlocks() {
    return [...this.chain].reverse(); // Latest blocks first
  }
}

export const ledger = new BlockchainLedger();

