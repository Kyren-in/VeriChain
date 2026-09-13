# VeriChain V1 vs V2 — READ-ONLY COMPARISON AUDIT

## Goal

Compare my existing **V1** against the current local **V2** before making any changes.

V1 is the reference for infrastructure that previously worked.
V2 is the local project you already have access to.

This task is **AUDIT ONLY**.

DO NOT:
- modify files
- add code
- remove code
- refactor
- fix bugs
- install packages
- change dependencies
- change environment variables
- change Supabase/database
- change authentication
- change APIs
- change blockchain
- change UI
- deploy
- push to GitHub

Do not implement anything. Produce a report only.

---

# V1 SOURCES

## GitHub

https://github.com/Kyren-in/VeriChain

This is the V1 code reference. Inspect the actual repository, not just README.

Relevant areas include:

- src/
- server/
- package.json
- vite.config.js
- vercel.json
- render.yaml
- start.js
- README.md
- all relevant services/components/routes

## V1 production website

https://veri-chain-mocha.vercel.app/

Use it only to understand observable V1 behavior/UI.

Do not modify or attack the production site.

---

# V1 DATABASE REFERENCE

V1 Supabase contains these known tables:

## profiles
- id
- email
- full_name
- role
- updated_at

`profiles.id` is linked to `auth.users.id`.

## issued_credentials
- id
- did
- holder_name
- user_email
- user_id
- payload (jsonb)
- is_revoked
- updated_at

## blocks
- index
- timestamp
- action
- credential_id
- credential_hash
- did
- previous_hash
- hash

This is reference information only. Verify actual usage from code.

---

# V1 INFRASTRUCTURE REFERENCE

V1 was configured around:

- React + Vite
- Node.js + Express
- Supabase Auth/PostgreSQL
- Polygon Amoy
- Ethers.js
- Brevo
- QRCode.js
- HTML5-QRCode

The V1 README describes:

- Holder/User
- Verifier
- Issuer/Authority
- Administrator
- DID credential issuance
- credential revocation
- QR verification
- blockchain/hash verification
- Supabase persistence
- Brevo email/OTP

IMPORTANT:
Documentation is NOT proof that functionality works. Verify from code.

---

# V2 SOURCE

The V2 local codebase is already available in this Antigravity workspace.

Use it as the V2 source of truth.

---

# SECRET SAFETY

NEVER print:

- API keys
- passwords
- access tokens
- refresh tokens
- private keys
- service-role keys
- secret environment values
- cookies

You may report environment-variable NAMES, provider, purpose, and whether they are used.

---

# 1. ARCHITECTURE COMPARISON

Audit both versions.

Determine:

- frontend
- backend
- database
- authentication
- blockchain
- QR
- email
- APIs
- important services
- important server routes
- important frontend services

Use:

| Area | V1 | V2 | Difference | Status |
|---|---|---|---|---|
| Frontend | | | | |
| Backend | | | | |
| Auth | | | | |
| Database | | | | |
| Blockchain | | | | |
| QR | | | | |
| Email | | | | |
| Credentials | | | | |
| Revocation | | | | |

Status:
REAL / PARTIAL / MOCK / HARDCODED / UNUSED / UNKNOWN

---

# 2. AUTHENTICATION

V2 currently auto-logs in locally. Find out EXACTLY why.

For V1 and V2 inspect:

- login
- signup if present
- Supabase Auth
- session creation
- session persistence
- logout
- protected routes
- role handling
- backend auth
- hardcoded users
- development bypasses
- localStorage/sessionStorage

Create:

| Auth Feature | V1 | V2 | Difference | Status |
|---|---|---|---|---|
| Login | | | | |
| Session | | | | |
| Logout | | | | |
| Protected routes | | | | |
| Roles | | | | |
| Auto-login | | | | |

For V2 auto-login explicitly classify:
REAL AUTH / DEVELOPMENT BYPASS / HARDCODED USER / MOCK / UNKNOWN

---

# 3. SUPABASE / DATABASE

Compare:

- client initialization
- Auth
- profiles
- issued_credentials
- blocks
- other tables
- queries
- inserts
- updates
- deletes
- activity
- revocation
- RLS-related code/policies if accessible

Answer:

1. Does V2 still use Supabase?
2. Does it use the V1 tables?
3. Did V2 replace real DB data with mock data?
4. Did V2 add tables?
5. Did V2 stop using V1 tables?
6. Is revocation actually persisted?

---

# 4. CREDENTIAL SYSTEM

Trace both versions:

Issue
→ DID/credential ID
→ payload
→ hash/signature
→ persistence
→ presentation
→ verification
→ revocation

Compare:

- DID generation
- credential ID
- payload
- SHA-256
- signatures
- issuer
- holder
- expiry
- persistence
- retrieval
- revocation

