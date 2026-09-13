# PRD: VeriChain Digital Identity Platform

## Product
VeriChain — Self-Sovereign Digital Identity & Credential Verification Platform

## Product Vision
Build a premium, trustworthy digital identity web application where users can store, manage, share and verify digital credentials. The supplied reference image is the visual source of truth for the product's UI language.

## Non-Negotiable Design Principle
Do not turn VeriChain into a generic SaaS dashboard or crypto trading UI. Reconstruct the supplied reference as a coherent responsive web application using real components. Preserve its visual hierarchy, credential-card language, blue/indigo/violet gradient system, rounded surfaces, security-focused visual language, and mobile-app polish.

## Users
1. Credential Holder — manages personal credentials.
2. Credential Issuer — issues and revokes credentials.
3. Verifier — scans/verifies credential QR codes.

## Scope
This is a production-quality frontend/demo application. Use realistic local/mock data where a backend or blockchain is not available. Never claim a real blockchain transaction occurred unless an actual integration exists.

## Technical Direction
- React + TypeScript
- Tailwind CSS or the existing project styling system
- Reusable components
- Responsive desktop/tablet/mobile layouts
- Accessible semantic HTML
- Local/mock state for demo flows
- localStorage for theme preference
- Browser camera API for QR scanning when practical, with fallback verification input

## Global UX Requirements
- Desktop left sidebar; mobile bottom navigation.
- Consistent VeriChain branding.
- Light, Dark and System appearance options.
- Theme changes instantly without reload.
- Persist theme selection.
- Respect system preference when no saved preference exists.
- All major actions produce visible feedback.
- No horizontal overflow at any supported breakpoint.
- No dead navigation or fake-looking controls.
- Loading, empty, success, error and revoked states must exist where relevant.

## Visual System
### Brand
VeriChain
Tagline: "Your Identity. Your Control. Our Blockchain."
Supporting line: "Secure • Private • Tamper-Proof"

### Palette
Deep Navy #071A3D
Dark Blue #0B2A66
Royal Blue #2563EB
Indigo #4F46E5
Violet #7C3AED
Cyan #06B6D4
Success #10B981
Warning #F59E0B
Danger #EF4444

Light background: #F7F8FC
Light surface: #FFFFFF
Light primary text: #0B1633
Light secondary text: #64748B

Dark background: #050B1C
Dark surface: #0B1530
Dark surface 2: #101D3D
Dark border: rgba(255,255,255,0.08)
Dark primary text: #F8FAFC
Dark secondary text: #94A3B8

Typography: Inter, Geist, or Plus Jakarta Sans.
Cards: approximately 16–24px radius.
Transitions: approximately 150–300ms.
Use gradients and glow sparingly.

## Routes / Screens
1. Landing
2. How It Works
3. Dashboard
4. Digital Wallet
5. Credentials
6. Credential Detail
7. Issue Credential
8. QR Verification
9. Verification Result
10. Profile
11. Settings
12. Activity

## Demo Credentials
- Aadhaar (Masked) — Government of India — Valid
- Passport — Ministry of External Affairs — Valid
- Tourism Access Pass — Government of India — Valid
- College Degree — ABC University — Valid
- Health Certificate — Health Department — Revoked

## Functional Requirements
- Navigation between all primary screens.
- Credential filtering: All / Valid / Revoked.
- Credential detail view.
- Issue credential wizard: Details → Review → Issue.
- Revoke credential with confirmation and state update.
- QR verification UI with scanning state and fallback input.
- Verification result for valid and revoked credentials.
- Search credentials.
- Profile and settings.
- Notification/activity UI.
- Toast notifications.
- Modal/dialog interactions.
- Form validation.
- Theme switching and persistence.
- Responsive navigation.

## Acceptance Criteria
A feature is complete only when its UI, interaction states, responsive behavior, and tests/checks required by the repository are complete. Do not mark a task complete merely because a screen renders.

---

# TASKS

