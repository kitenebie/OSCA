# OSCA Juban — Entity Relationship Diagram (ERD)

## Full ERD Diagram

![OSCA Juban Entity Relationship Diagram](/erd_diagram.svg)

> **System**: Office for Senior Citizens Affairs (OSCA) — Municipality of Juban, Sorsogon  
> **Backend**: Supabase (PostgreSQL)  
> **Frontend**: React + TypeScript (Vite)

---

## ER Diagram (Mermaid)

```mermaid
erDiagram

    %% ═══════════════════════════════════════════
    %% CORE ENTITIES
    %% ═══════════════════════════════════════════

    BARANGAYS {
        TEXT id PK
        TEXT name
        INTEGER population
        INTEGER senior_count
        DOUBLE center_lat
        DOUBLE center_lng
        TEXT barangay_hall_address
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    USERS {
        TEXT id PK
        TEXT username UK
        TEXT full_name
        TEXT role
        TEXT barangay_assigned FK
        TEXT contact_number
        TEXT email
        TEXT status
        TEXT profile_photo
        TEXT password_hash
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    SENIORS {
        TEXT id PK
        TEXT osca_number UK
        TEXT first_name
        TEXT middle_name
        TEXT last_name
        TEXT suffix
        DATE birthdate
        INTEGER age
        TEXT sex
        TEXT civil_status
        TEXT contact_number
        TEXT barangay FK
        TEXT address
        DOUBLE lat
        DOUBLE lng
        TEXT profile_photo
        TEXT thumbprint_data
        TEXT signature_data
        TEXT status
        DATE registered_date
        TEXT registered_by FK
        BOOLEAN pension_beneficiary
        TEXT remarks
        TEXT region
        TEXT province
        TEXT city_town
        TEXT telephone
        TEXT email_address
        TEXT blood_type
        TEXT religion
        TEXT highest_educational_attainment
        TEXT gsis
        TEXT sss
        TEXT tin
        TEXT phil_health
        TEXT employment_status
        TEXT classification
        TEXT monthly_pension
        TEXT emergency_contact_name
        TEXT emergency_contact_phone
        TEXT valid_id_photo
        TEXT in_risk_area
        TEXT risk_type
        TEXT risk_details
        TEXT risk_severity
        BOOLEAN is_deceased
        DATE date_of_death
        TEXT cause_of_death
        TEXT place_of_birth
        TEXT ethnic_origin
        TEXT language_spoken
        TEXT sc_assoc_org_id
        TEXT other_govt_id
        BOOLEAN capability_to_travel
        TEXT service_business_employment
        TEXT spouse_last_name
        TEXT spouse_first_name
        TEXT father_last_name
        TEXT father_first_name
        TEXT mother_last_name
        TEXT mother_first_name
        JSONB children
        JSONB dependents
        JSONB specializations
        JSONB living_with
        JSONB income_sources
        JSONB medical_concerns
        JSONB medicines
        TEXT ncsc_reference_code
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ROLES {
        TEXT role PK
        BOOLEAN can_view_seniors
        BOOLEAN can_create_senior
        BOOLEAN can_edit_senior
        BOOLEAN can_approve_reject
        BOOLEAN can_manage_users
        BOOLEAN can_generate_reports
        BOOLEAN can_send_sms
    }

    %% ═══════════════════════════════════════════
    %% BENEFITS & PROGRAMS
    %% ═══════════════════════════════════════════

    BENEFITS {
        TEXT id PK
        TEXT title
        TEXT description
        NUMERIC amount
        TEXT frequency
        TEXT status
        DATE distribution_date
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    CENTENARIAN_HONORING {
        TEXT id PK
        TEXT senior_id FK
        TEXT milestone_type
        INTEGER milestone_age
        DATE milestone_date_reached
        NUMERIC cash_gift_amount
        DATE application_date
        TEXT applicant_type
        TEXT representative_name
        TEXT representative_relationship
        TEXT representative_contact
        BOOLEAN has_application_form
        BOOLEAN has_full_body_photo
        BOOLEAN has_endorsement_letter
        BOOLEAN has_birth_certificate
        BOOLEAN has_valid_id
        BOOLEAN has_death_certificate
        TEXT status
        TEXT endorsed_by
        DATE endorsed_date
        DATE claim_deadline
        DATE claimed_date
        TEXT remarks
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    %% ═══════════════════════════════════════════
    %% COMMUNICATION & NOTIFICATIONS
    %% ═══════════════════════════════════════════

    SMS_LOGS {
        TEXT id PK
        TEXT recipient_name
        TEXT recipient_phone
        TEXT barangay FK
        TEXT message
        TEXT status
        TEXT sent_by FK
        TIMESTAMPTZ timestamp
        TIMESTAMPTZ created_at
    }

    AUDIT_LOGS {
        TEXT id PK
        TEXT action
        TEXT entity
        TEXT details
        TEXT actor_name
        TEXT actor_role
        TEXT barangay
        TIMESTAMPTZ timestamp
        BOOLEAN read
        TEXT severity
    }

    %% ═══════════════════════════════════════════
    %% DOCUMENTS & REPORTS
    %% ═══════════════════════════════════════════

    REPORT_TEMPLATES {
        TEXT id PK
        TEXT name
        TEXT description
        TEXT type
        TEXT category
        JSONB parameters
        TIMESTAMPTZ created_at
    }

    DOCUMENT_SIGNATORIES {
        TEXT id PK
        TEXT document_type
        TEXT role_key
        TEXT full_name
        TEXT title
        TEXT designation
        TEXT license_no
        TEXT address
        BOOLEAN is_default
        TEXT signature_data
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    %% ═══════════════════════════════════════════
    %% SESSION & CONFIGURATION
    %% ═══════════════════════════════════════════

    USER_SESSIONS {
        UUID id PK
        TEXT user_id FK
        TEXT session_token UK
        TEXT refresh_token UK
        TIMESTAMPTZ created_at
        TIMESTAMPTZ expires_at
        TIMESTAMPTZ last_activity
        BOOLEAN is_active
        BOOLEAN remember_me
        TEXT ip_address
        TEXT user_agent
    }

    USER_SETTINGS {
        UUID id PK
        TEXT user_id FK_UK
        TEXT font_family
        TEXT font_size
        TEXT primary_color
        TEXT secondary_color
        TEXT info_color
        TEXT danger_color
        TEXT warning_color
        TEXT bg_tint
        TEXT mode
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ID_CARD_CONFIG {
        TEXT id PK
        TEXT variant
        TEXT field_key
        TEXT field_value
        TEXT field_label
        INT sort_order
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    SYSTEM_SETTINGS {
        TEXT key PK
        TEXT value
        TEXT description
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    %% ═══════════════════════════════════════════
    %% RELATIONSHIPS
    %% ═══════════════════════════════════════════

    BARANGAYS ||--o{ SENIORS : "has many"
    BARANGAYS ||--o{ USERS : "assigned to"
    BARANGAYS ||--o{ SMS_LOGS : "targets"

    USERS ||--o{ SENIORS : "registers"
    USERS ||--o{ SMS_LOGS : "sends"
    USERS ||--o{ USER_SESSIONS : "has sessions"
    USERS ||--|{ USER_SETTINGS : "has settings"
    USERS }o--|| ROLES : "has role"

    SENIORS ||--o{ CENTENARIAN_HONORING : "applies for"

    ROLES ||--o{ USERS : "assigned to"

    DOCUMENT_SIGNATORIES }o--|| REPORT_TEMPLATES : "signs on"
```

