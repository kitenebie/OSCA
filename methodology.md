# Methodology

## OSCA Senior Citizen Information System
**Office for Senior Citizens Affairs — Bayan ng Juban, Sorsogon**

---

## 1. Introduction

The OSCA Senior Citizen Information System is a comprehensive web-based platform developed for the Office for Senior Citizens Affairs of the Municipality of Juban, Sorsogon. It serves as the centralized digital infrastructure for senior citizen e-Census, profiling, biometric verification, benefits management, NFC ID card generation, SMS notification, GIS mapping, and the Centenarian Honoring Program (R.A. 11982).

The system is designed to comply with the following national standards and regulations:

- **NCSC-SCDF v4.0b3** — National Commission of Senior Citizens Standard Data Collection Form
- **Republic Act No. 10173** — Data Privacy Act of 2012
- **Republic Act No. 11982** — An Act Honoring Filipino Octogenarians, Nonagenarians, and Centenarians

---

## 2. System Architecture

### 2.1 Architectural Pattern

The system follows a **client-heavy Single Page Application (SPA)** architecture with a **Backend-as-a-Service (BaaS)** pattern using Supabase.

```
┌───────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│  React 18 + TypeScript + Vite + Tailwind CSS 4        │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │  Pages  │  │Components│  │  State (Zustand)      │ │
│  └────┬────┘  └────┬─────┘  └──────────┬───────────┘ │
│       └─────────────┴──────────────────-┘             │
│                        │                               │
└────────────────────────┼───────────────────────────────┘
                         │ HTTPS (REST + Realtime WS)
┌────────────────────────┼───────────────────────────────┐
│              SUPABASE (Backend-as-a-Service)            │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │PostgreSQL│  │  Storage   │  │ Realtime (WS)    │   │
│  │ Database │  │  (Files)   │  │ (Live updates)   │   │
│  └──────────┘  └────────────┘  └──────────────────┘   │
└────────────────────────────────────────────────────────┘
                         │
┌────────────────────────┼───────────────────────────────┐
│          LOCAL HARDWARE BRIDGE (Optional)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  .NET 8 Fingerprint Bridge (Windows Service)     │  │
│  │  REST API @ http://192.168.8.34:8000             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | Component-based UI with type safety |
| Build Tool | Vite 6 | Fast HMR, optimized production builds |
| Styling | Tailwind CSS 4 | Utility-first responsive design |
| State Management | Zustand 5 | Lightweight global state with subscriptions |
| Forms & Validation | React Hook Form + Zod | Schema-based form validation |
| Backend & Database | Supabase (PostgreSQL) | Auth, DB, Storage, Realtime |
| Charts & Analytics | ApexCharts | Interactive data visualizations |
| Mapping | Leaflet + React-Leaflet | GIS, geolocation, clustering |
| PDF Generation | pdf-lib | Client-side PDF form filling |
| Export | html2canvas, jsPDF | Screenshot export, PDF creation |
| Animation | Motion (Framer Motion) | Smooth UI transitions |
| Icons | Lucide React | Consistent iconography |
| AI Integration | Google GenAI SDK | AI-powered features |
| Biometrics | .NET 8 Bridge | Fingerprint capture/verify |

---

## 3. Development Methodology

### 3.1 Approach: Agile Iterative Development

The project follows an **Agile Iterative** methodology with continuous delivery:

1. **Requirements Gathering** — Direct consultation with OSCA Juban staff, MSWDO officers, and barangay encoders to identify functional needs.
2. **Incremental Development** — Features are built and deployed in short sprints, prioritized by operational urgency.
3. **User Feedback Loops** — Each module is tested with actual LGU personnel before moving to the next feature.
4. **Continuous Integration** — GitHub Actions workflow for automated deployment.

### 3.2 Software Development Life Cycle (SDLC)

```
  ┌──────────┐     ┌───────────┐     ┌──────────┐
  │ Planning │ ──► │  Design   │ ──► │  Develop │
  └──────────┘     └───────────┘     └──────────┘
       ▲                                    │
       │                                    ▼
  ┌──────────┐     ┌───────────┐     ┌──────────┐
  │  Deploy  │ ◄── │   Test    │ ◄── │  Review  │
  └──────────┘     └───────────┘     └──────────┘
