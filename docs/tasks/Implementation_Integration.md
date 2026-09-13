# VeriChain V2 → V1 Infrastructure Integration
## Incremental Implementation Prompt for Antigravity

**Mode:** IMPLEMENTATION  
**Primary goal:** Preserve V2's modern UI/UX while reconnecting V1's real working infrastructure.

---

# 1. NON-NEGOTIABLE RULES

Before changing anything, inspect the existing V2 codebase and understand the current architecture.

### Rule 1 — Preserve V2 UI/UX

Do **not** redesign, simplify, replace, or rebuild the V2 interface.

Preserve:

- AppShell
- Sidebar
- Header
- MobileNav
- Dashboard
- DigitalWallet
- CredentialsList
- CredentialDetail
- IssueCredentialWizard
- QRVerificationView
- VerificationResultView
- ProfileView
- SettingsView
- ActivityView
- BlockchainExplorer
- ThemeContext
- ThemeToggle
- Design Tokens
- `src/components/ui/`
- Toast/notification UI
- Responsive behavior
- Light/Dark/System themes
- Current V2 visual language, spacing, cards, typography, navigation, and interactions

**The V2 UI is the presentation layer. Do not replace it with V1's old UI.**

---

### Rule 2 — Restore V1 infrastructure

Use the existing V1 implementation as the backend/infrastructure reference.

Restore/reconnect:

- Supabase Auth
- Supabase session handling
- Supabase `profiles`
- Supabase `issued_credentials`
- Supabase `blocks`
- Express API
- Credential issuance API
- Credential retrieval API
- SHA-256 verification
- QR generation
- Real QR camera/file decoding
- Credential revocation
- Brevo OTP/reset flows
- Existing ledger persistence

Prefer reusing existing V1 backend functions and endpoints rather than rewriting them.

---

### Rule 3 — DO NOT rebuild working infrastructure

Do not create a new backend, new database schema, new authentication system, new ledger engine, or duplicate API.

If an existing V1 implementation already performs the required function:

**reuse it.**

Modify only the minimum frontend integration code required to connect V2 to it.

---

### Rule 4 — Remove fake logic when replacing it

The following V2 logic is temporary/mock and must not remain as the source of truth after integration:

- hardcoded `isAuthenticated = true`
- hardcoded default user as the real authentication state
- static credential arrays as the live credential source
- static `mockUsers` as the live user source
- random fake credential hashes
- keyword-based verification such as `includes('REVOKED')`
- keyword-based forgery detection such as `includes('FORGED')`
- static revocation status
- fake blockchain transaction hashes
- state-only credential persistence

You may retain demo data/personas **only as an explicit Demo Mode**, never as the default production data source.

---

# 2. SOURCE OF TRUTH

## V1 Reference

GitHub:

https://github.com/Kyren-in/VeriChain

Production:

https://veri-chain-mocha.vercel.app/

Use the actual V1 code as the infrastructure reference.

Do not rely only on README claims.

---

## V2 Reference

The current local workspace is V2.

V2's UI architecture is the design source of truth.

---

# 3. TARGET ARCHITECTURE

The final application should follow this model:

```text
                    VERICHAIN V2
                 Modern V2 UI Layer
                         │
                         ▼
                AppContext / Services
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    Supabase Auth    Express API    Supabase DB
          │              │              │
          │              ▼              │
          │       SHA-256 Ledger         │
          │              │              │
          │              ▼              │
          │        blocks table          │
          │        credentials           │
          │              │
          └──────────────┼──────────────┘
                         ▼
               Real QR / Verification
                         │
                         ▼
                 Real Revocation
```

V2 should become the modern frontend for the existing V1 infrastructure.

---

# 4. IMPLEMENTATION ORDER

Implement incrementally in the following order.

Do not attempt a giant rewrite.

After each phase:

1. Build the application.
2. Check for runtime errors.
3. Check that the affected V2 UI still looks/behaves correctly.
4. Test the relevant real backend flow.
5. Only then continue to the next phase.