## Phase 0 — Project Reconnaissance

### Task 0.1 — Inspect Existing Project
Priority: P0
- Inspect the existing repository before changing anything.
- Identify framework, package manager, scripts, source structure, routing, styling system, existing components, and tests.
- Do not replace working infrastructure without a concrete reason.
- Record useful findings in progress.txt.

Acceptance:
- Existing architecture is understood.
- Existing build/test/lint commands are identified.
- No unnecessary dependency churn.

---

## Phase 1 — Foundation & Design System

### Task 1.1 — Establish VeriChain Design Tokens
Priority: P0
- Create centralized light/dark design tokens.
- Implement typography, spacing, radii, borders, shadows, gradients and semantic colors.
- Ensure components can consume tokens rather than scattering hex values.

Acceptance:
- Light and dark tokens exist.
- UI does not rely on inconsistent one-off colors.
- Tokens support the reference visual language.

### Task 1.2 — Build Global App Shell
Priority: P0
- Create responsive desktop sidebar.
- Create mobile bottom navigation.
- Create header.
- Create user/avatar area.
- Create global page container.
- Establish active navigation states.

Acceptance:
- All primary routes can render inside the shell.
- Desktop and mobile navigation are usable.
- No horizontal overflow.

### Task 1.3 — Implement Real Theme System
Priority: P0
- Implement Light / Dark / System.
- Add visible theme toggle.
- Persist preference in localStorage.
- Respect system preference when unset.
- Avoid flash/inconsistent theme where practical.

Acceptance:
- Every page works in light and dark.
- Theme changes without reload.
- Preference survives refresh.
- Controls are keyboard accessible.

### Task 1.4 — Build Core UI Components
Priority: P0
Create reusable:
- Buttons
- Inputs
- Selects
- Tabs
- Cards
- Status badges
- Modals
- Toasts
- Toggles
- Empty states
- Loading/skeleton states
- Avatar/dropdown

Acceptance:
- Components are reusable and consistent.
- Interactive states exist: hover, focus, disabled, loading, error where applicable.

---

## Phase 2 — Public Experience

### Task 2.1 — Build Landing Page
Priority: P0
- Recreate the reference visual language.
- Hero headline and CTAs.
- Identity/security hero visual.
- Trust feature cards.
- Footer.

Acceptance:
- Strong visual match to reference.
- Responsive.
- CTAs navigate correctly.

### Task 2.2 — Build How It Works
Priority: P1
- Issuer → Holder → Verifier flow.
- Use reference-inspired visual timeline.
- Add security/trust explanation.

Acceptance:
- Clear 3-step explanation.
- Responsive and visually consistent.

---

## Phase 3 — Holder Experience

### Task 3.1 — Build Dashboard
Priority: P0
- "Hello, Aditi" header.
- Total Credentials featured card.
- Quick actions: Scan QR / Add Credential / Settings.
- Recent Activity.
- Status badges.

Acceptance:
- Dashboard reflects demo data.
- Quick actions work.
- Valid/revoked states are visually clear.

### Task 3.2 — Build Digital Wallet
Priority: P0
- Credential stack.
- Add credential action.
- Valid/revoked states.
- Responsive wallet layout.

Acceptance:
- Credentials are selectable.
- Wallet reflects current mock state.

### Task 3.3 — Build Credentials List
Priority: P0
- All / Valid / Revoked filters.
- Search.
- Credential cards.
- Responsive list/grid.

Acceptance:
- Filters actually change results.
- Search actually filters.
- Cards open credential details.

### Task 3.4 — Build Credential Detail
Priority: P0
- Credential metadata.
- Holder/issuer.
- Issue/expiry.
- Credential ID.
- Blockchain verification indicator.
- Share / Verify / Download / Revoke actions.

Acceptance:
- Data matches selected credential.
- Actions provide appropriate feedback.

### Task 3.5 — Build Profile
Priority: P1
- User identity.
- Personal information.
- Security & Privacy.
- Linked accounts.
- Notifications.
- Help & Support.
- About VeriChain.

