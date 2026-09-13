# VeriChain — Product Requirements Document (PRD)

## 1. Product Overview

**VeriChain** is a decentralized identity (DID) verification platform for tourist identity verification.

It allows an authorized issuer to issue a digital credential, a tourist to hold and present that credential through a QR code, and an authorized verifier such as a hotel or security checkpoint to verify authenticity, integrity, expiry, and revocation status.

### Core value proposition

**Verify identity without unnecessarily sharing or storing the underlying identity document.**

VeriChain is a verification layer, not a replacement for DigiLocker.

- **DigiLocker:** access and share authenticated government documents.
- **VeriChain:** verify specific identity claims through a portable credential and verifier workflow.
- VeriChain may integrate with existing document/issuer ecosystems rather than replacing them.

---

## 2. Problem

Tourist identity verification can require:

- Manual document inspection.
- Repeated sharing of sensitive identity information.
- Unnecessary copying or storage of identity documents.
- Difficulty checking whether a previously issued credential is revoked.
- Detection of altered screenshots, PDFs, or credential data.

VeriChain should make verification:

**Present → Scan → Verify → Check Status → Result**

---

## 3. Target Users

### Holder
Tourist/citizen who:
- Owns digital credentials.
- Views credential status.
- Presents credentials using QR.
- Controls which fields are disclosed.

### Issuer
Authorized tourism authority or organization that:
- Issues credentials.
- Manages issued credentials.
- Revokes credentials.

### Verifier
Authorized organization such as:
- Hotels.
- Tourism checkpoints.
- Security personnel.
- Other approved service providers.

---

## 4. Core User Flow

```text
Issuer
  ↓
Issues Credential
  ↓
Holder Wallet
  ↓
Holder selects credential
  ↓
Generates QR Presentation
  ↓
Verifier scans QR
  ↓
Authenticity + Integrity + Expiry + Revocation checks
  ↓
Verification Result
```

---

## 5. Holder Wallet Requirements

The wallet must provide:

- Holder DID / credential identifier.
- Credential count.
- Credential list.
- Credential status.
- Credential details.
- Search and filtering.
- QR presentation.
- Minimal Field Disclosure mode.
- Activity/history.
- Notifications.
- Profile/settings.

### Demo credentials

- Aadhaar (Masked) — Government of India — Valid
- Passport — Ministry of External Affairs — Valid
- Tourism Access Pass — Government of India — Valid
- College Degree — ABC University — Valid
- Health Certificate — Health Department — Revoked

Sensitive document references must be masked.

---

## 6. Issuer Portal Requirements

Issuer can create credentials using:

- Full Name
- ID Document Type
- ID Document Reference
- Nationality
- Expiry Date
- Credential Type

The prototype generates:

```text
did:verichain:<hash>
```

and a deterministic SHA-256 payload digest.

### Issuance flow

```text
Enter Details → Review → Issue → Credential Created
```

Issuer can also:

- View issued credential.
- View credential ID.
- View cryptographic receipt/reference.
- Revoke credential.
- View issuance/revocation activity.

---

## 7. Verifier Requirements

Verifier must be able to:

- Scan a QR using the browser camera where supported.
- Use a fallback verification input when scanning is unavailable.
- Verify credential authenticity/integrity.
- Check expiry.
- Check revocation status.
- Display only the information permitted by the credential presentation.

### Verification states

**Valid**

`CREATOR VERIFIED (AUTHENTIC)`

Show:
- Valid credential.
- Issuer.
- Integrity/signature status.
- Expiry.
- Revocation status.
- Disclosed claims.

**Tampered**

`TAMPER DETECTED (INVALID)`

Show:
- Integrity/signature mismatch.
- Altered/tampered indication.
- Verification rejection.

**Revoked**

`CREDENTIAL REVOKED`

Show:
- Credential ID.
- Issuer.
- Revocation status.
- Verification rejection.

**Not Found / Invalid**

Unknown credentials must never be treated as valid.

---

## 8. Minimal Field Disclosure

The verifier should receive only the information required for the verification task.

Example:

```text
Identity: VERIFIED
Name: Rahul Sharma
Nationality: Indian
Credential: VALID
```

The system should avoid unnecessarily exposing:

- Full identity document image.
- Full document number.
- Address.
- Unrelated personal information.

### Privacy principle

