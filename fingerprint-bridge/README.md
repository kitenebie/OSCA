# OSCA Fingerprint Bridge v2.0.0

Local HTTP service that connects USB fingerprint scanners to the OSCA web application.

## Supported Devices

| Priority | Device | Method | Template Format |
|----------|--------|--------|-----------------|
| ⭐ 0 | **DigitalPersona U.are.U 4500** | DP SDK (dpfpdd.dll) | ANSI 378-2004 (industry standard) |
| 1 | Serial scanners (ZFM-20, R307, R305) | COM port | Proprietary (ZFM protocol) |
| 2 | Any WinBio device (Windows Hello) | WinBio Identify | Hash-based |
| 3 | WinBio Raw Capture | WinBio Raw | Bitmap |

## Setup for U.are.U 4500 (Recommended)

### Step 1: Install the Device Driver
- Plug in the U.are.U 4500 USB scanner
- Windows should auto-install the driver (check Device Manager → Biometric devices)
- If not detected, download from: https://sdk.hidglobal.com/developer-center/digitalpersona-touchchip

### Step 2: Install DigitalPersona SDK
- Download "DigitalPersona U.are.U SDK" or "One Touch for Windows SDK"
- URL: https://sdk.hidglobal.com/developer-center/digitalpersona-touchchip
- Install the SDK (just need the DLLs, not the full development environment)

### Step 3: Copy SDK DLLs
Copy these files to the same folder as `FingerprintBridge.exe`:
```
dpfpdd.dll    ← Device Driver (capture images)
dpfj.dll      ← Feature Extraction (create/match templates)
```

Typical source locations:
- `C:\Program Files\DigitalPersona\Bin\`
- `C:\Program Files (x86)\DigitalPersona\Bin\`
- Inside the SDK ZIP under `Bin\Win64\` or `Bin\Win32\`

### Step 4: Run the Bridge
```bash
# Development
dotnet run

# Production (pre-built)
./bin/Release/net8.0/win-x64/FingerprintBridge.exe
```

### Step 5: Verify
Visit http://localhost:8000/api/status — you should see:
```json
{
  "service": "OSCA Fingerprint Bridge",
  "version": "2.0.0",
  "devices": {
    "digitalPersona": { "available": true, "count": 1 }
  }
}
```

## API Endpoints

### GET /api/status
Health check — shows detected hardware and service version.

### GET /api/diagnose
Detailed diagnostics — DLL locations, device list, troubleshooting tips.

### POST /api/capture
Capture a fingerprint. Returns:
```json
{
  "success": true,
  "template": "<base64 ANSI 378-2004 FMD template>",
  "id": "FP-DP-20260824120000-123456",
  "quality": 85,
  "qualityLabel": "Good",
  "method": "digitalpersona",
  "format": "ANSI_378_2004",
  "templateSize": 482,
  "nfiqScore": 2,
  "message": "Fingerprint captured via DigitalPersona U.are.U! Quality: 85% (Good)"
}
```

### POST /api/verify
Verify a live fingerprint against a stored template:
```json
// Request body:
{ "storedTemplate": "<base64 template from database>" }

// Response:
{
  "success": true,
  "confidence": 92.5,
  "method": "digitalpersona",
  "message": "✓ Fingerprint verified! Confidence: 92.5%"
}
```

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  OSCA Web App (React)                                        │
│  ThumbprintCapture.tsx → POST http://localhost:8000/api/...   │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP (localhost only)
┌──────────────────────▼───────────────────────────────────────┐
│  Fingerprint Bridge (.NET 8 Minimal API)                     │
│  Program.cs → DigitalPersonaService / WindowsBiometricService│
└──────────────────────┬───────────────────────────────────────┘
                       │ P/Invoke (native DLL calls)
┌──────────────────────▼───────────────────────────────────────┐
│  dpfpdd.dll + dpfj.dll (DigitalPersona SDK)                  │
│  Device communication + template extraction/matching         │
└──────────────────────┬───────────────────────────────────────┘
                       │ USB
┌──────────────────────▼───────────────────────────────────────┐
│  U.are.U 4500 Hardware (512 DPI optical sensor)              │
└──────────────────────────────────────────────────────────────┘
```

## Template Storage (Supabase)

The captured template (Base64 string) should be stored in your Supabase `senior_citizens` table:
- Column: `fingerprint_template` (TEXT or BYTEA)
- Format: ANSI 378-2004 FMD (Fingerprint Minutiae Data)
- Size: typically 300-600 bytes per template

For verification, send the stored template to `/api/verify` — the bridge will capture a new
fingerprint and compare using the DigitalPersona matching engine (FAR 0.1% threshold).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "dpfpdd.dll not found" | Copy DLLs from SDK install to bridge directory |
| "No devices detected" | Check USB connection, reinstall driver |
| "Device busy" | Close other apps using the scanner (only one app at a time) |
| "Timeout" | Finger wasn't placed on sensor within 12 seconds |
| "Quality too low" | Clean finger, press more firmly and evenly |
| Bridge won't start | Check if port 8000 is already in use |

## Building from Source

```bash
cd fingerprint-bridge
dotnet build -c Release -r win-x64 --self-contained
```

Output: `bin/Release/net8.0/win-x64/FingerprintBridge.exe`