---

# PHASE 1 — REAL AUTHENTICATION

## Objective

Replace V2's fake authentication state with the existing V1 Supabase authentication system.

### Requirements

Reconnect:

- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange()`
- Supabase email/password login
- Supabase logout
- session persistence
- role retrieval from `profiles`

The authenticated user's profile should come from the database.

Use:

```text
profiles
├── id
├── email
├── full_name
├── role
└── updated_at
```

### Preserve V2

Do not remove:

- LoginView visual design
- Demo persona UI
- AppShell
- route structure
- role-specific navigation

### Demo Mode

Keep the V2 demo personas as an explicit development/demo mechanism.

It must be clearly separated from real authentication.

Suggested behavior:

```text
REAL MODE
    ↓
Supabase login
    ↓
Supabase session
    ↓
profiles.role
    ↓
application

DEMO MODE
    ↓
explicitly selected persona
    ↓
mock role/profile
    ↓
application
```

Do not silently auto-login a mock user in normal mode.

---

# PHASE 2 — REAL USER PROFILE AND ROLES

## Objective

Reconnect V2 profile/admin functionality to Supabase.

### Profile

Replace static profile data with the authenticated user's actual profile where available.

Preserve the V2 `ProfileView` design.

### Admin

Replace:

```text
mockUsers
```

with real data from:

```text
supabase.from('profiles').select('*')
```

Use the existing V1 role-management logic where possible.

Do not create a new users table.

### Authorization

UI hiding is not sufficient.

Maintain role checks for:

- Admin
- Issuer
- Verifier
- Holder/User

Do not allow frontend-only role state to become the security boundary.

---

# PHASE 3 — REAL CREDENTIAL RETRIEVAL

## Objective

Replace V2's static credential arrays with real credentials.

The live source should be the existing backend/Supabase credential system.

Prefer the existing API:

```text
GET /api/credentials
GET /api/credentials?did=...
```

### Requirements

Update the V2 data layer so that:

```text
DigitalWallet
CredentialsList
CredentialDetail
Dashboard
Activity
```

consume real credential data.

Do not redesign these screens.

### Important

Keep V2's enriched presentation fields where useful for UI, but do not fake backend identity/security fields.

Backend-generated values must remain authoritative for:

- credential ID
- DID
- hash
- issue date
- expiry
- issuer
- revocation state
- ledger/block information

---

# PHASE 4 — REAL CREDENTIAL ISSUANCE

## Objective

Connect the V2 `IssueCredentialWizard` to V1's real issuance API.

Existing endpoint:

```text
POST /api/credentials/issue
```

### Flow

```text
IssueCredentialWizard
        ↓
Review
        ↓
POST /api/credentials/issue
        ↓
server/ledger.js
        ↓
deterministic credential/hash generation
        ↓
ledger block
        ↓
Supabase persistence
        ↓
credential returned
        ↓
V2 Issued screen
```

### Requirements

The wizard must no longer create:

```text
Math.random()
```

based fake hashes.

Do not generate authoritative credential hashes in the frontend.

Use the backend-generated credential returned by the existing API.

After successful issuance:

- update V2 state
- show the V2 success/issued screen
- make the new credential visible in the wallet
- preserve V2 toast/feedback behavior

Do not replace the wizard UI.

---

# PHASE 5 — REAL QR GENERATION

## Objective

Make V2 credentials produce genuinely scannable QR codes.

Reuse the existing `qrcode` dependency and V1 QR generation approach where appropriate.

The QR should contain the credential verification payload required by the existing verification API.

Do not create a decorative QR icon and call it a QR credential.

### Requirements

V2 `CredentialDetail` should display a real generated QR.

The QR must:

- encode the real credential payload
- be scannable by a camera
- be usable by the verifier
- correspond to the issued credential

Preserve the V2 visual presentation.

---

# PHASE 6 — REAL QR CAMERA / FILE SCANNING

## Objective

Restore the real V1 QR decoding engine inside the V2 verification UI.

Reuse:

```text
html5-qrcode
```

and the proven V1 scanning approach.

### Camera

The camera must actually decode QR data.

### File/Gallery

Uploaded QR images must actually be decoded.

Do not merely inspect the file name or metadata.

### Manual input

Manual input should also pass the actual credential payload to the backend verifier.

Preserve the V2 scanner/viewfinder design.

---

# PHASE 7 — REAL CRYPTOGRAPHIC VERIFICATION

## Objective

Replace V2 keyword matching with the existing V1 verification API.

Existing endpoint:

```text
POST /api/credentials/verify
```

### Remove

Logic such as:

```javascript
cleaned.includes('REVOKED')
cleaned.includes('FORGED')
cleaned.includes('TAMPERED')
```

must not be used as the security mechanism.

### Correct flow

```text
QR decoded
    ↓
