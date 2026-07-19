# Bayan ng Juban Senior Citizen Information Portal

Ang **Bayan ng Juban Senior Citizen Information Portal** ay isang moderno, ligtas, at de-kalidad na web application na dinisenyo para sa pamamahala ng profiling, e-Census, pamamahagi ng benepisyo, at ugnayan para sa mga nakatatandang mamamayan (Senior Citizens) ng Bayan ng Juban, Lalawigan ng Sorsogon.

Mula sa magandang landing page para sa mga bisita hanggang sa kontroladong login interface para sa mga opisyal, ang system na ito ay sumusunod sa mga pambansang pamantayan ng Pilipinas tulad ng **Data Privacy Act of 2012**.

---

## 🎨 Pangunahing Katangian at Disenyo (Key Features & Design)

1. **Frosted-Glass Landing & Guest Information Hub**
   * **Professional Aesthetic**: Isang maganda, maliwanag, at de-kalidad na background na pinaliligiran ng soft radial colors, malinis na typography, at responsive padding.
   * **Guest Information**: May nakalaang scrollable section para sa mga bisita na naglalaman ng mga napakahalagang anunsyo (tulad ng libreng pagpapatala para sa bagong **Digital NFC OSCA ID Cards**), checklist ng requirements, diskwento sa ilalim ng **RA 9994 (Expanded Senior Citizens Act)**, at mga emergency hotlines.
   * **Easy Mode Switcher**: Swabe at madaling paglipat mula sa pampublikong Landing Page patungo sa Secure Login Portal sa pamamagitan ng navigation header.

2. **Secure Official Login Portal**
   * May mabilis at ligtas na demo access para sa magkakaibang tungkulin (Roles: Encoder, Supervisor, Super Admin).
   * Nilagyan ng standard security parameters at visual indicator para sa Philippine LGU compliance.

3. **Komprehensibong Dashboard at e-Census Charts**
   * Makabagong pamamahala ng demograpiya gamit ang interactive charts (D3/Recharts) para sa age bracket, kasarian, at barangay distribution.
   * Dynamic at real-time telemetry para sa kabuuang bilang ng mga rehistradong senior citizen.

4. **NFC ID Generation & Profiling**
   * Kakayahang mag-profile at mag-geotag ng tirahan gamit ang interactive map node.
   * Physical NFC ID Card simulation at digital ID layout card generation.

5. **Integrated SMS Service & Distribution Tracker**
   * SMS Composer na may templated message system para sa mabilis na pag-notipika sa mga senior tungkol sa pamamahagi ng quarterly pension, bakuna, o gamot.

---

## 🛠️ Teknolohiya at Setup (Technology Stack)

* **Frontend**: React 18+ kasama ang Vite
* **Styling**: Tailwind CSS (Frosted Glassmorphism, Responsive design)
* **Icons**: Lucide React
* **State Management**: Zustand
* **Linter & Compilers**: TypeScript (`tsc --noEmit`), ESLint

---

## ⚙️ Paano Simulan (Getting Started)

### Dev Command
Upang simulan ang application sa lokal na dev environment:
```bash
npm run dev
```

### Build Command
Upang i-compile ang application para sa produksyon:
```bash
npm run build
```

---

## 🛡️ Data Privacy & Compliance
Ang lahat ng impormasyon ng mga senior citizen ay pinangangalagaan at hindi ibinabahagi sa labas nang walang pahintulot. Ang disenyo ay sumusunod sa **Data Privacy Act of 2012** upang masiguro ang integridad ng bawat datos ng pamilya sa Juban, Sorsogon.