Acceptance:
- Settings links are functional or clearly represented as demo sections.

---

## Phase 4 — Issuer Experience

### Task 4.1 — Build Issue Credential Wizard
Priority: P0
- Stepper: Details → Review → Issue.
- Credential type.
- Holder details.
- Validity.
- Review preview.
- Successful issue screen.

Acceptance:
- Validation works.
- State persists through steps.
- Issuing adds/updates mock credential data.
- Success state is visually polished.

### Task 4.2 — Build Credential Revocation
Priority: P0
- Revoke confirmation modal.
- Update credential state to Revoked.
- Update activity.
- Show toast.

Acceptance:
- Revoked credential no longer appears valid.
- Verification recognizes revoked state.

---

## Phase 5 — Verification Experience

### Task 5.1 — Build QR Verification Screen
Priority: P0
- Scanner frame.
- Animated scan line.
- Scanning state.
- Camera integration where supported.
- Fallback: upload QR / verification code input.

Acceptance:
- User can reach verification result from a demo flow.
- Camera failure does not trap the user.

### Task 5.2 — Build Verification Result States
Priority: P0
- Valid result.
- Revoked result.
- Invalid/not found result.
- Blockchain verification indicator.
- Credential summary.
- Done action.

Acceptance:
- Valid and revoked credentials are clearly differentiated.
- No revoked credential is shown as valid.

---

## Phase 6 — Activity, Notifications & Polish

### Task 6.1 — Build Activity Page
Priority: P1
- Issuance.
- Verification.
- Revocation.
- Timestamps.
- Status.

Acceptance:
- Activity reflects relevant mock actions.

### Task 6.2 — Build Notifications
Priority: P1
- Notification panel.
- Read/unread state.
- Credential verification/expiry/issuance alerts.

Acceptance:
- Notifications can be marked read.
- Theme support works.

### Task 6.3 — Responsive & Accessibility Pass
Priority: P0
- Verify 320–767, 768–1023, 1024–1439, 1440+.
- Keyboard navigation.
- Focus states.
- Contrast.
- Semantic structure.
- No overflow.

Acceptance:
- No broken layouts at supported sizes.
- Major controls are keyboard accessible.

### Task 6.4 — Visual Fidelity Pass
Priority: P0
- Compare every major screen against the supplied reference.
- Correct spacing, hierarchy, colors, radii, shadows, icon placement and typography.
- Remove generic/template-looking elements.

Acceptance:
- Product reads as one cohesive VeriChain design system.
- No unrelated visual styles remain.

---

## Phase 7 — Quality & Release

### Task 7.1 — Test and Fix Core Flows
Priority: P0
Test:
- Navigation
- Theme persistence
- Credential filtering/search
- Credential detail
- Issue flow
- Revoke flow
- Verification
- Profile/settings
- Responsive behavior

Acceptance:
- No critical flow is broken.

### Task 7.2 — Production Readiness
Priority: P0
- Remove console errors.
- Remove dead code.
- Fix warnings.
- Verify build.
- Verify lint/typecheck/tests where available.
- Check loading/error states.
- Confirm no fake claims of real blockchain transactions.

Acceptance:
- Production build succeeds.
- No known P0/P1 defects.
- All P0 PRD tasks complete.

### Task 7.3 — Final Design Review
Priority: P0
- Perform a final visual/product review.
- Check light mode and dark mode on every route.
- Check mobile and desktop.
- Check all interactions.
- Fix the highest-impact remaining issue.

Acceptance:
- Final application meets this PRD and the supplied visual reference.

---

# Definition of Done
A task is done only when:
1. The implementation is complete.
2. Relevant interactions work.
3. Responsive behavior is checked.
4. Light/dark theme behavior is checked where applicable.
5. Relevant tests/typecheck/lint/build commands have been run.
6. No known regression was introduced.
7. The result is recorded in progress.txt.