credential payload
    ↓
POST /api/credentials/verify
    ↓
server/ledger.js
    ↓
deterministic SHA-256 recomputation
    ↓
stored credential lookup
    ↓
hash comparison
    ↓
revocation check
    ↓
expiry check
    ↓
verification result
    ↓
VerificationResultView
```

The V2 result screen should display the real backend result.

Where available, preserve useful V2 proof information such as:

- valid/invalid
- tampered
- revoked
- expired
- computed hash
- stored hash
- block number
- issuer
- credential ID
- DID

Do not fabricate values for visual presentation.

---

# PHASE 8 — REAL REVOCATION

## Objective

Restore the V1 authority revocation workflow without replacing the V2 design.

Existing endpoint:

```text
POST /api/credentials/revoke
```

### Requirements

Authorized Issuer/Admin users should be able to revoke credentials.

Revocation must:

1. identify the credential
2. call the existing backend API
3. update the ledger
4. persist revocation state
5. update the V2 UI
6. cause future verification to fail

Existing V1 behavior should be reused.

### Critical test

Take a valid credential.

Verify it.

Revoke it.

Verify the same old QR again.

Expected:

```text
CREDENTIAL REVOKED
INVALID
```

Do not implement revocation using a local React status flag.

---

# PHASE 9 — ACTIVITY AND NOTIFICATIONS

## Objective

Keep V2's Activity and Notification UI while replacing fake data where real data exists.

### Activity

Use real backend/ledger information where appropriate.

Possible sources:

- credential issuance blocks
- revocation blocks
- verification-related events if actually persisted

Do not invent historical events.

### Notifications

Keep V2 notification UI.

Only connect to real notification data if an existing source exists.

If there is no backend notification system, do not pretend static notifications are server-generated.

It is acceptable to keep presentation-only demo notifications when clearly in Demo Mode.

---

# PHASE 10 — BLOCKCHAIN EXPLORER / LEDGER

## Objective

Preserve V2's improved BlockchainExplorer UI.

Continue using:

```text
GET /api/blocks
```

for the real ledger.

Do not call the custom SHA-256 ledger a Polygon blockchain transaction system.

Current infrastructure classification:

```text
CUSTOM DATABASE HASH LEDGER
```

The existing Polygon Amoy RPC configuration should not be represented as proof of an actual Polygon transaction unless a real smart contract and transaction flow are implemented.

Do not invent:

- transaction hashes
- contract addresses
- block confirmations
- Polygon transactions

Only display values actually returned by the backend.

---

# PHASE 11 — BREVO OTP

## Objective

Reconnect the V2 authentication/registration flow to the existing Brevo backend.

Existing endpoints:

```text
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/send-reset-email
```

Preserve the V2 authentication UI.

Use the existing server implementation rather than creating another email service.

Never expose:

```text
BREVO_API_KEY
```

to frontend code.

---

# 5. DATA OWNERSHIP RULES

Use this rule throughout the implementation:

### Frontend state

Responsible for:

- UI state
- loading state
- temporary form state
- selected credential
- current route
- visual filters
- theme
- demo mode

### Backend

Responsible for:

- credential creation
- authoritative hashes
- DID generation
- verification
- revocation
- ledger creation
- persistence
- security-sensitive validation

### Supabase

Responsible for existing persisted data:

```text
profiles
issued_credentials
blocks
```

Do not introduce duplicate sources of truth.

---

# 6. DO NOT CREATE A SECOND LEDGER

There must be one authoritative ledger implementation.

Use:

```text
server/ledger.js
```

Do not create:

- another blockchain engine
- another hash chain
- another credential database
- another credential verification engine

The V2 frontend should consume the existing backend ledger.

---

# 7. DO NOT INVENT BLOCKCHAIN FUNCTIONALITY

Current verified architecture:

```text
Node.js SHA-256 hash-linked ledger
        +
