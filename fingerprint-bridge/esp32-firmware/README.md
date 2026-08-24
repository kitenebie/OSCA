# OSCA Fingerprint Scanner — ESP32 + R307/AS608

Wireless fingerprint scanner for the OSCA web app. ESP32 connects to **your existing WiFi** (same network as your laptop/PC) — no network switching needed.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Your WiFi Router (e.g., "OfficeWiFi")                       │
│                                                              │
│   ┌──── Laptop/PC ────┐     ┌──── ESP32 + R307 ────┐       │
│   │ 192.168.1.100      │     │ 192.168.1.50          │       │
│   │ OSCA Web App       │◄───►│ Fingerprint Server     │       │
│   │ (React)            │WiFi │ (port 80)             │       │
│   └────────────────────┘     └────────────────────────┘       │
│                                                              │
│   Both on the SAME WiFi network with internet ✓             │
└─────────────────────────────────────────────────────────────┘
```

**Key:** ESP32 joins your WiFi as a client (Station mode). Your laptop and ESP32 can talk to each other because they're on the same local network.

## Hardware Required

| Component | Price (PH) | Notes |
|-----------|-----------|-------|
| ESP32 DevKit v1 | ₱250-350 | Any ESP32 with WiFi |
| R307 / AS608 Module | ₱200-400 | 500 DPI optical sensor |
| Jumper wires (4x) | ₱20 | |
| **Total** | **₱470-770** | |

## Wiring

```
ESP32              R307/AS608
─────              ──────────
GPIO16 (RX2) ───► TX (Green wire)
GPIO17 (TX2) ───► RX (White wire)
3.3V         ───► VCC (Red wire)
GND          ───► GND (Black wire)
```

> ⚠️ Some modules need 5V on VCC. If not working with 3.3V, try 5V (UART lines are still 3.3V safe).

## Setup

### 1. Install Arduino IDE + ESP32

1. Download [Arduino IDE](https://www.arduino.cc/en/software)
2. File → Preferences → Additional Board URLs:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Tools → Board → Board Manager → search "esp32" → Install **"ESP32 by Espressif Systems"**

### 2. Configure WiFi Credentials

Open `esp32_fingerprint_server.ino` and change these lines:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_NAME";    // ← Your WiFi name
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD"; // ← Your WiFi password
```

**Important:** This must be the SAME WiFi network your laptop/PC is connected to.

### 3. Flash to ESP32

1. Connect ESP32 via USB
2. Arduino IDE → Tools → Board → **ESP32 Dev Module**
3. Tools → Port → Select the COM port
4. Click **Upload** (→)
5. Open Serial Monitor (115200 baud) to see the assigned IP

### 4. Find the ESP32's IP Address

After flashing, the Serial Monitor will show:
```
[WiFi] ✓ Connected!
[WiFi] IP Address: 192.168.1.50    ← This is your scanner's IP
[mDNS] ✓ http://osca-fingerprint.local
```

You can also access it via: **http://osca-fingerprint.local** (mDNS, works on most systems)

### 5. Configure in OSCA

1. Go to **Configuration → Scanner Settings** tab
2. Select **"ESP32 + Arduino Fingerprint Module"**
3. Set endpoint to: `http://192.168.1.50` (use the IP from Serial Monitor)
   - Or use: `http://osca-fingerprint.local`
4. Click **Save**
5. Test in the **Biometric Testing** tab

## Live Detection Flow

```
User clicks "Scan"
    │
    ▼ (every 500ms)
GET http://{ESP32_IP}/live/detect/fingerprint
    │
    ├── No finger → { "detected": false }
    │                  (keep polling)
    │
    └── Finger detected → Returns BMP image (256×288)
                           (show in live preview)
    │
User clicks "Capture"
    │
    ▼
Stop polling → Save last BMP → Convert to PNG → Upload to Supabase
```

## API

### GET /status
```json
{
  "device": "ESP32 + R307 Fingerprint Scanner",
  "version": "2.0.0",
  "status": "running",
  "network": {
    "ip": "192.168.1.50",
    "ssid": "OfficeWiFi",
    "rssi": -45,
    "mdns": "http://osca-fingerprint.local"
  },
  "scanner": { "width": 256, "height": 288, "dpi": 500 },
  "captureCount": 12,
  "uptime": 3600
}
```

### GET /live/detect/fingerprint
- **Finger present:** Returns `image/bmp` (74KB)
- **No finger:** Returns `{ "detected": false, "image": false }`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ESP32 won't connect to WiFi | Check SSID/password. Make sure 2.4GHz (not 5GHz only). |
| "osca-fingerprint.local" not working | mDNS doesn't work on all OS. Use the IP address directly. |
| OSCA can't reach ESP32 | Both must be on same WiFi. Check firewall on laptop. |
| Image is slow (~5s) | Normal — 73KB over UART at 57600 baud. Use 115200 if module supports it. |
| Module not responding | Check wiring (TX→RX crossed). Try swapping GPIO16/17. |
| WiFi disconnects | ESP32 auto-reconnects. Check router isn't blocking it. |

## Tips

- **Static IP:** If your router supports it, assign a static IP to the ESP32's MAC address so it always gets the same IP.
- **Higher baud:** If your module supports 115200 baud, change `FP_BAUD` for faster image transfer (~2.5s instead of ~5s).
- **Multiple scanners:** Flash multiple ESP32s with different `MDNS_HOSTNAME` values (e.g., "osca-fp-1", "osca-fp-2") for multi-station setups.