```

| Phase | Activities |
|-------|-----------|
| **Planning** | Requirements analysis, stakeholder interviews, compliance review (NCSC, DPA) |
| **Design** | UI/UX wireframing, database schema design, API contract definition |
| **Develop** | Component implementation, service integration, state management |
| **Review** | Code review, accessibility audit, security review |
| **Test** | Unit testing, integration testing, UAT with LGU staff |
| **Deploy** | CI/CD via GitHub Actions, production deployment to hosting |

---

## 4. Database Design

### 4.1 Entity-Relationship Overview

The PostgreSQL database (hosted on Supabase) consists of the following core tables:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `seniors` | Main senior citizen records | osca_number, personal info, biometrics, status, address, NCSC fields |
| `users` | System operators/staff | username, role, barangay_assigned, session management |
| `barangays` | Geographic divisions | name, coordinates, population counts |
| `benefits` | Pension/benefit programs | title, amount, frequency, distribution |
| `sms_logs` | SMS notification history | recipient, message, status, timestamp |
| `roles` | RBAC permission matrix | granular permission flags per role |
| `centenarian_honoring` | R.A. 11982 claim forms | personal info, family, payment, documents, status |
| `audit_logs` | System activity audit trail | action, entity, actor, severity, timestamp |
| `user_sessions` | Active login sessions | token, expiry, device info, IP, location |
| `system_settings` | App configuration | key-value settings (logo, branding, toggles) |
| `report_templates` | Report definitions | type, category, parameters |
| `notifications` | In-app notifications | type, title, content, read status |
| `document_signatories` | Official signatories | position, name, digital signature |

### 4.2 Data Relationships

```
barangays (1) ──────── (N) seniors
seniors   (1) ──────── (N) centenarian_honoring
users     (1) ──────── (N) user_sessions
users     (1) ──────── (N) audit_logs
roles     (1) ──────── (N) users
seniors   (1) ──────── (N) sms_logs
```

### 4.3 Security Features

- **Row Level Security (RLS)** — Supabase RLS policies restrict data access
- **SHA-256 Password Hashing** — User passwords stored as secure hashes
- **Session Token Management** — 60-minute expiry, cryptographic tokens, device tracking
- **Soft Delete** — Records marked with `deleted_at` rather than permanently removed
- **Audit Logging** — All critical actions logged with actor, timestamp, and severity

---

## 5. System Modules

### 5.1 Authentication & Access Control

- **Role-Based Access Control (RBAC)** with 4 roles:
  - **Super Admin** — Full system access, user management, configuration
  - **MSWDO Officer** — Approve/reject registrations, view reports
  - **Barangay Encoder** — Register seniors, data entry, limited access
  - **Viewer** — Read-only access to records
- **Session Management** — Token-based with auto-expiry, remember-me (30 days), device info capture
- **Force Logout** — Admins can terminate active sessions remotely
- **Login Lockout** — 3 failed attempts triggers 60-second lockout

### 5.2 Senior Citizen Registration (NCSC-SCDF v4.0b3)

An 11-step multi-step registration form aligned with the national standard:

| Step | Section | Data Collected |
|------|---------|---------------|
| 1 | Identifying Information | Name, birthdate, sex, civil status, IDs (GSIS, SSS, TIN, PhilHealth) |
| 2 | Family Composition | Spouse, parents, children, dependents |
| 3 | Education & HR Profile | Specializations, skills, community services |
| 4 | Dependency Profile | Living arrangement, household conditions |
| 5 | Economic Profile | Income sources, properties, monthly income range |
| 6 | Health Profile | Disabilities, medical/dental/optical/hearing concerns, medications |
| 7 | Disaster Risk Information | Risk area status, type, severity level |
| 8 | Biometrics & Photo | Profile photo capture, fingerprint scan |
| 9 | Address Map Pin | GIS coordinate tagging via Leaflet map |
| 10 | Digital Signature | Canvas-based signature pad |
| 11 | Review & Submit | Complete information review before submission |

### 5.3 Centenarian Honoring Program (R.A. 11982)

Manages the complete workflow for honoring senior citizens at milestone ages:

| Age Milestone | Cash Gift |
|--------------|-----------|
| 80 & 85 years old | ₱10,000 |
| 90 & 95 years old | ₱10,000 |
| 100+ years old | ₱100,000 |

**Workflow:**
1. Admin enables registration → System generates unique passwords for qualified seniors
2. System sends SMS to all qualified seniors with credentials
3. Senior accesses public form, authenticates with OSCA ID + password
4. Senior fills out Grantee Claim Form (Annex A)
5. Staff reviews submission → status progresses: `Pending → Under Review → Verified → Approved → Claimed`
6. Senior can track status via public "Check Honoring Status" page (authenticated)

**Status Lifecycle:**
```
Pending → Under Review → Verified → Approved → Claimed
                                  ↘ Rejected
                       Approved → Unclaimed (if not collected within deadline)
