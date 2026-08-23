# OSCA Fingerprint Bridge Service

A lightweight local HTTP service that bridges **Windows Hello fingerprint readers** to the OSCA Senior Citizen Management web application.

## Problem

Windows Hello fingerprint scanners are not accessible via WebUSB because Windows OS "claims" the device through the Windows Biometric Framework (WBF). The browser cannot directly communicate with the scanner.

## Solution

This bridge service runs locally on `http://localhost:8000` and acts as a middleman:

```
[Windows Hello Fingerprint Reader]
          ↓
[Windows Biometric Framework (WBF)]
          ↓
[FingerprintBridge Service (localhost:8000)]
          ↓ REST API (JSON)
[OSCA React Web App (Browser)]
          ↓
[Supabase Database]
```

## Requirements

- **Windows 10/11** with fingerprint reader enrolled in Windows Hello
- **.NET 8 Runtime** — [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Windows Biometric Service** running (default on Windows)

## Quick Start

### Option 1: Run directly (for development)

```bash
cd fingerprint-bridge
reg add "HKLM\SOFTWARE\Policies\Microsoft\Biometrics\Credential Provider" /v Enabled /t REG_DWORD /d 1 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Biometrics\Credential Provider" /v Enabled /t REG_DWORD /d 1 /f
powershell -Command "Get-PnpDevice | Where-Object { $_.FriendlyName -like '*SYNO*' -and $_.Status -eq 'Error' } | Disable-PnpDevice -Confirm:$false"
powershell -Command "Get-PnpDevice | Where-Object { $_.FriendlyName -like '*SYNO*' } | Select-Object FriendlyName, Status"
dotnet run
```

### Option 2: Double-click batch file

```
start-bridge.bat
```

### Option 3: Install as Windows Service (for production)

Run as Administrator:
```
install-as-service.bat
```

## API Endpoints

### `GET /api/status`
Check if the service is running.

**Response:**
```json
{
  "service": "OSCA Fingerprint Bridge",
  "version": "1.0.0",
  "status": "running",
  "platform": "Windows Biometric Framework",
  "timestamp": "2026-08-23T10:30:00"
}
```

### `POST /api/capture`
Capture a fingerprint from the Windows Hello reader.

**Response (success):**
```json
{
  "success": true,
  "template": "base64-encoded-fingerprint-template...",
  "id": "FP-20260823103045-847291",
  "quality": 85,
  "message": "Fingerprint captured successfully via Windows Hello"
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "No fingerprint scanner detected. Please connect a fingerprint reader."
}
```

### `POST /api/verify`
Verify a live fingerprint against a stored template.

**Request body:**
```json
{
  "storedTemplate": "base64-encoded-stored-template..."
}
```

**Response:**
```json
{
  "success": true,
  "confidence": 92.5,
  "message": "Fingerprint verified!"
}
```

## How It Works with OSCA Web App

The OSCA web app's `ThumbprintCapture.tsx` component already has a **"Local SDK (Port 8000)"** mode that calls this service:

1. User selects "Local SDK (Port 8000)" mode in the fingerprint capture UI
2. Clicks "Scan Fingerprint"
3. Web app calls `POST http://localhost:8000/api/capture`
4. This service triggers the Windows Hello fingerprint prompt
5. User touches the fingerprint reader
6. Template data is returned to the browser
7. Web app stores it in Supabase

## CORS Configuration

The service allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev)
- `https://osca-juban.vercel.app` (Production)
- `https://osca-juban.netlify.app` (Production alt)

Edit `Program.cs` to add more allowed origins.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No fingerprint scanner detected" | Check Device Manager → Biometric devices |
| "Windows Biometric Service not running" | Run `services.msc` → Start "Windows Biometric Service" |
| ".NET 8 not found" | Install from https://dotnet.microsoft.com/download/dotnet/8.0 |
| "CORS error in browser" | Make sure your web app URL is in the allowed origins |
| "Port 8000 in use" | Change port in `Program.cs` and update `ThumbprintCapture.tsx` |

## Uninstall

If installed as a Windows Service:
```bash
sc stop "OSCAFingerprintBridge"
sc delete "OSCAFingerprintBridge"
```

## Security Notes

- Service only listens on `localhost` — not accessible from network
- CORS restricts which websites can call the API
- No sensitive data is logged
- Fingerprint templates are sent directly to the browser (not stored locally)
