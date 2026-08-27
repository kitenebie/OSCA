# OSCA System Workflow Documentation
## Bayan ng Juban — Senior Citizen Information System

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Authentication & Session Management](#authentication--session-management)
4. [Registration Workflow (NCSC-SCDF v4.0b3)](#registration-workflow)
5. [Senior Profiling & Management](#senior-profiling--management)
6. [Fingerprint Biometrics Bridge](#fingerprint-biometrics-bridge)
7. [NFC ID Card Generation](#nfc-id-card-generation)
8. [PDF Form Generation](#pdf-form-generation)
9. [Dashboard & Analytics](#dashboard--analytics)
10. [GIS Mapping & Geotagging](#gis-mapping--geotagging)
11. [SMS Notification Center](#sms-notification-center)
12. [Reports Module](#reports-module)
13. [Role-Based Access Control (RBAC)](#role-based-access-control)
14. [User & Configuration Management](#user--configuration-management)
15. [Database Schema & Migrations](#database-schema--migrations)
16. [State Management](#state-management)
17. [Deployment & Environment](#deployment--environment)

---

## System Overview

The **OSCA (Office for Senior Citizens Affairs) Information System** is a comprehensive web application designed for:

- **Profiling** — Senior citizen registration and data management
- **e-Census** — Digital census aligned with NCSC-SCDF v4.0b3
- **Biometrics** — Fingerprint capture and verification via Windows Hello
- **NFC ID Generation** — Digital and physical ID card management
- **PDF Generation** — Auto-fill NCSC forms and Centenarian claim forms
- **Benefit Distribution** — Pension and benefit tracking
- **Communication** — SMS notifications for seniors

### Compliance
- **NCSC-SCDF v4.0b3** (National Commission of Senior Citizens — Senior Citizen Data Form)
- **RA 10173** (Data Privacy Act of 2012)
- **RA 9994** (Expanded Senior Citizens Act)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                       │
│   Vite + TypeScript + Tailwind CSS 4 (Glassmorphism)            │
│   State: Zustand │ Forms: React Hook Form + Zod                 │
│   Charts: ApexCharts │ Maps: Leaflet │ PDF: pdf-lib             │
├─────────────────────────────────────────────────────────────────┤
│                        BACKEND (Supabase)                        │
│   Auth │ PostgreSQL │ Storage │ Realtime │ RLS Policies          │
├─────────────────────────────────────────────────────────────────┤
│                   FINGERPRINT BRIDGE (.NET 8)                    │
│   REST API (port 8000) │ Windows Biometric Framework            │
│   CORS-restricted │ Installed as Windows Service                │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 4 (Glassmorphism, Responsive) |
| State | Zustand (authStore, seniorsStore, settingsStore, uiStore) |
| Forms | React Hook Form + Zod validation |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| Charts | ApexCharts + react-apexcharts |
| Mapping | Leaflet + React-Leaflet + MarkerCluster |
| PDF | pdf-lib (client-side drawText overlay) |
| Export | html2canvas, modern-screenshot, jsPDF |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| AI | Google GenAI SDK |
| Biometrics | .NET 8 Fingerprint Bridge (Windows Hello) |

---

## Authentication & Session Management

### Flow

```
User Login → authStore.login()
    │
    ├── Validate credentials against Supabase `users` table
    ├── Generate session token (cryptographically secure, 64-byte hex)
    ├── Generate refresh token (if "Remember Me" enabled)
    ├── Store in `user_sessions` table (60-min TTL)
    ├── Save token to localStorage
    ├── Start session monitor (Realtime + Polling)
    │       ├── Realtime: Instant force-logout on admin termination
    │       └── Polling: Expiry check + activity touch
    └── Load user theme from Supabase settings
```

### Session Details

| Property | Value |
|----------|-------|
| Session Duration | 60 minutes |
| Refresh Token TTL | 30 days (Remember Me) |
| Session Monitor | Supabase Realtime + Polling fallback |
| Force Logout | Admin can terminate via UserManagement |
| Expiry Warning | 5 minutes before expiration |
| Storage Keys | `osca_session_token`, `osca_refresh_token`, `senior_system_auth_user` |

### Key Services
- `sessionService.ts` — Token generation, validation, refresh, termination
- `authStore.ts` — Zustand store for auth state, login/logout logic
- `deviceInfoService.ts` — Captures device name, IP, location for audit trail

---

## Registration Workflow

### 11-Step NCSC-SCDF v4.0b3 Form

```
Step 1 ─── Identifying Information
  │         (Name, DOB, Sex, Civil Status, Address, Contact,
  │          Region, Province, City/Town, Barangay, Coordinates)
  ▼
Step 2 ─── Family Composition
  │         (Spouse, Father, Mother, Children, Dependents)
  ▼
Step 3 ─── Education & HR Profile
  │         (Educational Attainment, Specializations, Skills,
  │          Community Services)
  ▼
Step 4 ─── Dependency Profile
  │         (Living arrangements, Household condition)
  ▼
Step 5 ─── Economic Profile
  │         (Income sources, Properties, Monthly income range,
  │          Problems/Needs)
  ▼
Step 6 ─── Health Profile
  │         (Physical disability, Medical conditions,
  │          Blood type, PhilHealth, GSIS/SSS)
  ▼
Step 7 ─── Disaster Risk Information
  │         (In risk area?, Risk type, Severity, Details)
  ▼
Step 8 ─── Biometrics & Photo Capture
  │         (Profile photo webcam capture, Fingerprint
  │          capture via Bridge API)
  ▼
Step 9 ─── Assisting Person Details
  │         (Helper info for assisted registration)
  ▼
Step 10 ── Signature Pad (Digital)
  │         (Canvas-based digital signature capture)
  ▼
Step 11 ── Review & Submit
            (Summary review → Save to Supabase)
```

### Registration Step Components

| Step | File |
|------|------|
| 1 | `identifying_Information.tsx` |
| 2 | `family_Composition.tsx` |
| 3 | `education_HR_Profile.tsx` |
| 4 | `dependency_Profile.tsx` |
| 5 | `economic_Profile.tsx` |
| 6 | `health_Profile.tsx` |
| 7 | `disaster_Risk_Info.tsx` |
| 8 | `biometrics_Photo.tsx` |
| 9 | `assisting_Person.tsx` |
| 10 | `signature_Pad.tsx` |
| 11 | `review_Submit.tsx` |

### Data Flow on Submit

```
Review & Submit → seniorsService.create(formData)
    │
    ├── Maps camelCase fields → snake_case DB columns
    ├── Uploads profile photo to Supabase Storage
    ├── Uploads fingerprint template (Base64)
    ├── Uploads signature data (Base64)
    ├── Inserts record to `seniors` table
    ├── Auto-generates OSCA ID number
    └── Creates audit log entry
```

---

## Senior Profiling & Management

### Pages

| Page | Purpose |
|------|---------|
| `SeniorsListPage.tsx` | Master list with search, filter, pagination |
| `SeniorProfilePage.tsx` | Full profile view with edit capabilities |
| `FindUserPage.tsx` | Quick search/lookup |

### Workflows
1. **View seniors list** → Filter by barangay, status, age bracket → Click to open profile
2. **Edit profile** → Update individual fields → Save to Supabase
3. **Mark deceased** → Status change with date tracking (`add_deceased_status.sql`)
4. **Generate documents** → PDF forms, ID cards from profile data

---

## Fingerprint Biometrics Bridge

### Architecture

```
Frontend (React)                  Fingerprint Bridge (.NET 8)
     │                                    │
     │  POST /api/capture ────────────►   │
     │                                    ├── Windows Biometric Framework
     │  ◄──────── Base64 template ────────┤   (Windows Hello sensor)
     │                                    │
     │  POST /api/verify ─────────────►   │
     │  { template, stored_template }     ├── Compare templates
     │  ◄──────── { match: true/false } ──┤
     │                                    │
     │  GET /api/status ──────────────►   │
     │  ◄──────── { status: "ready" } ────┤
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/status` | Health check / sensor availability |
| POST | `/api/capture` | Capture fingerprint → return Base64 template |
| POST | `/api/verify` | Verify template against stored template |

### Configuration
- **Host**: `http://192.168.8.34:8000`
- **CORS**: Restricted to frontend origins only
- **Installation**: Windows Service (auto-start) or manual via `start-bridge.bat`
- **ESP32 firmware**: Available in `fingerprint-bridge/esp32-firmware/` for hardware-specific setup

---

## NFC ID Card Generation

### Workflow

```
Senior Profile → Generate ID
    │
    ├── Auto-generate OSCA ID number (idGenerator.ts)
    ├── Render front/back card layout
    │       ├── Front: Photo, Name, OSCA#, QR Code
    │       └── Back: Emergency contact, Barangay, Validity
    ├── Preview with flip animation
    ├── NFC Write Simulation (nfcSimulator.ts)
    │       └── Encode senior data for physical NFC card
    └── Export as image (html2canvas)
```

### Related Files
- `src/components/id-generation/` — Card layout and preview components
- `src/utils/idGenerator.ts` — OSCA number generation algorithm
- `src/utils/nfcSimulator.ts` — NFC card encoding simulation

---

## PDF Form Generation

### Available Forms

| Form | Utility File | Purpose |
|------|-------------|---------|
| NCSC-SCDF Form | `ncscFormFiller.ts` | Official national registration form |
| Centenarian Claim Form | `centenarianFormFiller.ts` | Age 100+ honoring claim |

### Generation Flow

```
Senior Profile → "Generate PDF"
    │
    ├── Load PDF template from /public (blank form)
    ├── Map senior data fields → form coordinates
    ├── pdf-lib drawText overlay (no AcroForm)
    ├── Preview modal (NcscPdfPreviewModal.tsx)
    └── Download as filled PDF
```

### Hooks
- `useNcscPdfExport.ts` — Handles NCSC form generation lifecycle
- `useCentenarianPdfExport.ts` — Centenarian claim form generation

---

## Dashboard & Analytics

### Components (`src/components/dashboard/`)

| Widget | Description |
|--------|-------------|
| Statistics Cards | Total registered, active, pensioners, new this month |
| Age Distribution | Bar chart of age brackets |
| Gender Breakdown | Pie/donut chart |
| Barangay Distribution | Grouped bar chart per barangay |
| Registration Trend | Line chart over time |
| Status Overview | Active, inactive, deceased counts |

### Data Flow
```
DashboardPage → useSeniorsStore.seniors
    │
    ├── Compute statistics from cached seniors array
    ├── Render ApexCharts with processed data
    └── Real-time updates via Supabase subscription
```

---

## GIS Mapping & Geotagging

### Flow

```
MappingPage.tsx
    │
    ├── Load all seniors with coordinates
    ├── Initialize Leaflet map (centered on Juban, Sorsogon)
    ├── MarkerCluster for performance (500+ points)
    ├── Per-barangay layer filtering
    ├── Click marker → Senior quick-info popup
    └── Spatial queries (nearby seniors, area stats)
```

### Tech
- `react-leaflet` — React wrapper for Leaflet.js
- `leaflet.markercluster` — Efficient marker grouping
- Coordinates stored per-senior (`lat`, `lng` columns)

---

## SMS Notification Center

### Workflow

```
SMSCenterPage.tsx
    │
    ├── Template management
    │       ├── Pension distribution notice
    │       ├── Vaccination schedule
    │       ├── Medical mission announcement
    │       └── Custom template
    ├── Recipient selection
    │       ├── All seniors
    │       ├── By barangay
    │       ├── By age bracket
    │       └── Individual selection
    ├── Message composition (with template variables)
    ├── Bulk send
    └── SMS log tracking (delivery status)
```

### Related Components
- `src/components/sms/` — SMS center UI components

---

## Reports Module

### Available Reports

```
ReportsPage.tsx
    │
    ├── Demographic Summary Report
    ├── Per-Barangay Census Report
    ├── Pension Distribution Report
    ├── Newly Registered Report
    ├── Deceased Records Report
    └── Custom Date Range Export
```

### Export Capabilities
- **PDF** — via jsPDF + html2canvas
- **Screenshot** — via modern-screenshot
- **Data tables** — Filterable/sortable before export

---

## Role-Based Access Control

### Roles

| Role | Permissions |
|------|------------|
| **Encoder** | Register seniors, view list, basic profile view |
| **Supervisor** | All encoder + approve entries, reports, SMS |
| **Super Admin** | Full system control, user management, configuration, force-logout |

### Implementation

```
User Login → Load RolePermission
    │
    ├── authStore.hasPermission(permissionName) → boolean
    ├── RBAC component wrappers (src/components/rbac/)
    ├── Page-level guards in App.tsx renderPage()
    └── API-level: Supabase RLS policies per role
```

### Related Files
- `src/components/rbac/` — Permission-aware UI wrappers
- `src/store/authStore.ts` — `hasPermission()` method
- `supabase/update_roles.sql` — Role definitions

---

## User & Configuration Management

### User Management (`UserManagementPage.tsx`)

```
Super Admin → User Management
    │
    ├── List all users with role, status, last activity
    ├── Create new user (assign role)
    ├── Edit user profile / reset password
    ├── Activate / Deactivate accounts
    ├── View active sessions (per user)
    └── Force terminate session (Realtime → instant logout)
```

### Configuration (`ConfigurationPage.tsx`)

```
Super Admin → Configuration
    │
    ├── System settings (organization name, logo, branding)
    ├── ID Card configuration (layout, template, numbering format)
    ├── Document Signatories management
    │       ├── Add/edit signatories with digital signatures
    │       └── Auto-populate on generated forms
    ├── Theme / appearance settings (per user)
    └── System-wide defaults
```

---

## Database Schema & Migrations

### Migration History

| # | Migration File | Purpose |
|---|---------------|---------|
| 1 | `migration.sql` | Base schema (users, seniors, benefits, sms_logs, barangays) |
| 2 | `add_ncsc_fields.sql` | Full NCSC-SCDF data columns |
| 3 | `add_deceased_status.sql` | Deceased tracking fields |
| 4 | `add_password_column.sql` | User credential management |
| 5 | `document_signatories.sql` | Signatory table for forms |
| 6 | `add_signature_data_to_signatories.sql` | Digital signature storage (Base64) |
| 7 | `notifications.sql` | In-app notification system |
| 8 | `storage_policies.sql` | Supabase Storage RLS policies |
| 9 | `user_settings.sql` | User theme/preference storage |
| 10 | `update_roles.sql` | RBAC role permission definitions |
| 11 | `create_user_sessions.sql` | Session management table |
| 12 | `user_sessions_policies.sql` | Session RLS policies |
| 13 | `add_device_info_columns.sql` | Device metadata for sessions |
| 14 | `add_fingerprint_settings.sql` | Biometric settings table |
| 15 | `id_card_config_and_system_settings.sql` | ID card config + system settings |
| 16 | `centenarian_honoring.sql` | Centenarian application/status table |
| 17 | `create_system_assets_bucket.sql` | Storage bucket for system assets |
| 18 | `fix_fk.sql` | Foreign key constraint fixes |
| 19 | `update_audit_logs_constraints.sql` | Audit log integrity |
| 20 | `seed.sql` | Initial seed data (barangays, default admin) |

### Core Tables

| Table | Purpose |
|-------|---------|
| `seniors` | Main senior citizen profiles (100+ columns) |
| `users` | System user accounts (encoders, supervisors, admins) |
| `user_sessions` | Active session tracking |
| `benefits` | Pension/benefit distribution records |
| `sms_logs` | SMS notification history |
| `barangays` | Barangay reference data |
| `role_permissions` | Role-based permission matrix |
| `audit_logs` | Activity audit trail |
| `document_signatories` | Form signatory configurations |
| `notifications` | In-app notification queue |
| `user_settings` | Per-user theme/preferences |
| `centenarian_applications` | Centenarian honoring tracking |
| `id_card_config` | ID card layout configuration |
| `system_settings` | Global system configuration |

---

## State Management

### Zustand Stores

| Store | File | Responsibility |
|-------|------|---------------|
| **authStore** | `authStore.ts` | User session, login/logout, RBAC, session monitor |
| **seniorsStore** | `seniorsStore.ts` | Senior records CRUD, search, filter, caching |
| **settingsStore** | `settingsStore.ts` | App configuration, signatories, system settings |
| **uiStore** | `uiStore.ts` | Active page, toasts, modals, session dismissed state |

### Contexts
| Context | File | Purpose |
|---------|------|---------|
| UsbSignaturePadContext | `UsbSignaturePadContext.tsx` | USB signature pad hardware integration |

### Custom Hooks
| Hook | Purpose |
|------|---------|
| `useBarangays` | Fetch and cache barangay reference data |
| `useNcscPdfExport` | NCSC form PDF generation lifecycle |
| `useCentenarianPdfExport` | Centenarian form PDF generation |

---

## Deployment & Environment

### Network Configuration

| Service | URL | Port |
|---------|-----|------|
| Frontend (Dev) | `http://192.168.8.34:3000` | 3000 |
| Fingerprint Bridge | `http://192.168.8.34:8000` | 8000 |
| Production | `https://me.oscajuban.online` | 443 |

### Build Commands

```bash
# Development
npm run dev          # Start dev server (port 3000, LAN accessible)

# Production
npm run build        # Vite production build → /dist
npm run preview      # Preview production build locally

# Quality
npm run lint         # TypeScript type checking (tsc --noEmit)
npm run clean        # Remove dist/ and server.js
```

### Fingerprint Bridge Deployment

```bash
cd fingerprint-bridge

# Option 1: Run directly
dotnet run

# Option 2: Install as Windows Service (requires Admin)
./install-as-service.bat

# Option 3: Manual start
./start-bridge.bat
```

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| .NET SDK | 8.0 |
| Windows | 10/11 (for biometrics) |
| Fingerprint Sensor | Windows Hello compatible |

---

## Page Router Map

```
App.tsx (Root)
    │
    ├── [Not logged in] → LoginPage
    │
    └── [Logged in] → DashboardLayout
            │
            ├── Dashboard        → DashboardPage.tsx
            ├── SeniorsList      → SeniorsListPage.tsx
            ├── SeniorProfile    → SeniorProfilePage.tsx
            ├── Register         → SeniorRegistrationPage.tsx
            ├── Reports          → ReportsPage.tsx
            ├── SMSCenter        → SMSCenterPage.tsx
            ├── UserManagement   → UserManagementPage.tsx
            ├── FindUser         → FindUserPage.tsx
            ├── Configuration    → ConfigurationPage.tsx
            ├── Mapping          → MappingPage.tsx
            └── GranteeClaimForms→ GranteeClaimFormsPage.tsx
```

---

## Data Flow Summary

```
                    ┌──────────────┐
                    │   Supabase   │
                    │  PostgreSQL  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌─────▼─────┐ ┌───▼────────┐
     │supabaseServ│ │sessionServ│ │storageServ │
     │  ice.ts    │ │  ice.ts   │ │  ice.ts    │
     └────────┬───┘ └─────┬─────┘ └───┬────────┘
              │            │            │
     ┌────────▼────────────▼────────────▼────────┐
     │           Zustand Stores                    │
     │  authStore │ seniorsStore │ settingsStore   │
     └─────────────────────┬───────────────────────┘
                           │
     ┌─────────────────────▼───────────────────────┐
     │              React Components                 │
     │  Pages → Components → UI Primitives           │
     └──────────────────────────────────────────────┘
```

---

## Security Measures

| Layer | Implementation |
|-------|---------------|
| Authentication | Custom session tokens (60-min TTL) + Refresh tokens |
| Authorization | Role-based permissions (Encoder/Supervisor/Super Admin) |
| Database | Supabase Row-Level Security (RLS) on all tables |
| API | CORS-restricted endpoints (Fingerprint Bridge) |
| Data Privacy | RA 10173 compliance, encrypted biometric storage |
| Session Security | Force-terminate via Realtime, device tracking, audit logs |
| Input Validation | Zod schemas on all form submissions |
| File Storage | Supabase Storage with bucket-level RLS policies |

---

*Document generated: August 27, 2026*
*Project: OSCA — Bayan ng Juban, Lalawigan ng Sorsogon*