```

### 5.4 SMS Notification System

- **Individual SMS** — Send targeted messages to specific seniors
- **Batch SMS** — Broadcast to entire barangay or all seniors
- **Template System** — Pre-built templates with `[name]` and `[barangay]` tokens
- **Auto-SMS Triggers:**
  - Status update notifications (approved, rejected, etc.)
  - Grantee registration opening announcements
- **SMS Logging** — All sent messages logged with status tracking
- **Gateway Ready** — Prepared for Semaphore.co / Twilio / Globe Labs integration

### 5.5 GIS Mapping & Geolocation

- Interactive Leaflet map with barangay boundary visualization
- MarkerCluster for efficient rendering of large datasets
- Per-senior address geotagging during registration
- Spatial analytics per barangay

### 5.6 Dashboard & Analytics

- Real-time statistics (total seniors, approved, pending, etc.)
- Demographic breakdown (age brackets, sex ratio, barangay distribution)
- ApexCharts interactive visualizations
- Pension beneficiary tracking

### 5.7 Reports Module

- Master List generation (filterable by barangay, status, age)
- Pension distribution reports
- Census summary reports
- PDF/screenshot export capability

### 5.8 PDF Form Generation

- **NCSC-SCDF Form Auto-Fill** — Generates pre-filled official NCSC forms using pdf-lib
- **Centenarian Honoring Form** — Auto-generates Annex A claim forms
- Client-side generation (no server round-trip needed)
- Preview modal before download

### 5.9 NFC ID Card Generation

- Digital OSCA ID card layout (front/back)
- Photo, QR code, and senior information rendering
- NFC write simulation for physical card encoding
- Automated ID number generation system

### 5.10 Configuration & System Settings

- Dynamic branding (logo, titles, descriptions)
- Document signatory management (digital signatures)
- System-wide toggles (registration enable/disable)
- Theme customization per user

---

## 6. State Management Strategy

The application uses **Zustand** for global state management with the following stores:

| Store | Responsibility |
|-------|---------------|
| `authStore` | Authentication, session, RBAC permissions, login/logout |
| `seniorsStore` | Senior records, benefits, SMS logs, CRUD operations |
| `uiStore` | UI state (current page, toasts, modals, selected entities) |
| `settingsStore` | System settings, theme, dynamic configuration |

### Realtime Subscriptions

Supabase Realtime channels provide live data synchronization:
- Senior records update across all connected clients
- SMS log status changes reflect immediately
- Benefits distribution updates in real-time

---

## 7. Security Implementation

### 7.1 Authentication Flow

```
User → Login Form → SHA-256 Hash → Verify against DB
                                          │
                              ┌────────────┴────────────┐
                              ▼                         ▼
                         [SUCCESS]                  [FAILURE]
                              │                         │
                   Generate Session Token         Increment attempts
                   Store in localStorage          Lock if 3 failures
                   Start session monitor
                              │
                   60-min auto-expiry
                   Activity touch extends
