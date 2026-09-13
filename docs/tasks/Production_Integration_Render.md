# VeriChain — Production Integration & Render Deployment Prompt

## Objective

Transform the current V2 implementation into **one production-ready VeriChain application** by preserving V2's modern UI/UX while reconnecting it to the real V1 infrastructure and real Supabase database.

### Critical decision

**NO DEMO MODE.**

Do not create, preserve, or use demo personas.

Do not use mock users.

Do not use mock credentials.

Do not use fake verification results.

Do not use hardcoded authentication.

Do not use simulated blockchain data.

The application will use **actual user profiles, actual Supabase data, actual credentials, actual backend APIs, and actual persisted ledger data**.

The final application will be hosted on **Render**.

---

# 1. ABSOLUTE RULES

## Rule 1 — Preserve V2 UI/UX

Keep the current V2 visual system and architecture.

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
- centralized design tokens
- atomic UI components
- responsive layouts
- current typography
- spacing
- cards
- buttons
- badges
- navigation
- light/dark/system theme support

### Important

Do not replace V2 screens with old V1 screens.

Use V1 code as the **logic/infrastructure reference**, not as the visual design reference.

Small UI additions for:

- loading
- errors
- empty states
- API failures
- success states

are allowed when necessary for real integration.

Do not redesign the application.

---

# 2. REMOVE ALL DEMO / MOCK DATA

The final production application must contain **zero demo data in the active application flow**.

Remove or replace:

- `initialCredentials`
- `initialActivities`
- `initialNotifications`
- `mockUsers`
- hardcoded `Aditi Singh`
- hardcoded demo profiles
- hardcoded credential objects
- hardcoded DID values
- random fake hashes
- fake blockchain transaction values
- fake verification results
- static revocation state
- fake authentication state

Do not simply hide these arrays.

If they are no longer required, remove them from the production code.

Do not keep a Demo Mode toggle.

Do not add a Demo Mode toggle.

Do not create replacement demo accounts.

---

# 3. REAL AUTHENTICATION ONLY

## Objective

Use real Supabase Auth.

Remove:

```javascript
useState(true)
```

as an authentication mechanism.

Remove hardcoded authenticated users.

Remove simulated login using `setTimeout`.

Remove local-only authentication.

---

## Login

Connect the V2 Login UI to:

```javascript
supabase.auth.signInWithPassword()
```

Use the existing Supabase client.

Preserve the V2 LoginView design.

---

## Registration

Connect registration to the existing Supabase authentication flow.

Use:

```javascript
supabase.auth.signUp()
```

and preserve the existing V1 OTP/Brevo verification flow where applicable.

Do not create another authentication system.

---

## Session

In `AppContext.jsx`:

- call `supabase.auth.getSession()`
- subscribe using `supabase.auth.onAuthStateChange()`
- update authentication state from the real session
- handle session expiry
- handle logout
- restore the session after browser refresh

The application must not consider the user authenticated merely because React state says so.

---

## Logout

Use:

```javascript
supabase.auth.signOut()
```

Clear local UI state after successful logout.

---

# 4. REAL USER PROFILES

The authenticated user's profile must come from the existing Supabase `profiles` table.

Expected structure:

```text
profiles
├── id
├── email
├── full_name
├── role
└── updated_at
```

The user's Supabase Auth identity and profile row must remain correctly associated.

Use:

```text
profiles.id → auth.users.id
```

where applicable.

---

# 5. REAL ROLE SYSTEM

Use the actual role stored in:

```text
profiles.role
```

Expected roles:

```text
admin
issuer
verifier
user
```

Do not use:

```text
Holder
Issuer
Verifier
Admin
```

as the authoritative database role unless the existing database actually stores those values.

The frontend may format the role for display, but authorization must use the actual backend/database role.

---

# 6. ADMIN PORTAL

Replace all mock users.

Do not use:

```javascript
mockUsers
```

The Admin Portal must load real profiles from Supabase.

Use the existing V1 implementation as reference.

Required behavior:

```text
Admin login
↓
Load real profiles
↓
Display real users
↓
Display actual roles
↓
Change role
↓
Persist role in Supabase
↓
Refresh
↓
Role remains changed
```

Use the existing profile table.

Do not create a new users table.

---

# 7. AUTHORIZATION

Authentication and authorization are different.

Do not rely only on hiding sidebar items.