Use:

| Credential Feature | V1 | V2 | Difference | Status |
|---|---|---|---|---|

A UI card is NOT proof of a real credential. Trace its data source.

---

# 5. QR SYSTEM

Determine exactly what the QR contains in V1 and V2:

- raw data
- credential ID
- DID
- hash
- signed credential
- URL
- verification token
- mock value
- unknown

Also compare:

- generation
- camera scanning
- upload fallback
- manual verification input
- verification result

Use:

| QR Feature | V1 | V2 | Difference | Status |
|---|---|---|---|---|

---

# 6. VERIFICATION FLOW

Trace actual code for both versions:

QR/Input
→ parse
→ credential lookup
→ hash
→ signature verification
→ issuer verification
→ expiry
→ revocation
→ blockchain/ledger
→ result

For EACH step classify:

REAL / MOCK / HARDCODED / NOT IMPLEMENTED / UNKNOWN

Do not infer functionality from UI labels.

---

# 7. REVOCATION

Compare:

- who can revoke
- where revocation is stored
- DB update
- ledger/block update
- verifier status check
- whether old QR becomes invalid

Use:

| Revocation | V1 | V2 | Difference | Status |
|---|---|---|---|---|

---

# 8. BLOCKCHAIN / LEDGER

IMPORTANT:

A Polygon RPC URL does NOT prove Polygon is actually being used.

Inspect actual code.

For V1 and V2 determine:

- Polygon Amoy
- Ethers.js
- contract address
- ABI
- wallet/signing
- transaction submission
- transaction hash
- blockchain reads
- `blocks` table
- previous_hash
- hash calculation
- explorer source

Classify the implementation as:

REAL POLYGON
CUSTOM DATABASE HASH LEDGER
BOTH
MOCK
UNKNOWN

Use:

| Blockchain Feature | V1 | V2 | Difference | Status |
|---|---|---|---|---|
| Polygon RPC | | | | |
| Ethers.js | | | | |
| Contract | | | | |
| Real transactions | | | | |
| Transaction hash | | | | |
| Hash chain | | | | |
| blocks table | | | | |
| Explorer | | | | |

---

# 9. THIRDWEB

Determine whether Thirdweb is actually used:

- imports
- client
- wallet
- signing
- contract interaction
- transactions

If configured but unused, mark:
CONFIGURED BUT UNUSED

---

# 10. BREVO

Determine:

- whether used
- where used
- OTP/email flow
- triggers
- backend-only usage
- frontend secret exposure

NEVER display the API key.

Use:

| Email Feature | V1 | V2 | Difference | Status |
|---|---|---|---|---|

---

# 11. API COMPARISON

List important endpoints for both versions.

For each:

- method
- route
- purpose
- auth
- DB usage
- external service
- response
- caller

Use:

| API | V1 | V2 | Difference | Status |
|---|---|---|---|---|

---

# 12. FRONTEND FEATURE COMPARISON

Compare actual implemented features:

- Landing
- How It Works
- Dashboard
- Wallet
- Credentials
- Credential Detail
- Issue Credential
- QR Generation
- QR Verification
- Verification Result
- Revocation
- Activity
- Notifications
- Profile
- Settings
- Blockchain Explorer
- Issuer Portal
- Verifier Portal
- Admin functionality

Use:

| Feature | V1 | V2 | Change | Status |
|---|---|---|---|---|

Use statuses:
PRESERVED / IMPROVED / CHANGED / REMOVED / NEW / MOCK / BROKEN / UNKNOWN

---

# 13. DATA SOURCE AUDIT

For major screens/data determine whether the source is:

REAL SUPABASE
REAL API
REAL BLOCKCHAIN
LOCAL STORAGE
STATIC MOCK
HARDCODED
GENERATED AT RUNTIME
UNKNOWN

Use:

| Screen/Data | V1 Source | V2 Source | Difference |
|---|---|---|---|

Pay special attention to:
- credentials
- profiles
- roles
- activity
- blocks
- verification results
- revocation
- dashboard statistics
- notifications

---

# 14. V2 AI-GENERATED / UNNECESSARY ADDITIONS

Find V2 features/code/data that appear:

- not present in V1
- not required by the product
- duplicated
- decorative but non-functional
- fake/mock data presented as real
- unnecessary APIs
- unnecessary tables
- duplicate authentication
- duplicate components
- unused dependencies
- invented statistics
- invented users/credentials
- fake blockchain information
- unrelated features

DO NOT REMOVE ANYTHING.

Only report.

Use:

| V2 Addition | Evidence | Required? | Recommendation |
|---|---|---|---|

Recommendation:
KEEP / REVIEW / REMOVE LATER / UNKNOWN