---

## Entity Descriptions

### 1. `barangays` — Geographic Administrative Units
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | Unique barangay identifier |
| `name` | TEXT | Barangay name |
| `population` | INTEGER | Total population count |
| `senior_count` | INTEGER | Senior citizen count |
| `center_lat` / `center_lng` | DOUBLE | Map center coordinates |
| `barangay_hall_address` | TEXT | Physical address of hall |

---

### 2. `users` — System Operators & Administrators
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | Unique user identifier |
| `username` | TEXT (UNIQUE) | Login username |
| `full_name` | TEXT | Display name |
| `role` | TEXT | One of: `Super Admin`, `MSWDO Officer`, `Barangay Encoder`, `Viewer` |
| `barangay_assigned` | TEXT (FK) | Barangay assignment (for encoders) |
| `status` | TEXT | `Active` / `Inactive` / `Deactivated` |
| `profile_photo` | TEXT | Base64 or URL to avatar |

---

### 3. `seniors` — Senior Citizen Master Records (NCSC-aligned)
The main entity with **80+ fields** covering:

| Section | Fields |
|---------|--------|
| **Personal Info** | name, birthdate, age, sex, civil status, contact, address, coordinates |
| **Biometrics** | profile_photo, thumbprint_data, signature_data |
| **Registration** | osca_number, status, registered_date, registered_by |
| **Government IDs** | GSIS, SSS, TIN, PhilHealth |
| **NCSC Identifying** | place_of_birth, ethnic_origin, language_spoken, SC org ID |
| **Family Composition** | spouse, father, mother, children (JSONB), dependents (JSONB) |
| **Education & HR** | specializations, share_skills, community_services |
| **Dependency Profile** | living_with, household_condition |
| **Economic Profile** | income_sources, properties, monthly_income_range, problems/needs |
| **Health Profile** | disabilities, medical/dental/optical/hearing concerns, medicines |
| **Disaster Risk** | in_risk_area, risk_type, risk_severity |
| **Vital Status** | is_deceased, date_of_death, cause_of_death |
| **Assisting Person** | assisting_person_1/2 name, relationship, signatures |