Sensitive operations must be protected.

At minimum:

### Admin

Can access:

- Admin Portal
- role governance

### Issuer

Can access:

- credential issuance
- authorized revocation

### Verifier

Can access:

- credential verification

### User

Can access:

- own credentials
- wallet
- profile
- allowed user features

Do not allow a client-side role string to be the only security boundary for sensitive operations.

Preserve the existing backend authorization logic.

---

# 8. REAL CREDENTIAL DATABASE

The production credential source must be the existing database/backend system.

Existing table:

```text
issued_credentials
```

Expected fields include:

```text
id
did
holder_name
user_email
user_id
payload
is_revoked
updated_at
```

Do not replace this with React state.

Do not use static arrays.

Do not use localStorage as the authoritative credential database.

---

# 9. REAL CREDENTIAL RETRIEVAL

Connect:

- Dashboard
- DigitalWallet
- CredentialsList
- CredentialDetail

to real credential data.

Prefer the existing backend API:

```text
GET /api/credentials
GET /api/credentials?did=...
```

Use the authenticated user's identity to retrieve the appropriate credentials.

Do not expose another user's credentials merely because the frontend requests a different DID/email.

Validate ownership/authorization on the backend where required.

---

# 10. REAL CREDENTIAL ISSUANCE

Preserve the V2:

```text
IssueCredentialWizard
```

UI.

Replace its fake submission logic with the existing backend:

```text
POST /api/credentials/issue
```

Correct flow:

```text
Issuer
 ↓
V2 IssueCredentialWizard
 ↓
POST /api/credentials/issue
 ↓
Express backend
 ↓
server/ledger.js
 ↓
deterministic credential generation
 ↓
SHA-256 hash
 ↓
DID generation
 ↓
ledger block
 ↓
Supabase persistence
 ↓
credential returned
 ↓
V2 success screen
```

The frontend must NOT generate the authoritative hash.

The frontend must NOT generate a fake blockchain hash.

The frontend must NOT fabricate the DID.

Use backend-returned values.

---

# 11. CREDENTIAL PERSISTENCE

When a credential is issued:

Verify all of the following:

```text
issued_credentials row created
blocks row created
ledger state updated
credential returned to frontend
credential visible after refresh
credential visible after backend restart
```

If any of these fail, do not show a fake success message.

---

# 12. REAL SHA-256 VERIFICATION

Remove all mock verification logic.

Delete/replace logic such as:

```javascript
includes('REVOKED')
includes('FORGED')
includes('TAMPERED')
```

These must never be the security mechanism.

Use:

```text
POST /api/credentials/verify
```

Correct flow:

```text
QR decoded
 ↓
payload parsed
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
real verification result
 ↓
VerificationResultView
```

---

# 13. TAMPER DETECTION

Tampering must be detected cryptographically.

Test:

```text
Valid credential
↓
Change one field
↓
Verify
↓
SHA-256 mismatch
↓
INVALID / TAMPER DETECTED
```

Do not detect tampering through keywords or UI state.

---

# 14. REAL QR GENERATION

Use the existing `qrcode` dependency.

Generate an actual scannable QR using:

```javascript
QRCode.toDataURL()
```

The QR must encode the real credential verification payload.

Preserve the V2 visual presentation.

The QR shown in:

- CredentialDetail
- DigitalWallet quick views

must be genuinely scannable.

---

# 15. REAL QR CAMERA SCANNING

Use the existing:

```text
html5-qrcode
```

implementation.

Maintain the V2 hotel-terminal scanner UI.

Camera scanning must actually decode QR frames.

Do not simply display a camera feed.

---

# 16. REAL QR FILE UPLOAD

Gallery/file upload must decode the actual QR image.

Use the existing V1 approach where applicable:

```javascript
Html5Qrcode.scanFile(file, true)
```

Do not inspect:

- filename
- MIME type alone
- file metadata

as a substitute for QR decoding.

---

# 17. MANUAL VERIFICATION

Manual verification should submit valid credential identifiers/payloads to the real verification mechanism.

Do not return a successful result merely because an input string matches a local object.

---

# 18. REAL REVOCATION

Preserve V2's CredentialDetail and management UI.

Reconnect to:

```text
POST /api/credentials/revoke
```

Authorized Issuers/Admins must be able to revoke a credential.

Backend must:

