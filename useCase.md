# Use Case Diagram

## OSCA Senior Citizen Information System
**Office for Senior Citizens Affairs — Bayan ng Juban, Sorsogon**

---

## Full Use Case Diagram

![OSCA Use Case Diagram](/public/usecase_diagram.svg)

---

## Actors

| Actor | Type | Description |
|-------|------|-------------|
| **Super Admin** | Primary | Full system access — manages users, configuration, all modules |
| **MSWDO Officer** | Primary | Reviews/approves registrations, manages benefits, generates reports |
| **Barangay Encoder** | Primary | Registers senior citizens, data entry, limited module access |
| **Senior Citizen** | Primary (External) | Accesses public pages — submits claim forms, checks honoring status |
| **System (Automated)** | Secondary | Background processes — SMS triggers, session management, real-time sync |
| **Fingerprint Bridge** | Secondary (Hardware) | .NET 8 Windows Service — captures and verifies fingerprint biometrics |

---

## Use Cases by Module

### UC-1: Authentication & Access Control

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-1.1 | Login to System | Super Admin, MSWDO Officer, Barangay Encoder | Staff authenticate using username + SHA-256 hashed password with session token generation |
| UC-1.2 | Manage User Accounts | Super Admin | Create, update, deactivate staff accounts; assign roles and barangay assignments |
| UC-1.3 | Force Logout User Session | Super Admin | Terminate active sessions remotely for security enforcement |
| UC-1.4 | View Audit Logs | Super Admin | View chronological log of all system actions with actor, timestamp, and severity |
| UC-1.5 | Auto-Expire Sessions | System | Automatically invalidate sessions after 60 minutes of inactivity |

---

### UC-2: Senior Citizen Registration & Profiling

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-2.1 | Register Senior Citizen (11-Step NCSC-SCDF Form) | Barangay Encoder, Super Admin | Complete multi-step registration: Identifying Info → Family → Education → Dependency → Economic → Health → Disaster Risk → Biometrics → Address → Signature → Review |
| UC-2.2 | Capture Biometrics (Fingerprint & Photo) | Barangay Encoder, Fingerprint Bridge | Capture profile photo and fingerprint template via .NET 8 Bridge REST API |
| UC-2.3 | View/Search Senior Records | Super Admin, MSWDO Officer, Barangay Encoder | Browse, filter, and search the senior citizen database |
| UC-2.4 | Update Senior Profile | Super Admin, MSWDO Officer | Edit existing senior information, update contact details |
| UC-2.5 | Approve/Reject Registration | MSWDO Officer, Super Admin | Review pending registrations and change status to Approved or Rejected |
| UC-2.6 | Mark Senior as Deceased | MSWDO Officer, Super Admin | Update record status to deceased with `deleted_at` soft-delete |
| UC-2.7 | Geotag Senior Address | Barangay Encoder, Super Admin | Pin senior's residence location on Leaflet map during registration |

---

### UC-3: NFC ID Card & PDF Generation

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-3.1 | Generate NFC ID Card | Super Admin, MSWDO Officer, Barangay Encoder | Create digital OSCA ID (front/back) with photo, QR code, and NFC write simulation |
| UC-3.2 | Generate NCSC-SCDF PDF Form | Super Admin, MSWDO Officer | Auto-fill official NCSC form with senior's data using pdf-lib (client-side) |
| UC-3.3 | Generate Centenarian Honoring PDF | Super Admin, MSWDO Officer | Auto-generate Annex A Grantee Claim Form for eligible seniors |

---

### UC-4: Centenarian Honoring Program (R.A. 11982)

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-4.1 | Enable Centenarian Honoring Registration | Super Admin | Toggle registration open/close; triggers password generation for qualified seniors |
| UC-4.2 | Generate Passwords for Qualified Seniors | System | Auto-generate 10-character alphanumeric passwords and send via SMS |
| UC-4.3 | Authenticate via OSCA ID + Password | Senior Citizen | Public page login using OSCA number + system-generated password |
| UC-4.4 | Submit Grantee Claim Form (Annex A) | Senior Citizen | Fill out and submit the digital claim form with personal/family/payment info |
| UC-4.5 | Check Honoring Status | Senior Citizen | View current claim status (Pending → Under Review → Verified → Approved → Claimed) |
| UC-4.6 | Review/Approve Claim Submissions | MSWDO Officer, Super Admin | Review submitted claims; advance status through lifecycle |
| UC-4.7 | Process Cash Gift Distribution | Super Admin, MSWDO Officer | Mark claims as distributed; record payment details |

**Status Lifecycle:**
```
Pending → Under Review → Verified → Approved → Claimed
                                   ↘ Rejected
                        Approved → Unclaimed (deadline passed)
```

---

### UC-5: SMS Notification System

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-5.1 | Send Individual SMS | Super Admin, MSWDO Officer, Barangay Encoder | Compose and send targeted SMS to specific senior citizens |
| UC-5.2 | Broadcast Bulk SMS | Super Admin, MSWDO Officer | Send mass notifications to entire barangay or all registered seniors |
| UC-5.3 | Manage SMS Templates | Super Admin, MSWDO Officer | Create/edit message templates with `[name]` and `[barangay]` tokens |
| UC-5.4 | Send SMS Notifications (Status Updates) | System | Auto-trigger SMS when registration status changes or honoring credentials are generated |

---