**Status Flow:** `Pending` → `For Verification` → `Approved` / `Rejected` → `Deactivated` / `Deceased`

---

### 4. `roles` — Role-Based Access Control (RBAC)
| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access to all modules |
| **MSWDO Officer** | Approve/reject, reports, SMS, user management |
| **Barangay Encoder** | Create/edit seniors (own barangay only) |
| **Viewer** | Read-only access to dashboard and lists |

---

### 5. `benefits` — Benefits & Pension Programs
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | Unique benefit identifier |
| `title` | TEXT | Benefit name (e.g., "Social Pension") |
| `amount` | NUMERIC(12,2) | Monetary value |
| `frequency` | TEXT | `Monthly` / `Quarterly` / `Bi-Annual` / `Annual` |
| `status` | TEXT | `Active` / `Completed` / `Suspended` |
| `distribution_date` | DATE | Next/last distribution date |

---

### 6. `centenarian_honoring` — Centenarian/Milestone Award Claims
| Column | Type | Description |
|--------|------|-------------|
| `senior_id` | TEXT (FK → seniors) | Linked senior citizen |
| `milestone_type` | TEXT | `Octogenarian-80/85`, `Nonagenarian-90/95`, `Centenarian-100` |
| `cash_gift_amount` | NUMERIC | Award amount per RA 10868 |
| `applicant_type` | TEXT | `Self` / `Representative` / `Posthumous` |
| `status` | TEXT | `Pending` → `Endorsed` → `Approved` → `Claimed` / `Expired` |
| Requirements | BOOLEAN | Checklist: application form, photo, endorsement, birth cert, ID |

---

### 7. `sms_logs` — SMS Communication Logs
| Column | Type | Description |
|--------|------|-------------|
| `recipient_name` | TEXT | Senior's name |
| `recipient_phone` | TEXT | Target phone number |
| `barangay` | TEXT (FK) | Barangay filter |
| `message` | TEXT | SMS content |
| `status` | TEXT | `Sent` / `Failed` / `Pending` |
| `sent_by` | TEXT (FK → users) | Operator who sent |

---

### 8. `audit_logs` — System Audit Trail & Notifications
| Column | Type | Description |
|--------|------|-------------|
| `action` | TEXT | `CREATE` / `UPDATE` / `DELETE` / `APPROVE` / `REJECT` / `LOGIN` / `SMS` |
| `entity` | TEXT | `Senior` / `User` / `Role` / `Report` / `SMS` / `System` / `Session` |
| `actor_name` | TEXT | Who performed the action |
| `severity` | TEXT | `info` / `success` / `warning` / `danger` |
| `read` | BOOLEAN | Notification read status |

---

### 9. `report_templates` — Report Generation Templates
| Column | Type | Description |
|--------|------|-------------|
| `type` | TEXT | `MasterList` / `Pension` / `Census` / `Individual` |
| `category` | TEXT | `Demographic` / `Financial` / `Administrative` |
| `parameters` | JSONB | Filter parameters for report generation |

---

### 10. `document_signatories` — Document Signatory Registry
| Column | Type | Description |
|--------|------|-------------|
| `document_type` | TEXT | `osca-transmittal`, `mswdo-transmittal`, `certificate-transfer`, `certification`, `masterlist` |
| `role_key` | TEXT | `osca_head`, `mswdo_head`, `mayor`, `recipient`, `admin_assistant` |
| `full_name` | TEXT | Signatory name |
| `title` / `designation` | TEXT | Position title and professional designation |
| `signature_data` | TEXT | Base64 signature image |

---

### 11. `user_sessions` — Login Session Management
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT (FK → users) | Session owner |
| `session_token` | TEXT (UNIQUE) | Active session token |
| `refresh_token` | TEXT (UNIQUE) | "Remember Me" long-lived token |
| `expires_at` | TIMESTAMPTZ | 60-minute expiration |
| `is_active` | BOOLEAN | Whether session is still valid |
| `ip_address` / `user_agent` | TEXT | Device fingerprint |