**Verify more. Store less.**

Future production versions should support standards-based selective disclosure / zero-knowledge techniques where appropriate.

---

## 9. Credential Security Model

The production architecture should use:

```text
DID
 +
Verifiable Credential
 +
Digital Signature
 +
Credential Status / Revocation
 +
Ledger / DLT Audit Layer
```

SHA-256 may be used for deterministic integrity/digest purposes, but a hash alone does not prove issuer authenticity.

Raw identity documents and unnecessary sensitive personal information must remain off-chain.

If the current implementation uses a local/mock ledger, it must be clearly labelled as a mock/test ledger. Do not claim real blockchain transactions without a real integration.

---

## 10. Blockchain / Audit Explorer

The explorer should show audit events such as:

- Credential issued.
- Credential revoked.
- Verification event where appropriate.

Display:

- Block number.
- Event/reference.
- Block hash.
- Previous block hash.
- Timestamp.
- Event type.
- Credential reference.

No raw identity documents or unnecessary PII should be stored on-chain.

---

## 11. Hotel Use Case

VeriChain should provide a practical benefit to hotels rather than simply being presented as a blockchain product.

Expected benefits:

- Faster identity verification.
- Less manual document inspection.
- Reduced unnecessary handling of sensitive identity data.
- Cryptographic tamper detection.
- Credential revocation checking.

Long-term integration should support a verifier API so hotels can integrate VeriChain with existing check-in/PMS software rather than replacing their entire system.

---

## 12. Main Screens

1. Landing
2. How It Works
3. Dashboard
4. Digital Wallet
5. Credentials
6. Credential Detail
7. Issue Credential
8. QR Verification
9. Verification Result
10. Activity
11. Blockchain Explorer
12. Profile
13. Settings
14. Issuer Portal
15. Verifier Portal

---

## 13. Dashboard

Display:

- Greeting.
- Total credentials.
- Quick actions:
  - Scan QR
  - Add Credential
  - Settings
- Recent activity.
- Credential status.

---

## 14. Credential List & Detail

### Credential list

- All / Valid / Revoked filters.
- Search.
- Credential cards.
- Responsive layout.

### Credential detail

Display:

- Credential type.
- Holder.
- Issuer.
- Issue date.
- Expiry date.
- Credential ID.
- Verification status.
- Integrity/signature status.
- Share.
- Verify.
- Revoke where authorized.

---

## 15. Activity & Notifications

Activity should support:

- Credential issued.
- Credential presented.
- Credential verified.
- Credential revoked.
- Verification failed.
- Timestamp.
- Status.

Notifications should support:

- Issuance alerts.
- Expiry alerts.
- Revocation alerts.
- Verification alerts.
- Read/unread state.

---

## 16. UI / UX Requirements

Use the supplied reference design as the visual source of truth.

Do not convert the application into a generic SaaS dashboard or crypto trading interface.

Maintain:

- Premium identity/security aesthetic.
- Credential-card visual language.
- Blue/indigo/violet gradient system.
- Rounded surfaces.
- Clear status indicators.
- Mobile-app polish.
- Consistent spacing and typography.

### Branding

**VeriChain**

**Your Identity. Your Control. Our Blockchain.**

**Secure • Private • Tamper-Proof**

### Theme

Support:

- Light.
- Dark.
- System.

Theme must:
- Change without page reload.
- Persist using localStorage.
- Respect system preference when no preference is saved.

### Responsive behavior

Support:
- Desktop.
- Tablet.
- Mobile.

Desktop uses a left sidebar.

Mobile uses bottom navigation.

No horizontal overflow.

---

## 17. Technical Constraints

Use the existing project's technology and architecture wherever practical.

Preferred direction:

- React + TypeScript.
- Existing styling system or Tailwind CSS.
- Reusable components.
- Local/mock state for unavailable backend functionality.
- localStorage for theme preference.
- Browser Camera API for QR scanning where practical.
- Fallback verification input.

### Existing code rule

**Do not add unnecessary code, dependencies, abstractions, components, files, or features.**

Before implementing anything:

1. Inspect the existing codebase.
2. Identify what already works.
3. Reuse existing components and logic.
4. Modify existing code when appropriate.
5. Remove genuinely unnecessary/dead/duplicate code when it is safe to do so.
6. Do not rewrite working infrastructure without a clear reason.
7. Keep the implementation minimal and maintainable.

