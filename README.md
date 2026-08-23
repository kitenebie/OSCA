# OSCA — Bayan ng Juban Senior Citizen Information System

Ang **OSCA (Office for Senior Citizens Affairs) Information System** ay isang komprehensibo, moderno, at ligtas na web application para sa pamamahala ng profiling, e-Census, biometrics, NFC ID generation, PDF form generation, pamamahagi ng benepisyo, at ugnayan para sa mga nakatatandang mamamayan ng **Bayan ng Juban, Lalawigan ng Sorsogon**.

Sumusunod sa mga pamantayang **NCSC-SCDF v4.0b3** at **Data Privacy Act of 2012 (RA 10173)**.

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

## 📋 Mga Pangunahing Feature

### 1. Multi-Step Senior Registration (NCSC-SCDF v4.0b3)
11-step na registration form na sumusunod sa pambansang pamantayan:

| Step | Section |
|------|---------|
| 1 | Identifying Information |
| 2 | Family Composition |
| 3 | Education & HR Profile |
| 4 | Dependency Profile |
| 5 | Economic Profile |
| 6 | Health Profile |
| 7 | Disaster Risk Information |
| 8 | Biometrics & Photo Capture |
| 9 | Assisting Person Details |
| 10 | Signature Pad (Digital) |
| 11 | Review & Submit |

### 2. Fingerprint Biometrics (Windows Hello Bridge)
Lokal na .NET 8 service (`fingerprint-bridge/`) na kumokonekta sa Windows Biometric Framework:
- **REST API** sa `http://192.168.8.34:8000`
- `GET /api/status` — Health check
- `POST /api/capture` — Capture fingerprint template
- `POST /api/verify` — Verify fingerprint laban sa stored template
- Naka-install bilang **Windows Service** (auto-start)

### 3. NFC ID Card Generation
- Digital ID card layout na may front/back flip preview
- NFC write simulation para sa physical card encoding
- Automated ID number generation

### 4. PDF Form Generation
- **NCSC-SCDF Form** — Auto-fill ng registered data sa official NCSC form (pdf-lib drawText overlay)
- **Centenarian Honoring Grantee Claim Form** — Para sa mga senyor na 100 taon pataas
- Preview modal bago i-download

### 5. Dashboard & Analytics
- Interactive charts para sa demographics (age bracket, kasarian, barangay distribution)
- Real-time summary statistics ng registered seniors
- ApexCharts-powered visualizations

### 6. GIS Mapping & Geotagging
- Leaflet-based interactive map ng mga senior citizen residence
- MarkerCluster para sa efficient visualization ng maraming data points
- Per-barangay spatial view

### 7. SMS Notification Center
- Templated message system para sa mabilis na pag-notipika
- Bulk SMS para sa pension distribution, bakuna, medical missions

### 8. Reports Module
- Exportable reports at data summaries
- PDF/screenshot export capabilities

### 9. Role-Based Access Control (RBAC)
- **Encoder** — Data entry at registration
- **Supervisor** — Review at approval
- **Super Admin** — Full system control, user management, configuration

### 10. User & Configuration Management
- User account management at role assignment
- System-wide configuration settings
- Document signatories management (digital signatures)

---

## 📁 Project Structure

```
OSCA/
├── src/
│   ├── components/
│   │   ├── dashboard/        # Dashboard widgets & charts
│   │   ├── id-generation/    # NFC ID card preview & write
│   │   ├── layout/           # App shell, sidebar, nav
│   │   ├── mapping/          # Leaflet map components
│   │   ├── profiling/        # Senior profiling UI
│   │   ├── rbac/             # Role-based access components
│   │   ├── registration/     # 11-step NCSC registration form
│   │   │   └── steps/        # Individual step components
│   │   ├── reports/          # Reports module
│   │   ├── sms/              # SMS center components
│   │   └── ui/               # Reusable UI primitives
│   ├── contexts/             # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Route-level page components
│   ├── services/             # Supabase & storage services
│   ├── store/                # Zustand state stores
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utilities (PDF fillers, NFC, themes)
├── fingerprint-bridge/       # .NET 8 Fingerprint Bridge Service
│   ├── Program.cs            # Main service entry point
│   ├── Services/             # WindowsBiometricService
│   ├── install-as-service.bat
│   └── start-bridge.bat
├── supabase/                 # Database migrations & seeds
├── public/                   # Static assets, logos, PDF templates
└── dist/                     # Production build output
```

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

# Type checking
npm run lint
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
- Supabase Row-Level Security (RLS) para sa database access control
- CORS-restricted Fingerprint Bridge (tanging allowed origins lamang)
- Role-based access sa lahat ng endpoints at pages

---

## 📄 Supabase Migrations

| Migration | Purpose |
|-----------|---------|
| `migration.sql` | Base schema |
| `add_ncsc_fields.sql` | NCSC-SCDF data fields |
| `add_deceased_status.sql` | Deceased tracking |
| `add_password_column.sql` | User credentials |
| `document_signatories.sql` | Signatory management |
| `add_signature_data_to_signatories.sql` | Digital signature storage |
| `notifications.sql` | Notification system |
| `storage_policies.sql` | File storage RLS |
| `user_settings.sql` | User preferences |
| `update_roles.sql` | RBAC roles update |

---

## 👨‍💻 Development Notes

- **Port 3000** — Frontend dev server (`--host=0.0.0.0` para accessible sa LAN)
- **Port 8000** — Fingerprint Bridge REST API
- Ang Fingerprint Bridge ay naka-CORS restrict sa frontend origins lamang
- PDF form filling ay client-side gamit ang `pdf-lib` (drawText overlay, walang AcroForm)
- Lahat ng biometric templates ay stored as Base64 strings

---

*Bayan ng Juban, Lalawigan ng Sorsogon — Office for Senior Citizens Affairs*
