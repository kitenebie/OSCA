# OSCA — Bayan ng Juban Senior Citizen Information System

Ang **OSCA (Office for Senior Citizens Affairs) Information System** ay isang komprehensibo, moderno, at ligtas na web application para sa pamamahala ng profiling, e-Census, biometrics, NFC ID generation, PDF form generation, pamamahagi ng benepisyo, at ugnayan para sa mga nakatatandang mamamayan ng **Bayan ng Juban, Lalawigan ng Sorsogon**.

Sumusunod sa mga pamantayang **NCSC-SCDF v4.0b3** at **Data Privacy Act of 2012 (RA 10173)**.

---

## 📚 Documentation

| # | Document | Summary |
|---|----------|---------|
| 1 | [Activity Diagrams](./Activity.md) | Naglalaman ng **11 Activity Diagrams** na nagpapakita ng step-by-step na daloy ng bawat major system process — mula sa User Authentication, Senior Registration (11-step NCSC-SCDF), Fingerprint Biometrics, NFC ID Generation, PDF Form Generation, SMS Notification, Dashboard & Analytics, GIS Mapping, Reports Module, User & Role Management, hanggang sa System Overview. Kasama ang legend at summary table ng lahat ng diagrams. |
| 2 | [Entity Relationship Diagram (ERD)](./Entity.md) | Naglalaman ng **kompletong database schema** ng system gamit ang Mermaid ERD notation. Ipinapakita ang lahat ng 14 na tables (barangays, users, seniors, roles, benefits, centenarian_honoring, sms_logs, audit_logs, report_templates, document_signatories, user_sessions, user_settings, id_card_config, system_settings), ang kanilang columns at data types, at ang relationships/foreign keys sa pagitan ng mga entities. |
| 3 | [Methodology](./methodology.md) | Detalyadong dokumentasyon ng **development methodology** — kasama ang System Architecture (SPA + BaaS pattern), Technology Stack, Agile Iterative SDLC, Database Design, Security Implementation (authentication flow, RLS, audit trail), lahat ng System Modules (Registration, Centenarian Honoring, SMS, GIS, Dashboard, Reports, PDF, NFC, Configuration), State Management Strategy, Deployment & Infrastructure, UI Design Principles, Testing Strategy, at Compliance Standards. |
| 4 | [Use Case Diagram](./useCase.md) | Naglalaman ng **kompletong Use Case specification** — 6 Actors (Super Admin, MSWDO Officer, Barangay Encoder, Senior Citizen, System, Fingerprint Bridge), 10 Use Case modules na may 30+ individual use cases (UC-1 hanggang UC-10), «include»/«extend» relationships, Actor–Use Case Access Matrix, at Compliance Mapping sa NCSC-SCDF, RA 10173, RA 11982, at RA 9994. |
| 5 | [System Workflow](./workflow.md) | Komprehensibong **technical workflow documentation** — detalyadong architecture diagram, Authentication & Session Management flow, 11-step Registration Workflow (kasama ang component filenames), Senior Profiling & Management, Fingerprint Biometrics Bridge REST API, NFC ID Card Generation, PDF Form Generation (pdf-lib), Dashboard & Analytics, GIS Mapping, SMS Notification Center, Reports Module, RBAC Implementation, User & Configuration Management, Database Schema & Migrations (20 migration files), at State Management (Zustand stores). |

---

### 📁 Sub-module Documentation

| Document | Summary |
|----------|---------|
| [Fingerprint Bridge README](./fingerprint-bridge/README.md) | Setup at usage guide para sa .NET 8 Fingerprint Bridge Service — Windows Biometric Framework integration, REST API endpoints, at installation instructions. |
| [ESP32 Firmware README](./fingerprint-bridge/esp32-firmware/README.md) | Documentation para sa ESP32 microcontroller firmware na ginagamit sa fingerprint hardware sensor setup. |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS 4 (Glassmorphism, Responsive) |
| **State Management** | Zustand |
| **Forms & Validation** | React Hook Form + Zod |
| **Backend / Database** | Supabase (Auth, PostgreSQL, Storage) |
| **Charts** | ApexCharts + react-apexcharts |
| **Mapping** | Leaflet + React-Leaflet + MarkerCluster |
| **PDF Generation** | pdf-lib (client-side form filling) |
| **Export / Screenshots** | html2canvas, modern-screenshot, jsPDF |
| **Animations** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **AI Integration** | Google GenAI SDK |
| **Biometrics** | Fingerprint Bridge (.NET 8 / Windows Hello) |

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** o **pnpm**
- **.NET 8 SDK** (para sa Fingerprint Bridge)
- **Windows 10/11** na may fingerprint sensor (para sa biometrics)

### Frontend Development
```bash
# Install dependencies
npm install

# Start dev server (port 3000, accessible sa network)
npm run dev

# Production build
npm run build
```

### Fingerprint Bridge Service
```bash
cd fingerprint-bridge

# Run directly
dotnet run

# Or install as Windows Service (requires Admin)
install-as-service.bat
```

---

## 🌐 Network Configuration

| Service | URL |
|---------|-----|
| Frontend (Dev) | `http://192.168.8.34:3000` |
| Fingerprint Bridge | `http://192.168.8.34:8000` |
| Production | `https://me.oscajuban.online` |

---

## 🛡️ Security & Compliance

- **Data Privacy Act of 2012 (RA 10173)** — Lahat ng personal data ay pinangalagaan
- **RA 9994 (Expanded Senior Citizens Act)** — Sumusunod sa mga benepisyo at karapatan
- **RA 11982 (Centenarian Honoring)** — Digitalized Annex A claim form workflow
- Supabase Row-Level Security (RLS) para sa database access control
- Role-based access sa lahat ng endpoints at pages

---

*Bayan ng Juban, Lalawigan ng Sorsogon — Office for Senior Citizens Affairs*