---

# 15. V1 FEATURES LOST IN V2

Find V1 features that are:

- missing
- broken
- replaced with mock behavior
- replaced with hardcoded behavior
- disconnected from backend

Use:

| V1 Feature | V1 Implementation | V2 State | Risk |
|---|---|---|---|

---

# 16. V2 FEATURES WORTH KEEPING

List only genuine improvements.

Use:

| V2 Feature | Why Useful | Keep? |
|---|---|---|

Do not recommend something merely because it looks impressive.

---

# 17. ENVIRONMENT VARIABLES

Compare variable NAMES only.

NEVER show values.

Use:

| Variable | V1 | V2 | Used? | Purpose |
|---|---|---|---|---|

Classify:
USED / CONFIGURED BUT UNUSED / MISSING / UNKNOWN

---

# 18. DEPENDENCIES

Compare package.json/lockfiles.

Find:

- added dependencies
- removed dependencies
- unused dependencies
- duplicate libraries
- unnecessary libraries

Do NOT install/uninstall anything.

Use:

| Dependency | V1 | V2 | Purpose | Recommendation |
|---|---|---|---|---|

---

# 19. CODE STRUCTURE

Compare:

- src
- server
- API layer
- services
- components
- hooks
- utilities
- auth
- DB clients
- blockchain services

Identify:

- dead code
- duplicate code
- unused components
- duplicate auth
- duplicate API clients
- duplicate DB clients
- unnecessary abstractions

Do not modify anything.

---

# 20. SECURITY COMPARISON

Compare:

- authentication enforcement
- authorization
- role enforcement
- RLS
- API protection
- secret exposure
- private-key exposure
- PII handling
- client-side trust
- validation
- rate limiting
- OTP security
- XSS sanitization
- credential verification

Trace actual enforcement. Do not call something secure just because a function has a security-related name.

---

# 21. MASTER COMPARISON

Create:

| Area | V1 | V2 | What Changed | Risk | Recommendation |
|---|---|---|---|---|---|
| Authentication | | | | | |
| Supabase | | | | | |
| Profiles | | | | | |
| Credentials | | | | | |
| DID | | | | | |
| Hashing | | | | | |
| Signatures | | | | | |
| QR | | | | | |
| Verification | | | | | |
| Revocation | | | | | |
| Blocks/Ledger | | | | | |
| Polygon | | | | | |
| Thirdweb | | | | | |
| Brevo | | | | | |
| API | | | | | |
| UI | | | | | |
| Activity | | | | | |
| Notifications | | | | | |
| Mock Data | | | | | |
| Dependencies | | | | | |
| Security | | | | | |

---

# 22. FINAL VERDICT

End with exactly these sections:

## What V1 Actually Has
Only functionality verified from code.

## What V2 Actually Has
Only functionality verified from the local implementation.

## What V2 Improved
Only genuine improvements.

## What V2 Broke or Removed
Anything lost/degraded from V1.

## What V2 Added Unnecessarily
AI-generated, duplicate, fake, or irrelevant additions.

## What Must Be Preserved From V1
Especially:
- authentication
- Supabase
- credential persistence
- revocation
- APIs
- blockchain/ledger
- QR
- email
- roles

## What Should Be Kept From V2
Only useful additions.

## What Should Be Removed Later
Unnecessary/dead/duplicate/mock functionality.

## What Is Unknown
Anything that cannot be proven.

## Recommended Migration Strategy
Give a short strategy for combining V1's working infrastructure with useful V2 changes without destroying V1 functionality.

DO NOT implement the strategy.

---

# ABSOLUTE FINAL RULES

THIS IS A READ-ONLY AUDIT.

DO NOT CHANGE CODE.
DO NOT CREATE CODE.
DO NOT DELETE CODE.
DO NOT INSTALL PACKAGES.
DO NOT MODIFY DATABASES.
DO NOT MODIFY ENVIRONMENT VARIABLES.
DO NOT DEPLOY.
DO NOT PUSH TO GITHUB.
DO NOT FIX ANYTHING.
DO NOT REFACTOR ANYTHING.
DO NOT GUESS.

Never treat:
- UI as proof of functionality.
- an environment variable as proof of service usage.
- a Polygon RPC URL as proof of a real blockchain transaction.
- a hash as proof of issuer authenticity.
- README claims as proof of implementation.

Clearly label findings:

REAL
PARTIAL
MOCK
HARDCODED
DEVELOPMENT BYPASS
UNUSED
REMOVED
ADDED
BROKEN
UNKNOWN

If evidence is missing, say so.

FINAL OUTPUT = AUDIT REPORT ONLY.

NO CODE CHANGES UNTIL I REVIEW THE REPORT.
