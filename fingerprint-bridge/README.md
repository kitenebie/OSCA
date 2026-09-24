# U.are.U 4500 local bridge — capture test

> **Legacy / inactive:** The React app now uses the official HID JavaScript Web SDK and HID Authentication Device Client. This custom .NET bridge is no longer called by the app and is not required for the U.are.U 4500 capture test. See the root README for current setup.

This .NET 8 bridge runs on the Windows computer to which the DigitalPersona / HID U.are.U 4500 is connected. The React app previously called its loopback API. It is a **detection and capture-quality test only**. It does not enroll or verify people, and it never returns or stores fingerprint images or templates.

## Setup

1. Install the U.are.U 4500 Windows driver and the licensed DigitalPersona U.are.U SDK on the scanner computer. Use the 64-bit SDK when running the 64-bit .NET process.
2. Make the SDK's `dpfpdd.dll` and `dpfj.dll` available to the bridge process (for example, beside its compiled output). The SDK files are not included in this repository.
3. From the repository root, run `dotnet run --project fingerprint-bridge/FingerprintBridge.csproj`.
4. Open `http://127.0.0.1:9123/api/fingerprint/status` on that same computer. The response reports `connected: true` only when the SDK and a device are available.
5. In Configuration → Biometric Testing, use **Start Scan** and place a finger on the reader. The result shows capture quality only.

The service binds only to `127.0.0.1:9123`. Browser origins are configured under `FingerprintBridge:AllowedOrigins` in `appsettings.json`; edit this list for the actual React deployment domain. The website must run in a browser on the scanner computer because the bridge is not exposed on the network.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/fingerprint/status` | SDK and scanner detection |
| POST | `/api/fingerprint/capture` | One scan; returns quality and format, no biometric data |
| POST | `/api/fingerprint/cancel` | Cancel an active capture |

Capture requests are serialized; a second request receives HTTP 409. A missing SDK or disconnected scanner returns a clear error. Capture times out after 12 seconds.

## Before enrollment and verification

The current app uses its own session tokens and its existing `users` table has broad RLS access. A secure biometric credential backend must first validate those sessions server-side, restrict credential rows, and keep templates away from the React client. Do not save SDK templates in `seniors.thumbprint_data` or public Supabase Storage. Enrollment, identification, verification, and attendance are not enabled by this capture-test bridge.