1. identify the credential
2. validate authorization
3. create the revocation ledger block
4. persist revocation
5. update `issued_credentials.is_revoked`
6. return the real result

---

# 19. CRITICAL REVOCATION TEST

This test is mandatory.

```text
Issue credential
↓
Verify credential
↓
VALID

Revoke credential
↓
CREDENTIAL_REVOKED block created
↓
Supabase is_revoked = true

Scan the SAME old QR
↓
POST /api/credentials/verify
↓
CREDENTIAL REVOKED
↓
INVALID
```

The old QR must NOT remain valid after revocation.

---

# 20. REAL EXPIRY CHECK

Use the backend verification engine to evaluate:

```text
validUntil
```

Do not simply display a date and assume the credential is valid.

Test:

```text
Expired credential
↓
verification API
↓
isExpired = true
↓
INVALID
```

---

# 21. LEDGER / BLOCKCHAIN EXPLORER

Preserve the V2 BlockchainExplorer UI.

Use:

```text
GET /api/blocks
```

for the real ledger.

The ledger is currently:

```text
CUSTOM SHA-256 HASH-LINKED LEDGER
```

persisted through the existing backend/database infrastructure.

Do NOT claim that a record is a Polygon transaction unless an actual Polygon transaction exists.

Do NOT invent:

- transaction hashes
- contract addresses
- wallet addresses
- block confirmations
- smart contract data

If Polygon is not actually integrated, label the system accurately.

---

# 22. SUPABASE DATABASE VALIDATION

Before declaring the application production-ready, verify the existing database end-to-end.

Required tables:

```text
profiles
issued_credentials
blocks
```

Verify:

### Profiles

- Auth user can have corresponding profile.
- Profile role loads correctly.
- Profile updates persist.

### Credentials

- Issued credential is inserted.
- Credential can be retrieved.
- Credential belongs to the correct user.
- Revocation updates `is_revoked`.

### Blocks

- New issuance creates a block.
- Revocation creates a block.
- `previous_hash` links correctly.
- `hash` is deterministic.
- Existing ledger data survives restart.

---

# 23. SUPABASE RLS / SECURITY

Inspect the existing Supabase Row Level Security policies.

Do not disable RLS simply to make the frontend work.

Do not use a service-role key in frontend code.

Do not expose privileged credentials.

If an RLS policy is missing or incorrect:

1. identify the exact problem
2. propose the minimum required policy change
3. implement only if safe and necessary
4. verify the policy with real user roles

Do not bypass database security.

---

# 24. NO DATA LEAKAGE

Verify that:

```text
User A
```

cannot retrieve:

```text
User B's private credential records
```

through:

- URL manipulation
- DID manipulation
- API parameters
- frontend state
- direct Supabase queries

Public credential verification may expose only the information intentionally returned by the verification API.

---

# 25. BREVO

Keep the existing Brevo backend.

Use:

```text
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/send-reset-email
```

Reconnect these to the real authentication flow.

Never expose:

```text
BREVO_API_KEY
```

to the browser.

Never hardcode the API key.

---

# 26. ENVIRONMENT VARIABLES

The Render deployment must use environment variables.

Do not commit `.env`.

Expected infrastructure variables include:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
BREVO_API_KEY
BREVO_SENDER_EMAIL
PORT
```

Only retain Polygon/Thirdweb variables if they are genuinely used.

Do not expose server-only secrets through Vite client variables.

Never print secret values in logs.

---

# 27. RENDER DEPLOYMENT

Prepare the project for Render.

First inspect:

```text
package.json
render.yaml
start.js
vercel.json
vite.config.js
server/index.js
```

Determine the existing deployment architecture before changing it.

Do not create a second server unnecessarily.

The final production architecture should work on Render with:

```text
Browser
   ↓
Render-hosted VeriChain
   ↓
Express backend
   ↓
Supabase
   ↓
