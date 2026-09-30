# OSCA System Workflow Documentation

## Bayan ng Juban — Senior Citizen Information System

This is the canonical technical workflow document for the current codebase. It supersedes the August 2026 bridge-based workflow.

## System overview

OSCA is a React 18 + TypeScript single-page application. Zustand stores coordinate client state; Supabase supplies PostgreSQL data, Storage, and Realtime subscriptions. Application pages are selected in `src/App.tsx` after application-managed session initialization.

```text
Browser (React/Vite)
  ├─ Zustand: authStore, seniorsStore, settingsStore, uiStore
  ├─ Services: Supabase, session, storage, fingerprint device
  ├─ HID SDK + HID Authentication Device Client (optional, local scanner PC)
  └─ ESP32/R307 HTTP preview endpoint (optional scanner-test mode)
                  │
                  ▼
Supabase: PostgreSQL · Storage · Realtime
```

## Registration workflow

`SeniorRegistrationPage.tsx` manages an 11-step NCSC-aligned form. Address information is entered at Step 1; the derived address combines house number, street, barangay, city/town, and province.

| Step | Current section | Primary component |
| --- | --- | --- |
| 1 | Identifying Information | `registration/steps/identifying_Information.tsx` |
| 2 | Family Composition | `registration/steps/family_Composition.tsx` |
| 3 | Education / HR Profile | `registration/steps/education_HR_Profile.tsx` |
| 4 | Dependency Profile | `registration/steps/dependency_Profile.tsx` |
| 5 | Economic Profile | `registration/steps/economic_Profile.tsx` |
| 6 | Health Profile | `registration/steps/health_Profile.tsx` |
| 7 | Biometrics & Photo | `registration/steps/biometrics_Photo.tsx` |
| 8 | Signature Pad | `registration/steps/signature_Pad.tsx` |
| 9 | Assisting Person | `registration/steps/assisting_Person.tsx` |
| 10 | Disaster Risk Info | `registration/steps/disaster_Risk_Info.tsx` |
| 11 | Review & Submit | `registration/steps/review_Submit.tsx` |

### Submission data flow

```text
Review & Submit
  → seniorsStore.addSenior() / updateSenior()
    → upload base64 profile photo, signature, and (when present) fingerprint PNG
    → map camelCase form fields to Supabase columns
    → create or update `seniors`
    → write audit-log event
    → Supabase Realtime refreshes subscribing clients
```

Profile photos and signatures have senior-based storage names. A fingerprint image is a scanner-produced PNG, limited to 2 MB, stored below `fingerprints/` in the selected `seniors-1`, `seniors-2`, or `seniors-3` bucket. Its public URL is kept in `seniors.thumbprint_data`. On a replacement update, the previous fingerprint object is removed after the record update; an unsuccessful write cleans up the newly uploaded object.

## Fingerprint scanner workflows

### DigitalPersona U.are.U 4500 — registration path

The supported registration component is `FingerprintScanner`.

1. The browser loads the HID Web SDK scripts supplied by `@digitalpersona/websdk` and `@digitalpersona/fingerprint`.
2. `checkScanner()` enumerates devices through HID Authentication Device Client on the same Windows PC.
3. **Start Scan** requests a PNG sample, watches quality/device events, and has a 15-second timeout. The scan can be cancelled.
4. A valid PNG is previewed in the form. At submit time it is uploaded to Storage and the public image URL replaces the data URI.
5. Configuration testing calls the same device path without image capture, so no biometric image or template is retained.

This feature captures an **image record only**. The application does not create biometric templates, enroll a person, compare fingerprints, or verify identity. The obsolete `fingerprint-bridge` .NET project is retained as legacy capture-test code and is not called by the React application.

### ESP32 + R307/AS608 — optional test path

The firmware in `fingerprint-bridge/esp32-firmware/` joins an existing Wi-Fi network and exposes `GET /status` and `GET /live/detect/fingerprint`. The browser test UI polls the live endpoint approximately every 500 ms; it returns a BMP when a finger is detected. The current ESP32 capture component is for live preview/test behavior and does **not** pass that BMP into the registration record or Storage upload. See its dedicated README for wiring and setup.

### Privacy and deployment warning

The current storage implementation returns public URLs. Fingerprint images are sensitive personal data and must not be used as login or proof-of-identity credentials. Before a production biometric rollout, make the bucket private, serve files through authorized access controls, document consent/retention, and move any credential matching to a server-side system with a suitable biometric-security design.

## Profile, senior list, and location workflow

`SeniorsListPage.tsx` provides search/filter navigation to `SeniorProfilePage.tsx`. The profile shows an image when `thumbprintData` is a data URI or an HTTPS URL; legacy non-image values are not presented as fingerprint credentials. The profile supports record updates, status changes, deceased details, ID generation, and document actions.

Coordinates are stored in `lat` and `lng`; `MappingPage.tsx` renders available senior locations through Leaflet and marker clustering.

## Documents and reports

PDF utilities remain responsible for the NCSC-SCDF and centenarian claim forms. `ReportsPage.tsx` generates a preview and downloadable DOCX file through `docxtemplater`, `pizzip`, and `docx-preview` for the following current document types:

| Document | Generator |
| --- | --- |
| OSCA Transmittal | `transmittalDocxGenerator.ts` |
| MSWDO Transmittal | `mswdoTransmittalDocxGenerator.ts` |
| Certificate of Transfer | `certificateTransferDocxGenerator.ts` |
| DSWD Social Pension Certification | `certificationDocxGenerator.ts` |
| Octogenarian/Nonagenarian/Centenarian Masterlist | `masterlistDocxGenerator.ts` |
| PhilHealth Transmittal | `philhealthTransmittalDocxGenerator.ts` |

The OSCA transmittal reads configurable barangay/signature rows from `transmittal_barangay_signatures`. The PhilHealth flow saves selected seniors in `philhealth_transmittal_seniors` and reads its office address from `philhealth_transmittal_settings`.

## Centenarian honoring workflow

The staff page `GranteeClaimFormsPage.tsx` reviews public claim submissions in `centenarian_honoring`. A Super Admin can enable registration after password confirmation; for seniors with `Qualified for Honoring` status and contact numbers, the app generates a 10-character uppercase/alphanumeric password, updates the senior record, and records an SMS-log entry. Staff validate submitted attachments and can approve or reject the claim. The public status page provides the approved-record document download path.

## Authentication, RBAC, and sessions

`authStore` initializes the current user and the `sessionService` manages application session records. `RoleGuard` and page-level permission checks determine which actions/pages are available. `user_sessions` supports device information and remote session termination; `audit_logs` records significant actions. These are application-managed sessions—not a replacement for server-enforced authorization. Supabase RLS and Storage policies must be reviewed and tightened for production.

## Main data and configuration

| Area | Current source |
| --- | --- |
| Senior records and reference barangays | `seniors`, `barangays` |
| User settings and roles | `users`, `roles`, `user_settings`, `user_sessions` |
| Documents | `document_signatories`, `transmittal_barangay_signatures`, PhilHealth transmittal tables |
| System settings | `system_settings`, including `fingerprint_scanner_type` and `fingerprint_scanner_endpoint` |
| Storage rotation | `seniors-1` → `seniors-2` → `seniors-3`, checked against a 50 MB limit per bucket |

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

The development server is configured by Vite on port 3000. Required client environment variables are `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; see `.env.example` for the expected names.

*Last updated: September 29, 2026*
