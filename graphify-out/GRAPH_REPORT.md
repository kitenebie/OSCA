# Graph Report - OSCA  (2026-10-16)

## Corpus Check
- 199 files · ~933,133 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 701 file(s) not represented in the graph (top: .dll 653, .cache 12, (none) 10)

## Summary
- 988 nodes · 2025 edges · 58 communities (45 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `701e8c39`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- supabaseService.ts
- SeniorCitizen
- ReportsPage.tsx
- Methodology
- identifying_Information.tsx
- dependencies
- fingerprintService.ts
- SeniorProfilePage.tsx
- package.json
- OSCA System — Sequence Diagrams (SVG)
- Entity Descriptions
- App.tsx
- useAuthStore
- 🖥️ System UI Screenshots
- NcscSteps3to6.tsx
- UserManagement.tsx
- Use Cases by Module
- OSCA Fingerprint Scanner — ESP32 + R307/AS608
- compilerOptions
- NcscFormFiller
- IDCardPreview.tsx
- useUIStore
- SignaturePad.tsx
- SeniorRegistrationPage.tsx
- Activity Diagrams — OSCA Senior Citizen Information System
- lucide-react
- react
- DigitalPersonaService
- devDependencies
- OSCA System Workflow Documentation
- DllImport
- CaptureOutput
- SessionManagement.tsx
- health_Profile.tsx
- ReportGenerator.tsx
- FaceCaptureModal.tsx
- .Capture
- economic_Profile.tsx
- VerifyOutput
- request-password-reset/index.ts
- review_Submit.tsx
- README.md
- scripts
- SeniorRegistrationWizard
- education_HR_Profile.tsx
- UsbSignaturePadContext.tsx
- Ponytail, lazy senior dev mode
- DigitalPersonaService.cs
- U.are.U 4500 local bridge — capture test
- vite.config.ts
- Ponytail
- DPFPDD_DEV_INFO
- FingerprintBridge.csproj

## God Nodes (most connected - your core abstractions)
1. `react` - 62 edges
2. `useAuthStore` - 58 edges
3. `useUIStore` - 54 edges
4. `lucide-react` - 46 edges
5. `DigitalPersonaService` - 36 edges
6. `useSeniorsStore` - 36 edges
7. `SeniorCitizen` - 28 edges
8. `OSCA System — Sequence Diagrams (SVG)` - 26 edges
9. `App()` - 22 edges
10. `fillNcscForm()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Authentication, RBAC, and sessions` --references--> `RoleGuard()`  [INFERRED]
  workflow.md → src/components/rbac/RoleGuard.tsx
- `8. `audit_logs` — System Audit Trail & Notifications` --references--> `User`  [INFERRED]
  Entity.md → src/types/index.ts
- `DigitalPersona U.are.U 4500 — registration path` --references--> `FingerprintScanner()`  [INFERRED]
  workflow.md → src/components/fingerprint/FingerprintScanner.tsx
- `DigitalPersona U.are.U 4500 — registration path` --references--> `checkScanner()`  [INFERRED]
  workflow.md → src/services/fingerprintService.ts
- `BarangayChartProps` --references--> `SeniorCitizen`  [EXTRACTED]
  src/components/dashboard/BarangayChart.tsx → src/types/index.ts

## Import Cycles
- None detected.

## Communities (58 total, 13 thin omitted)

### Community 0 - "supabaseService.ts"
Cohesion: 0.05
Nodes (52): zustand, RoleGuardProps, SearchableSelect(), SearchableSelectOption, SearchableSelectProps, SMS_TEMPLATES, SMSComposer(), ACTION_PERMISSIONS (+44 more)

### Community 1 - "SeniorCitizen"
Cohesion: 0.06
Nodes (40): leaflet, leaflet.markercluster, pdf-lib, react-leaflet, PendingApprovalsWidgetProps, Props, IDCardPreviewProps, MapViewUpdater() (+32 more)

### Community 2 - "ReportsPage.tsx"
Cohesion: 0.08
Nodes (42): docx-preview, docxtemplater, file-saver, pizzip, DocumentType, ReportsPage(), DocumentSignatory, philhealthTransmittalService (+34 more)

### Community 3 - "Methodology"
Cohesion: 0.04
Nodes (48): 10.1 Design Principles, 10.2 Responsive Breakpoints, 10.3 Page Architecture, 10. User Interface Design, 11. Testing Strategy, 12. Compliance & Standards, 13. Limitations & Future Enhancements, 14. Conclusion (+40 more)

### Community 4 - "identifying_Information.tsx"
Cohesion: 0.06
Nodes (41): CheckboxField(), ChildEntry, GranteeClaimFormPublic(), INITIAL_CHILD, InputField(), Props, SectionHeader(), SelectField() (+33 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (32): dependencies, apexcharts, @digitalpersona/fingerprint, @digitalpersona/websdk, docx-preview, docxtemplater, dotenv, express (+24 more)

### Community 6 - "fingerprintService.ts"
Cohesion: 0.13
Nodes (23): FingerprintScanner(), FingerprintScannerProps, ScanState, CameraMode, generateSessionId(), InlineFaceCapture(), InlineFaceCaptureProps, ThumbprintCapture() (+15 more)

### Community 7 - "SeniorProfilePage.tsx"
Cohesion: 0.15
Nodes (22): motion, @supabase/supabase-js, CentenarianFormPDF(), CentenarianFormPDFProps, mapHonoringToSenior(), DOC_KEYS, DOC_LABELS, GranteeHonoringStatusPublic() (+14 more)

### Community 8 - "package.json"
Cohesion: 0.07
Nodes (26): name, private, type, version, autoprefixer, @digitalpersona/fingerprint, @digitalpersona/websdk, dotenv (+18 more)

### Community 9 - "OSCA System — Sequence Diagrams (SVG)"
Cohesion: 0.08
Nodes (26): 10. Centenarian Claim Form Generation, 11. Dashboard & Analytics Data Loading, 12. GIS Mapping & Geotagging, 13. SMS Notification (Bulk Send), 14. Reports Export (PDF / Screenshot), 15. User Management (Create / Update / Delete), 16. Role-Based Access Control (RBAC), 17. Configuration & Signatories Management (+18 more)

### Community 10 - "Entity Descriptions"
Cohesion: 0.08
Nodes (23): 10. `document_signatories` — Document Signatory Registry, 11. `user_settings` — Per-User Theme & UI Configuration, 12. `id_card_config` — ID Card Template Fields, 13. `system_settings` — Global System Configuration, 15. `transmittal_barangay_signatures` — OSCA Transmittal Rows, 16. `philhealth_transmittal_seniors` and `philhealth_transmittal_settings`, 1. `barangays` — Geographic Administrative Units, 2. `users` — System Operators & Administrators (+15 more)

### Community 11 - "App.tsx"
Cohesion: 0.15
Nodes (18): react-dom, App(), FALLBACK_PAGE_ORDER, PAGE_PERMISSIONS, DashboardLayout(), Topbar(), SessionDismissedModal(), SessionDismissedModalProps (+10 more)

### Community 12 - "useAuthStore"
Cohesion: 0.17
Nodes (18): ForgotPasswordDialog(), Props, LoginPage(), DeviceInfo, fetchIpAndLocation(), getDeviceInfo(), getEnhancedDeviceName(), parseDeviceName() (+10 more)

### Community 13 - "🖥️ System UI Screenshots"
Cohesion: 0.09
Nodes (22): Census Dashboard, Configuration, Demographics Map, 📚 Documentation, Find User & Biometric Scanner, Frontend Development, ⚙️ Getting Started, Grantee Claim Forms (+14 more)

### Community 14 - "NcscSteps3to6.tsx"
Cohesion: 0.13
Nodes (21): AREA_DIFFICULTY, BLOOD_TYPES, COMMUNITY_SERVICES, DependencyProfileStep(), EconomicProfileStep(), EDUCATION_OPTIONS, EducationHRStep(), HealthProfileStep() (+13 more)

### Community 15 - "UserManagement.tsx"
Cohesion: 0.18
Nodes (18): filterMobileInput(), filterNameInput(), filterUsernameInput(), hashPassword(), PasswordStrengthIndicator(), PasswordValidation, UserManagement(), UserPhotoUpload() (+10 more)

### Community 16 - "Use Cases by Module"
Cohesion: 0.10
Nodes (20): Actor–Use Case Access Matrix, Actors, Compliance Mapping, «extend» Relationships, Full Use Case Diagram, Generalization, «include» Relationships, OSCA Senior Citizen Information System (+12 more)

### Community 18 - "OSCA Fingerprint Scanner — ESP32 + R307/AS608"
Cohesion: 0.12
Nodes (16): 1. Install Arduino IDE + ESP32, 2. Configure WiFi Credentials, 3. Flash to ESP32, 4. Find the ESP32's IP Address, 5. Configure in OSCA, API, GET /live/detect/fingerprint, GET /status (+8 more)

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+8 more)

### Community 21 - "IDCardPreview.tsx"
Cohesion: 0.22
Nodes (9): C, IDCardFlipInline(), RA9994_BENEFITS, IDCardPreview(), FindUserPage(), signatoriesService, formatOSCANumber(), renderBarcodeBits() (+1 more)

### Community 22 - "useUIStore"
Cohesion: 0.27
Nodes (11): DashboardLayoutProps, Sidebar(), LoginPage(), useSettingsStore, AppPages, getStoredFormId(), getStoredPage(), getStoredSeniorId() (+3 more)

### Community 23 - "SignaturePad.tsx"
Cohesion: 0.19
Nodes (12): autoCropSignature(), SignatureModal(), SignatureModalProps, SignaturePad(), SignaturePadProps, AssistingPersonStep(), RELATIONSHIP_OPTIONS, StepProps (+4 more)

### Community 24 - "SeniorRegistrationPage.tsx"
Cohesion: 0.14
Nodes (13): FamilyComposition(), StepProps, BLOOD_TYPES, CITIES_TOWNS, CLASSIFICATIONS, EDUCATIONAL_ATTAINMENTS, EMPLOYMENT_STATUSES, PENSION_OPTIONS (+5 more)

### Community 25 - "Activity Diagrams — OSCA Senior Citizen Information System"
Cohesion: 0.14
Nodes (14): 10. System Overview (High-Level Flow), 1. User Authentication & Login, 2. Senior Citizen Registration (NCSC-SCDF v4.0b3), 3. Fingerprint Biometrics (Capture & Verify), 4. PDF Form Generation, 5. SMS Notification Center, 6. Dashboard & Analytics, 7. GIS Mapping & Geotagging (+6 more)

### Community 26 - "lucide-react"
Cohesion: 0.30
Nodes (10): apexcharts, lucide-react, react-apexcharts, BarangayChart(), BarangayChartProps, PendingApprovalsWidget(), StatCard(), StatCardProps (+2 more)

### Community 27 - "react"
Cohesion: 0.18
Nodes (8): react, RELATIONSHIP_OPTIONS, StepProps, DisasterRiskInfo(), StepProps, CustomSelect(), CustomSelectProps, SelectOption

### Community 28 - "DigitalPersonaService"
Cohesion: 0.19
Nodes (6): DigitalPersonaService, DPFPDD_HW_DESCR, DPFPDD_HW_ID, DPFPDD_HW_VERSION, DPFPDD_IMAGE_INFO, DPFPDD_VER

### Community 29 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, esbuild, supabase, tailwindcss, tsx, @types/express, @types/file-saver (+5 more)

### Community 30 - "OSCA System Workflow Documentation"
Cohesion: 0.15
Nodes (13): Authentication, RBAC, and sessions, Bayan ng Juban — Senior Citizen Information System, Centenarian honoring workflow, Development, Documents and reports, Fingerprint scanner workflows, Main data and configuration, OSCA System Workflow Documentation (+5 more)

### Community 32 - "CaptureOutput"
Cohesion: 0.17
Nodes (12): CaptureOutput, ErrorMessage, ImageHeight, ImageWidth, NfiqScore, Quality, QualityLabel, Success (+4 more)

### Community 33 - "SessionManagement.tsx"
Cohesion: 0.26
Nodes (6): RoleGuard(), SessionManagement(), SessionWithUser, UserManagementPage(), sessionService, UserSession

### Community 34 - "health_Profile.tsx"
Cohesion: 0.20
Nodes (10): AREA_DIFFICULTY, BLOOD_TYPES, DENTAL_OPTIONS, HealthProfileStep(), HEARING_OPTIONS, MEDICAL_CONCERNS, OPTICAL_OPTIONS, SOCIAL_EMOTIONAL (+2 more)

### Community 35 - "ReportGenerator.tsx"
Cohesion: 0.33
Nodes (8): jspdf, modern-screenshot, partitionSeniors(), REPORT_TEMPLATES, ReportGenerator(), useBarangays(), exportElementToPDF(), generatePDFBlobUrl()

### Community 36 - "FaceCaptureModal.tsx"
Cohesion: 0.20
Nodes (4): FaceCaptureErrorBoundary, FaceCaptureErrorBoundaryProps, FaceCaptureErrorBoundaryState, FaceCaptureModalProps

### Community 38 - "economic_Profile.tsx"
Cohesion: 0.25
Nodes (8): EconomicProfileStep(), INCOME_SOURCES, MONTHLY_INCOME_OPTIONS, MOVABLE_PROPERTIES, PROBLEMS_NEEDS, REAL_PROPERTIES, StepProps, toggleArray()

### Community 39 - "VerifyOutput"
Cohesion: 0.25
Nodes (5): VerifyOutput, Confidence, Dissimilarity, ErrorMessage, IsMatch

### Community 41 - "review_Submit.tsx"
Cohesion: 0.43
Nodes (7): formatComparisonValue(), ReviewField(), ReviewSection(), ReviewSubmit(), SignaturePreview(), StepProps, TagList()

### Community 43 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, clean, deploy, dev, lint, preview

### Community 44 - "SeniorRegistrationWizard"
Cohesion: 0.29
Nodes (6): DependencyProfileStep(), HOUSEHOLD_CONDITION_OPTIONS, LIVING_WITH_OPTIONS, StepProps, SeniorRegistrationPage(), SeniorRegistrationWizard()

### Community 47 - "education_HR_Profile.tsx"
Cohesion: 0.33
Nodes (5): COMMUNITY_SERVICE_OPTIONS, EDUCATION_OPTIONS, EducationHRStep(), SPECIALIZATION_OPTIONS, StepProps

### Community 48 - "UsbSignaturePadContext.tsx"
Cohesion: 0.33
Nodes (4): Props, UsbSignaturePadContext, UsbSignaturePadContextType, UsbSignaturePadProvider()

### Community 49 - "Ponytail, lazy senior dev mode"
Cohesion: 0.40
Nodes (4): Before you write, OSCA working rules, Ponytail, lazy senior dev mode, The smallest complete change

### Community 51 - "U.are.U 4500 local bridge — capture test"
Cohesion: 0.40
Nodes (4): API, Before enrollment and verification, Setup, U.are.U 4500 local bridge — capture test

### Community 52 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 53 - "Ponytail"
Cohesion: 0.40
Nodes (4): Before you write, Levels, Ponytail, The smallest complete change

## Knowledge Gaps
- **39 isolated node(s):** `net8.0`, `Microsoft.NET.Sdk.Web`, `Success`, `TemplateBase64`, `TemplateId` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 493 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OSCA System Workflow Documentation` connect `OSCA System Workflow Documentation` to `README.md`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **What connects `net8.0`, `Microsoft.NET.Sdk.Web`, `Success` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `supabaseService.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050957481337228175 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `supabaseService.ts`, `SeniorCitizen`, `ReportsPage.tsx`, `identifying_Information.tsx`, `fingerprintService.ts`, `SeniorProfilePage.tsx`, `package.json`, `App.tsx`, `useAuthStore`, `NcscSteps3to6.tsx`, `UserManagement.tsx`, `IDCardPreview.tsx`, `useUIStore`, `SignaturePad.tsx`, `SeniorRegistrationPage.tsx`, `lucide-react`, `SessionManagement.tsx`, `health_Profile.tsx`, `ReportGenerator.tsx`, `FaceCaptureModal.tsx`, `economic_Profile.tsx`, `review_Submit.tsx`, `SeniorRegistrationWizard`, `education_HR_Profile.tsx`, `UsbSignaturePadContext.tsx`?**
  _High betweenness centrality (0.203) - this node is a cross-community bridge._
- **Should `SeniorCitizen` be split into smaller, more focused modules?**
  _Cohesion score 0.05547785547785548 - nodes in this community are weakly interconnected._
- **Why does `RoleGuard()` connect `SessionManagement.tsx` to `supabaseService.ts`, `useAuthStore`, `OSCA System Workflow Documentation`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **Should `ReportsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08418367346938775 - nodes in this community are weakly interconnected._