Supabase persistence
```

Do not claim:

```text
Polygon transaction
smart contract
on-chain transaction
wallet transaction
```

unless the actual implementation is added and tested.

`ethers` and Polygon RPC configuration being present does not by itself prove blockchain transactions.

---

# 8. ENVIRONMENT / SECRETS

Never print or expose secret values.

Do not ask the user to paste:

- API keys
- passwords
- service-role keys
- private keys
- cookies
- JWT secrets

Use environment variable names only.

Relevant infrastructure includes:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
VITE_POLYGON_AMOY_RPC
VITE_THIRDWEB_CLIENT_ID
BREVO_API_KEY
BREVO_SENDER_EMAIL
PORT
```

Keep server-only secrets server-side.

Do not commit `.env`.

---

# 9. API INTEGRATION RULE

Before creating a new API endpoint:

1. Search the existing backend.
2. Check whether the required endpoint already exists.
3. Reuse it if possible.
4. Only add an endpoint if the required functionality genuinely does not exist.

Existing important endpoints include:

```text
GET  /api/health
GET  /api/ping

POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/send-reset-email

POST /api/credentials/issue
GET  /api/credentials
GET  /api/credentials?did=...

POST /api/credentials/verify
POST /api/credentials/revoke

GET  /api/blocks
```

Do not duplicate these.

---

# 10. ERROR HANDLING

Do not hide backend failures by silently falling back to fake data in production mode.

For example:

```text
API unavailable
    ↓
show clear error state
```

not:

```text
API unavailable
    ↓
pretend credential verification succeeded
```

V2 may use demo fallback only when explicitly operating in Demo Mode.

---

# 11. LOADING STATES

Preserve the polished V2 experience.

Add proper:

- loading indicators
- skeletons
- disabled submit buttons
- retry states
- empty states
- success toasts
- error toasts

Use the existing V2 UI components.

Do not create unnecessary new UI libraries.

---

# 12. SECURITY REQUIREMENTS

Do not weaken V1's existing security protections.

Preserve where already implemented:

- backend validation
- rate limiting
- OTP expiry
- brute-force protection
- input sanitization
- server-side credential verification
- role restrictions
- Supabase security controls

Frontend route hiding is not sufficient authorization.

---

# 13. DEMO MODE

The hackathon/demo workflow is useful and should remain.

But make it explicit.

Recommended concept:

```text
Authentication Mode

[ Real Account ]
[ Demo Mode ]
```

Real Account:

```text
Supabase Auth
```

Demo Mode:

```text
Citizen / Holder
Issuer
Verifier
Admin
```

Demo personas may use mock data.

Real Account mode must never silently use mock data.

---

# 14. CODE CLEANUP

After each integration phase, remove only code that has become genuinely obsolete.

Candidates include:

- old fake hash generators
- fake verification matcher
- duplicate mock data
- obsolete mock credential state
- unused imports
- duplicate API logic
- dead Vite template CSS

Do not aggressively delete files.

Before deleting a component, confirm it is unused.

Do not remove V1 components until their required functionality has been successfully migrated/reused.

---

# 15. IMPORTANT: PRESERVE COMPONENT DESIGN

When integrating backend logic into V2 components:

### Preferred