### UC-6: Dashboard & Analytics

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-6.1 | View Dashboard Analytics | Super Admin, MSWDO Officer, Barangay Encoder | View real-time statistics: total seniors, demographic breakdown, status distribution |
| UC-6.2 | Generate Reports (Master List, Census) | Super Admin, MSWDO Officer | Create filterable reports by barangay, status, age bracket, and other criteria |
| UC-6.3 | Export Reports (PDF/Screenshot) | Super Admin, MSWDO Officer | Download reports as PDF or PNG screenshot via html2canvas + jsPDF |

---

### UC-7: GIS Mapping

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-7.1 | View GIS Map (Senior Locations) | Super Admin, MSWDO Officer, Barangay Encoder | Interactive Leaflet map with MarkerCluster showing senior residences by barangay |
| UC-7.2 | View Barangay Spatial Analytics | Super Admin, MSWDO Officer | Per-barangay population density and distribution visualization |

---

### UC-8: Benefits Management

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-8.1 | Manage Pension/Benefits | Super Admin, MSWDO Officer | Create and configure benefit programs (title, amount, frequency) |
| UC-8.2 | Track Benefit Distribution | Super Admin, MSWDO Officer | Monitor disbursement status and history per senior citizen |

---

### UC-9: System Configuration

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-9.1 | Configure System Settings | Super Admin | Manage branding (logo, titles), system toggles, and application-wide preferences |
| UC-9.2 | Manage Document Signatories | Super Admin | Add/edit official signatories with position, name, and digital signature data |
| UC-9.3 | Real-time Data Sync (Supabase Realtime) | System | WebSocket-based live data synchronization across all connected clients |

---

### UC-10: Public Access

| UC ID | Use Case | Actors | Description |
|-------|----------|--------|-------------|
| UC-10.1 | View Landing Page | Senior Citizen | Access public system information and registration links |
| UC-10.2 | Authenticate via OSCA ID + Password | Senior Citizen | Stateless credential verification for public-facing grantee pages |

---

## Relationships

### «include» Relationships

| Base Use Case | Included Use Case | Rationale |
|---------------|-------------------|-----------|
| UC-2.1 Register Senior | UC-2.2 Capture Biometrics | Registration always requires biometric capture at Step 8 |
| UC-4.1 Enable Honoring Registration | UC-4.2 Generate Passwords | Enabling registration always triggers password generation |
| UC-4.4 Submit Claim Form | UC-10.2 Authenticate | Submitting a claim always requires prior OSCA ID authentication |
| UC-4.5 Check Honoring Status | UC-10.2 Authenticate | Checking status always requires prior OSCA ID authentication |

### «extend» Relationships

| Base Use Case | Extension Use Case | Condition |
|---------------|-------------------|-----------|
| UC-2.5 Approve Registration | UC-5.4 Send SMS Notification | When status changes to Approved/Rejected |
| UC-4.6 Review/Approve Claim | UC-5.4 Send SMS Notification | When claim status is updated |
| UC-5.2 Broadcast Bulk SMS | UC-5.3 Manage SMS Templates | When using a pre-built template |
| UC-2.1 Register Senior | UC-2.7 Geotag Address | When Step 9 (Address Map Pin) is completed |

### Generalization

| Parent Use Case | Child Use Case |
|-----------------|----------------|
| Generate Document | UC-3.1 Generate NFC ID Card |
| Generate Document | UC-3.2 Generate NCSC-SCDF PDF |
| Generate Document | UC-3.3 Generate Centenarian PDF |

---

## Actor–Use Case Access Matrix

| Use Case | Super Admin | MSWDO Officer | Barangay Encoder | Senior Citizen | System |
|----------|:-----------:|:-------------:|:----------------:|:--------------:|:------:|
| Login | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Register Senior | ✅ | ❌ | ✅ | ❌ | ❌ |
| Capture Biometrics | ✅ | ❌ | ✅ | ❌ | ❌ |
| View/Search Seniors | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Profile | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject | ✅ | ✅ | ❌ | ❌ | ❌ |
| Generate NFC ID | ✅ | ✅ | ✅ | ❌ | ❌ |
| Generate PDF Forms | ✅ | ✅ | ❌ | ❌ | ❌ |
| Enable Honoring | ✅ | ❌ | ❌ | ❌ | ❌ |
| Submit Claim Form | ❌ | ❌ | ❌ | ✅ | ❌ |
| Check Honoring Status | ❌ | ❌ | ❌ | ✅ | ❌ |
| Review Claims | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send SMS | ✅ | ✅ | ✅ | ❌ | ❌ |
| Broadcast SMS | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ |
| Generate Reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| View GIS Map | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Benefits | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configure System | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Force Logout | ✅ | ❌ | ❌ | ❌ | ❌ |
| Auto-Expire Sessions | ❌ | ❌ | ❌ | ❌ | ✅ |
| Auto-Send SMS | ❌ | ❌ | ❌ | ❌ | ✅ |
| Real-time Sync | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Landing Page | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## Compliance Mapping

| Regulation | Related Use Cases |
|-----------|-------------------|
| **NCSC-SCDF v4.0b3** | UC-2.1 (11-Step Registration), UC-3.2 (PDF Form) |
| **R.A. 10173 (Data Privacy Act)** | UC-1.4 (Audit Logs), UC-1.5 (Session Expiry), UC-9.1 (Configuration) |
| **R.A. 11982 (Centenarian Honoring)** | UC-4.1 through UC-4.7 (Full Honoring Program) |
| **R.A. 9994 (Expanded Senior Citizens Act)** | UC-8.1, UC-8.2 (Benefits Management), UC-3.1 (ID Generation) |

---

*Document Version: 1.0*
*OSCA — Bayan ng Juban, Lalawigan ng Sorsogon*