```

### 7.2 Public Page Authentication (Grantee Forms)

For senior citizens accessing the public-facing pages:

1. **Password Generation** — System generates 10-character alphanumeric passwords (uppercase + digits)
2. **SMS Delivery** — Credentials sent via SMS when registration is enabled
3. **Verification** — OSCA ID + password validated against `seniors` table before access
4. **No Session** — Stateless verification per action (no persistent session for public users)

### 7.3 Audit Trail

All sensitive operations are logged:
- Login/logout events
- Senior record modifications (create, update, approve, reject)
- SMS broadcasts
- Status changes
- Registration toggle events
- User management actions

---

## 8. Deployment & Infrastructure

### 8.1 Hosting Architecture

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend (Production) | Static Hosting | `https://me.oscajuban.online` |
| Database & API | Supabase Cloud | `https://xbrvrugudancmchrerqu.supabase.co` |
| File Storage | Supabase Storage | Buckets: `centenarian-docs`, `system-assets` |
| CI/CD | GitHub Actions | Auto-deploy on push to main |
| Fingerprint Bridge | Local Windows Service | `http://192.168.8.34:8000` |

### 8.2 CI/CD Pipeline

```yaml
Trigger: Push to main branch
Steps:
  1. Checkout code
  2. Install dependencies (npm ci)
  3. Build production bundle (vite build)
  4. Deploy to hosting platform
```

### 8.3 Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |

---

## 9. Data Flow Diagrams

### 9.1 Senior Registration Flow

```
Barangay Encoder                    System                      MSWDO Officer
      │                               │                              │
      │  Fill 11-Step Form            │                              │
      ├──────────────────────────────►│                              │
      │                               │  Save to DB (Pending)        │
      │                               ├─────────────────────────────►│
      │                               │                              │  Review & Approve
      │                               │◄─────────────────────────────┤
      │                               │  Update Status               │
      │                               │  Send SMS to Senior          │
      │  ◄────────────────────────────┤                              │
      │  View Updated Status          │                              │
```

### 9.2 Centenarian Honoring Flow

```
Admin                     System                    Senior Citizen
  │                         │                            │
  │  Toggle Registration ON │                            │
  ├────────────────────────►│                            │
  │  (Enter Password)       │                            │
  │                         │  Generate Passwords        │
  │                         │  for Qualified Seniors     │
  │                         │                            │
  │                         │  Send SMS with Credentials │
  │                         ├───────────────────────────►│
  │                         │                            │
  │                         │         Enter OSCA ID +    │
  │                         │◄───────────Password────────┤
  │                         │                            │
  │                         │  Verify Credentials        │
  │                         │  Show Claim Form           │
  │                         ├───────────────────────────►│
  │                         │                            │  Fill & Submit
  │                         │◄───────────────────────────┤
  │                         │                            │
  │  Review Submission      │                            │
  │◄────────────────────────┤                            │
  │  Approve/Reject         │                            │
  ├────────────────────────►│  Send SMS Status Update    │
  │                         ├───────────────────────────►│
```

---

## 10. User Interface Design

### 10.1 Design Principles

- **Glassmorphism** — Semi-transparent cards with backdrop blur for depth
- **Mobile-First Responsive** — Full functionality on phones, tablets, and desktops
- **Accessibility** — Large touch targets, clear typography, high contrast
- **Filipino-Elder Friendly** — Clear status descriptions, simple navigation
- **Republic Color Scheme** — Philippine flag-inspired accent bars (red, yellow, blue)