Brevo
```

If frontend and backend are served separately, configure the API base URL correctly.

If the existing Express server can serve the production frontend, preserve that architecture instead of unnecessarily introducing another service.

---

# 28. RENDER ENVIRONMENT

Make sure the application does not assume:

```text
localhost
127.0.0.1
localhost:5000
```

in production.

Use:

```text
VITE_API_BASE_URL
```

or the existing production-safe API configuration.

The backend must listen on the Render-provided:

```text
PORT
```

Do not hardcode a production port.

---

# 29. PRODUCTION BUILD

Run:

```text
npm install
npm run lint
npm run build
npm start
```

Verify:

- zero lint errors
- zero lint warnings
- successful production build
- server starts successfully
- API health endpoint works
- frontend loads
- Supabase connection works
- authentication works

---

# 30. PRODUCTION ERROR HANDLING

Never silently replace a failed real operation with mock data.

Bad:

```text
API fails
↓
show fake credential
↓
show "Verified"
```

Correct:

```text
API fails
↓
show clear error state
↓
allow retry
```

Never show:

```text
Authenticated
Issued
Verified
Revoked
Blockchain confirmed
```

unless the underlying operation actually succeeded.

---

# 31. REMOVE DEAD / DUPLICATE PRODUCTION LOGIC

After successful integration, inspect for obsolete V2/V1 duplicates.

Potential candidates:

- fake credential arrays
- mock users
- fake hash generator
- fake verification matcher
- static revocation state
- duplicate wallet implementations
- duplicate issuance implementations
- duplicate verification implementations
- obsolete auth components
- unused Vite template CSS

Do not delete files blindly.

Only remove code after confirming it is no longer used.

---

# 32. SINGLE SOURCE OF TRUTH

The final application must have one authoritative source for each domain.

```text
Authentication
→ Supabase Auth

User profile / role
→ Supabase profiles

Credential issuance
→ Express API / server ledger

Credential persistence
→ Supabase issued_credentials

Cryptographic verification
→ Express verification API / server ledger

Revocation
→ Express revocation API / ledger / Supabase

Ledger
→ server/ledger.js + persistent storage

Blocks
→ Supabase blocks / GET /api/blocks

QR generation
→ qrcode

QR decoding
→ html5-qrcode
```

React state should only represent/cache the real data.

---

# 33. DO NOT CREATE NEW INFRASTRUCTURE UNNECESSARILY

Before creating anything:

1. Search the V1 codebase.
2. Search the V2 codebase.
3. Check whether the functionality already exists.
4. Reuse it.

Do not create another:

- database
- auth provider
- ledger
- credential API
- verification engine
- revocation engine
- QR library
- email service

unless the existing implementation genuinely cannot satisfy the requirement.

---

# 34. IMPLEMENTATION ORDER

Implement incrementally.

### Phase 1
Real Supabase authentication/session.

### Phase 2
Real profiles and roles.

### Phase 3
Real credential retrieval.

### Phase 4
Real credential issuance.

### Phase 5
Real QR generation.

### Phase 6
Real QR camera/file decoding.

### Phase 7
Real cryptographic verification.

### Phase 8
Real revocation.

### Phase 9
Real activity/ledger synchronization.

### Phase 10
Supabase security/RLS validation.

### Phase 11
Render production configuration.

Do not perform one massive rewrite.

---

# 35. AFTER EACH PHASE

Run:

```text
npm run lint
npm run build
```

Then test the relevant functionality.

If a phase breaks another working feature:

1. stop
2. diagnose
3. fix the smallest affected area
4. retest
5. continue

Do not continue building on top of known broken functionality.

---

# 36. REQUIRED END-TO-END TESTS

## Test 1 — Real Registration

```text
Register real account
↓
OTP/email verification
↓
Supabase Auth user created
↓
profiles row exists
↓
role loads
↓
login works
```

---

## Test 2 — Real Login

```text
Login
↓
Supabase session created
↓
Refresh browser
↓
Session remains
↓
Profile loads
↓
Correct role loads
```

---

## Test 3 — Logout

```text
Logout
↓
Supabase session removed
↓
Protected views unavailable
↓
Login screen displayed
```

---

## Test 4 — Credential Issuance

```text
Real Issuer
↓
V2 Issue Credential Wizard
↓
POST /api/credentials/issue
↓
Credential generated
↓
SHA-256 generated
↓
DID generated
↓
Block created
↓
Supabase credential saved
↓
Wallet displays credential
```

---

## Test 5 — Persistence

```text
Issue credential
↓
Refresh browser
↓
Credential remains

Restart backend
↓
Credential remains

