import crypto from 'crypto';

class BlockchainLedger {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.credentials = new Map(); // id -> credentialData
    this.revocations = new Set();  // id
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
    const { id, holderName, idType, idNumber, nationality, validUntil, issuer } = credential;
    
    const did = `did:verichain:${crypto.createHash('md5').update(idNumber + holderName).digest('hex').substring(0, 12)}`;
    const issueDate = new Date().toISOString().split('T')[0];

    const fullCredentialPayload = {
      id,
      did,
      holderName,
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

    return newBlock;
  }

  verifyCredential(credentialPayload) {
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

// Seed initial sample tourist credential for quick instant testing demo
ledger.issueCredential({
  id: 'VC-2026-88492',
  holderName: 'Aarav Sharma',
  idType: 'Aadhaar / Passport',
  idNumber: 'IND-9874-3210-55',
  nationality: 'Indian',
  validUntil: '2027-12-31',
  issuer: 'Incredible India Tourism Board'
});

ledger.issueCredential({
  id: 'VC-2026-11930',
  holderName: 'Elena Rostova',
  idType: 'Foreign Passport',
  idNumber: 'PASSPORT-RU-440219',
  nationality: 'Russian',
  validUntil: '2026-10-15',
  issuer: 'Goa State Tourism Department'
});