### 10.2 Responsive Breakpoints

| Breakpoint | Target Device | Layout Behavior |
|-----------|--------------|----------------|
| < 400px | Small phones | Single column, stacked inputs |
| 400px–640px (sm) | Large phones | 2-column grids where appropriate |
| 640px–768px (md) | Tablets | 3-column grids, inline forms |
| 768px–1024px (lg) | Small laptops | Full sidebar, 4-column grids |
| > 1024px (xl) | Desktops | Maximum content width, spacious layout |

### 10.3 Page Architecture

| Page | Access | Purpose |
|------|--------|---------|
| Landing Page | Public | System information, registration links |
| Login | Public | Staff authentication portal |
| Check Honoring Status | Public (authenticated) | Senior views their claim status |
| Grantee Claim Form | Public (authenticated) | Senior fills Annex A form |
| Dashboard | Staff | Analytics and overview |
| Seniors List | Staff | Browse, search, manage seniors |
| Senior Profile | Staff | Detailed view with approve/reject |
| Registration | Staff | 11-step NCSC form |
| Reports | Staff | Generate exportable reports |
| SMS Center | Staff | Compose and broadcast SMS |
| Mapping | Staff | GIS visualization |
| Grantee Claim Forms | Staff | Review submitted claims |
| User Management | Admin | Staff accounts and roles |
| Configuration | Admin | System settings and branding |

---

## 11. Testing Strategy

| Level | Approach | Scope |
|-------|----------|-------|
| Component Testing | Manual + visual review | UI components render correctly |
| Integration Testing | Supabase query verification | Data flows correctly between client and DB |
| User Acceptance Testing (UAT) | LGU staff feedback sessions | Real-world workflow validation |
| Security Testing | Authentication flow testing | Login lockout, session expiry, RBAC enforcement |
| Responsive Testing | Multi-device browser testing | Mobile, tablet, desktop rendering |
| Performance Testing | Lighthouse audits | Load time, FCP, bundle size optimization |

---

## 12. Compliance & Standards

| Standard/Law | Implementation |
|-------------|---------------|
| **NCSC-SCDF v4.0b3** | 11-step registration form mirrors official form fields exactly |
| **R.A. 10173 (Data Privacy Act)** | Consent collection, data minimization, secure storage, audit trails |
| **R.A. 11982 (Centenarian Honoring)** | Full Annex A claim form digitization, milestone-based workflow |
| **R.A. 9994 (Expanded Senior Citizens Act)** | Pension tracking, benefits management, ID generation |

---

## 13. Limitations & Future Enhancements

### Current Limitations

- SMS gateway is simulated (logs to database) — requires Semaphore/Twilio API key for production
- Fingerprint biometric requires Windows machine with compatible sensor
- No offline mode — requires internet connection for all operations
- Single-LGU deployment (Juban only) — not yet multi-tenant

### Planned Enhancements

- Real SMS gateway integration (Semaphore.co)
- Offline-first PWA capabilities
- Mobile companion app for barangay encoders
- Multi-LGU deployment support
- Advanced AI-powered data analytics
- Barcode/QR scanning for physical OSCA IDs

---

## 14. Conclusion

The OSCA Senior Citizen Information System represents a modern, standards-compliant digital solution for local government senior citizen management. By leveraging contemporary web technologies (React, TypeScript, Supabase) and following established Filipino government data standards (NCSC-SCDF), the system provides a secure, efficient, and user-friendly platform that serves both government staff and senior citizens directly.

The methodology emphasizes iterative development with continuous stakeholder feedback, ensuring the final product meets the real operational needs of OSCA Juban while maintaining compliance with national data privacy and senior citizen welfare regulations.

---

*Document Version: 1.0*
*System: OSCA Senior Citizen Information System — Bayan ng Juban*
*Date: August 2026*