Reload
↓
Credential remains
```

---

## Test 6 — QR

```text
Open credential
↓
Real QR generated
↓
Scan with camera
↓
Payload decoded
↓
Verification API receives payload
```

---

## Test 7 — Valid Verification

```text
Genuine QR
↓
Verification API
↓
Hash matches
↓
Not revoked
↓
Not expired
↓
IDENTITY VERIFIED & VALID
```

---

## Test 8 — Tampering

```text
Modify credential payload
↓
Verification API
↓
Hash mismatch
↓
SECURITY ALERT: TAMPER DETECTED
```

---

## Test 9 — Revocation

```text
Valid credential
↓
Revoke
↓
CREDENTIAL_REVOKED block
↓
is_revoked = true
↓
Scan old QR
↓
CREDENTIAL REVOKED
```

---

## Test 10 — Expiry

```text
Expired credential
↓
Verification API
↓
isExpired = true
↓
INVALID
```

---

## Test 11 — Admin Governance

```text
Admin login
↓
Real profiles loaded
↓
Change role
↓
Supabase updated
↓
Refresh
↓
Change persists
```

---

## Test 12 — User Isolation

```text
User A
↓
Request User B credential data
↓
Request denied / data not returned
```

---

# 37. FINAL PRODUCTION CHECKLIST

Before declaring the project complete:

### Authentication

- [ ] No hardcoded authentication
- [ ] No auto-login
- [ ] Real Supabase sessions
- [ ] Real login
- [ ] Real registration
- [ ] Real logout
- [ ] Session survives refresh

### Users

- [ ] No mockUsers
- [ ] Real profiles
- [ ] Real roles
- [ ] Admin role management persists

### Credentials

- [ ] No initial mock credentials
- [ ] Real issuance
- [ ] Real persistence
- [ ] Real retrieval
- [ ] Correct ownership
- [ ] Real DID
- [ ] Real SHA-256

### QR

- [ ] Real QR generation
- [ ] Real camera scanning
- [ ] Real file scanning
- [ ] Real payload decoding

### Verification

- [ ] Real backend verification
- [ ] Real hash comparison
- [ ] Real tamper detection
- [ ] Real expiry detection
- [ ] Real revocation detection

### Revocation

- [ ] Authorized revoke action
- [ ] Revocation block
- [ ] Supabase update
- [ ] Old QR becomes invalid

### Database

- [ ] `profiles` works
- [ ] `issued_credentials` works
- [ ] `blocks` works
- [ ] RLS/security checked
- [ ] Data survives restart

### Security

- [ ] No secrets in frontend
- [ ] No service-role key in browser
- [ ] No Brevo key in browser
- [ ] Backend authorization preserved
- [ ] No client-side security bypass

### Deployment

- [ ] Render-compatible
- [ ] Production API URL configured
- [ ] Dynamic Render `PORT`
- [ ] Production build succeeds
- [ ] Health endpoint works
- [ ] No localhost dependency

### Code

- [ ] No demo mode
- [ ] No mock data
- [ ] No fake hashes
- [ ] No fake blockchain values
- [ ] No keyword verification
- [ ] No unnecessary duplicate infrastructure
- [ ] No accidental UI regression
- [ ] Lint clean
- [ ] Build clean

---

# 38. FINAL INSTRUCTION TO ANTIGRAVITY

This is a **production integration**, not a redesign.

Use:

**V2 as the UI/UX source of truth.**

Use:

**V1 as the working infrastructure reference.**

Use:

**Supabase as the real database/authentication source.**

Use:

**Express + `server/ledger.js` as the authoritative credential/verification/revocation backend.**

Use:

**real user accounts and real profiles only.**

There must be **NO Demo Mode** and **NO mock data** in the final application.

Do not rewrite the entire project.

Do not replace working V1 infrastructure.

Do not downgrade V2 UI.

Do not invent functionality.

Do not fake successful operations.

Do not claim Polygon transactions that do not actually exist.

Do not expose secrets.

Implement one phase at a time, verify it, then continue.

### Final target

```text
                    VERICHAIN PRODUCTION
                           │
                    V2 MODERN UI
                           │
                           ▼
                    Real AppContext
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         Supabase Auth  Express API  Supabase DB
              │            │            │
              │       server/ledger     │
              │            │            │
              │       SHA-256 Ledger    │
              │            │            │
              └────────────┼────────────┘
                           ▼
                 Real QR Verification
                           │
                           ▼
                    Real Revocation
                           │
                           ▼
                     Render Hosting
```

**Build one coherent production application.**

**Keep V2's face. Restore V1's real infrastructure. Remove all demo/mock data. Make the database and every core flow actually work.**