```text
Existing V2 component
        +
existing V1 API/service
```

### Avoid

```text
Delete V2 component
        ↓
copy V1 component
```

For example:

```text
IssueCredentialWizard.jsx
```

should remain the UI.

Only its submission/data logic should be connected to:

```text
POST /api/credentials/issue
```

Similarly:

```text
QRVerificationView.jsx
```

should remain the UI.

Only its verification/scanning logic should be connected to the real backend.

---

# 16. ACCEPTANCE TESTS

Do not consider the integration complete until these flows work.

## Test A — Authentication

```text
Open app
↓
Unauthenticated user is not silently logged in
↓
Real Supabase login
↓
Session persists
↓
Correct role loads
```

---

## Test B — Credential Issuance

```text
Issuer login
↓
Issue Credential
↓
Complete V2 wizard
↓
Backend API called
↓
Real credential generated
↓
Real SHA-256 hash generated
↓
Ledger block created
↓
Supabase record created
↓
Credential appears in wallet
```

---

## Test C — QR

```text
Open credential
↓
Real QR displayed
↓
Scan QR with verifier
↓
QR actually decodes
↓
Payload sent to backend
```

---

## Test D — Valid Verification

```text
Valid credential
↓
POST /api/credentials/verify
↓
Hash matches
↓
Not revoked
↓
Not expired
↓
VALID / AUTHENTIC
```

---

## Test E — Tampering

Modify one credential field.

```text
Modified credential
↓
Verification API
↓
Hash mismatch
↓
TAMPER DETECTED / INVALID
```

Do not detect tampering using keywords.

---

## Test F — Revocation

```text
Valid credential
↓
Verify
↓
VALID

Revoke credential
↓
Ledger updated
↓
Supabase updated

Verify same QR again
↓
CREDENTIAL REVOKED
↓
INVALID
```

---

## Test G — Persistence

```text
Issue credential
↓
Refresh browser
↓
Credential still exists
```

Also verify:

```text
Restart backend
↓
Credential still exists
```

---

## Test H — Admin

```text
Admin login
↓
Real profiles loaded
↓
Role information is real
↓
Role changes persist
```

---

# 17. NO FAKE SUCCESS

Never show:

```text
Verified
Issued
Revoked
Blockchain confirmed
Authenticated
```

unless the underlying operation actually succeeded.

If an API fails, show the failure.

This is especially important for the hackathon demo.

---

# 18. IMPLEMENTATION SAFETY

Before every significant modification:

1. Inspect existing code.
2. Identify the smallest required change.
3. Reuse existing functions.
4. Modify only the necessary component/service.
5. Build.
6. Test.
7. Continue.

Do not perform a massive automated rewrite of the project.

Do not regenerate the whole application.

Do not replace package.json unless absolutely necessary.

Do not replace the backend unless absolutely necessary.

Do not replace the database schema.

---

# 19. FINAL ARCHITECTURAL GOAL

The finished VeriChain should be:

```text
V2 UI/UX
+
V1 real infrastructure
+
real persistence
+
real authentication
+
real credential issuance
+
real QR generation/scanning
+
real cryptographic verification
+
real revocation
+
real ledger
+
explicit Demo Mode
```

In short:

> **Keep V2's face. Restore V1's brain.**

---

# 20. FINAL INSTRUCTION TO ANTIGRAVITY

Implement this integration incrementally.

**Do not start by rewriting the application.**

First inspect the current code, then implement Phase 1.

After Phase 1 succeeds, continue through the phases sequentially.

At every stage:

- preserve V2 UI
- reuse V1 infrastructure
- avoid duplicate systems
- remove fake logic only when replaced
- do not invent functionality
- do not invent blockchain transactions
- do not expose secrets
- do not silently fall back to mocks in real mode
- do not modify unrelated features

If an existing implementation is already working, **keep it**.

If V2 has a better UI, **keep it**.

If V1 has the real backend logic, **reuse it**.

The final product should be a **single integrated VeriChain application**, not two competing implementations.