---

### 12. `user_settings` — Per-User Theme & UI Configuration
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT (FK → users, UNIQUE) | One setting per user |
| `font_family` | TEXT | UI font (default: Inter) |
| `primary_color` | TEXT | Theme primary color hex |
| `mode` | TEXT | `light` / `dark` |

---

### 13. `id_card_config` — ID Card Template Fields
| Column | Type | Description |
|--------|------|-------------|
| `variant` | TEXT | `variant1` or `variant2` |
| `field_key` | TEXT | Template placeholder key |
| `field_value` | TEXT | Configured text value |
| `field_label` | TEXT | Human-readable label for admin UI |

---

### 14. `system_settings` — Global System Configuration
| Column | Type | Description |
|--------|------|-------------|
| `key` | TEXT (PK) | Setting identifier (e.g., `municipality_name`, `fingerprint_enabled`) |
| `value` | TEXT | Setting value |
| `description` | TEXT | Admin-facing description |

---

## Relationship Summary (Visual Diagram)

![OSCA Juban - Relationship Summary Diagram](artifacts/erd_diagram.svg)

### Relationship Table

| From | Relationship | To | Cardinality | Foreign Key |
|------|-------------|-----|-------------|-------------|
| BARANGAYS | has many | SENIORS | 1 : N | seniors.barangay |
| BARANGAYS | assigned to | USERS | 1 : N | users.barangay_assigned |
| BARANGAYS | targets | SMS_LOGS | 1 : N | sms_logs.barangay |
| ROLES | defines permissions | USERS | 1 : N | users.role |
| USERS | registers | SENIORS | 1 : N | seniors.registered_by |
| USERS | sends | SMS_LOGS | 1 : N | sms_logs.sent_by |
| USERS | authenticates | USER_SESSIONS | 1 : N | user_sessions.user_id |
| USERS | configures | USER_SETTINGS | 1 : 1 | user_settings.user_id |
| SENIORS | applies for | CENTENARIAN_HONORING | 1 : N | centenarian_honoring.senior_id |
| SENIORS | receives | BENEFITS | 1 : N | (implicit via pension_beneficiary) |
| REPORT_TEMPLATES | signs on | DOCUMENT_SIGNATORIES | 1 : N | document_signatories.document_type |
| ID_CARD_CONFIG | — | (standalone) | — | variant + field_key (composite UK) |
| SYSTEM_SETTINGS | — | (standalone) | — | key (PK, key-value store) |
| AUDIT_LOGS | — | (standalone) | — | event stream, no FK |

---

## Data Flow Diagram

```
                    ┌──────────────┐
                    │   BARANGAY   │
                    │   ENCODER    │
                    └──────┬───────┘
                           │ registers
                           ▼
┌────────────┐    ┌──────────────────┐    ┌────────────────────┐
│  BARANGAYS │◄───│     SENIORS      │───►│ CENTENARIAN_HONORING│
│  (location)│    │ (master record)  │    │  (award claims)     │
└────────────┘    └────────┬─────────┘    └────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌──────────────┐ ┌─────────┐ ┌──────────────┐
     │   SMS_LOGS   │ │BENEFITS │ │ AUDIT_LOGS   │
     │(notifications│ │(pension)│ │ (activity)   │
     └──────────────┘ └─────────┘ └──────────────┘
              ▲                           ▲
              │                           │
     ┌────────┴─────────┐       ┌────────┴───────┐
     │      USERS       │       │  USER_SESSIONS │
     │ (operators/admin)│───────│  (auth tokens) │
     └────────┬─────────┘       └────────────────┘
              │
     ┌────────┴─────────┐
     │  USER_SETTINGS   │
     │  (theme/config)  │
     └──────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Database** | Supabase (PostgreSQL) with RLS & Realtime |
| **Auth** | Custom session tokens (60-min TTL + refresh) |
| **Frontend** | React 18 + TypeScript + Vite |
| **State** | Zustand (authStore, seniorsStore, settingsStore, uiStore) |
| **Maps** | Leaflet with marker clustering |
| **Biometrics** | Face capture, thumbprint, signature pad, NFC |
| **SMS** | Integrated SMS gateway |
| **Reports** | PDF export (NCSC form, Centenarian form, Masterlist) |
| **Storage** | Supabase Storage (photos, signatures, documents) |

---

*Generated from OSCA Juban source code — August 2026*