**Do not add extra features that are not required by this PRD.**

---

## 18. Demo Requirements

The application must clearly demonstrate three flows.

### Flow 1 — Authentic Credential

```text
Valid Credential
      ↓
Verifier
      ↓
Integrity/Signature Valid
      ↓
Not Revoked
      ↓
CREATOR VERIFIED (AUTHENTIC)
```

### Flow 2 — Tampered Credential

```text
Credential Data Changed
      ↓
Verifier
      ↓
Integrity/Signature Mismatch
      ↓
TAMPER DETECTED (INVALID)
```

### Flow 3 — Revoked Credential

```text
Issuer Revokes Credential
      ↓
Verifier Scans Credential
      ↓
Revocation Detected
      ↓
CREDENTIAL REVOKED
```

These flows must use the actual application state rather than static screenshots or fake result transitions.

---

## 19. Non-Functional Requirements

### Performance
- Fast navigation.
- Avoid unnecessary network requests and re-renders.
- Verification UI should feel near-instant for local/demo verification.
- Do not claim a specific verification time unless measured.

### Accessibility
- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Appropriate contrast.
- Accessible controls and labels.

### Reliability
- Loading states where needed.
- Empty states where needed.
- Error states where needed.
- Camera failure must have a fallback.
- Invalid credentials must never appear valid.

### Security
- Do not expose secrets/private keys in frontend code.
- Do not store raw identity documents on-chain.
- Minimize stored PII.
- Separate mock/test functionality from production claims.

---

## 20. Scope Priorities

### P0 — Required

- Holder wallet.
- Credential list and details.
- Issuer credential issuance.
- DID/credential ID generation.
- SHA-256 digest.
- QR generation.
- QR verification.
- Valid/tampered/revoked states.
- Credential revocation.
- Mock/test ledger.
- Activity.
- Responsive UI.
- Light/Dark/System themes.
- Core navigation.
- Demo data.

### P1 — Important

- Selective disclosure improvements.
- Notifications.
- Blockchain explorer improvements.
- Issuer/verifier role separation.
- Verification API architecture.
- Improved verification UX.

### P2 — Future

- Real blockchain integration.
- Full standards-based DID/Verifiable Credential implementation.
- Real issuer integrations.
- Production wallet.
- Advanced selective disclosure / ZK proofs.
- Enterprise verifier API.
- Government/tourism integrations.

---

## 21. Acceptance Criteria

The implementation is complete when:

- All required P0 flows work.
- Navigation works.
- Credentials can be searched and filtered.
- Credential details match the selected credential.
- Issuing updates application state.
- Revoking updates application state.
- Verification correctly distinguishes valid, tampered, revoked, and unknown credentials.
- QR presentation works or has a working fallback.
- Theme changes instantly and persists.
- Responsive layouts work on supported screen sizes.
- No critical console/build/type errors remain.
- Existing functionality is not unnecessarily broken.
- No unsupported real-blockchain claims are shown.

---

## 22. Implementation Instruction for Antigravity

**First re-check the existing VeriChain codebase against this PRD.**

Do not immediately start rebuilding the application.

### Required process

1. Inspect the current implementation.
2. Map existing features to this PRD.
3. Identify:
   - Already implemented features.
   - Partially implemented features.
   - Broken features.
   - Missing P0 requirements.
   - Unnecessary/dead/duplicate code.
4. Reuse working code.
5. Fix or extend only what is required.
6. Remove unnecessary code only when it is clearly safe and no longer used.
7. Do not introduce unrelated features.
8. Do not add unnecessary dependencies.
9. Do not rewrite the project architecture unless required.
10. Run the project's existing validation/build/test commands after changes.
11. Ensure the three demo flows work end-to-end.
12. Keep `progress.txt` updated with actual completed work.

### Important

> **This PRD is a product specification, not a request to rebuild everything from scratch.**

> **Do not add extra lines of code just to satisfy the PRD. Prefer the smallest clean change that achieves the requirement.**

> **If existing code already satisfies a requirement, leave it alone.**

> **If code is unnecessary, duplicated, unreachable, or replaced by a cleaner existing implementation, it may be removed after checking for dependencies.**

> **Do not invent functionality, claims, integrations, blockchain transactions, or security guarantees that do not exist.**
