// ============================================================
// OSCA Fingerprint Bridge — ESP32 + R307/AS608 Firmware
// 
// Connects to existing WiFi (same network as the laptop/PC).
// Serves a REST API for live fingerprint detection.
//
// Hardware:
//   - ESP32 DevKit v1 (or any ESP32 board)
//   - R307/AS608/ZFM-20 Fingerprint Module (UART)
//   - Wiring: Module TX → GPIO16, Module RX → GPIO17
//             Module VCC → 3.3V, Module GND → GND
//
// Network:
//   ESP32 connects to existing WiFi (Station mode).
//   Both ESP32 and laptop/PC must be on the SAME WiFi network.
//   ESP32 also registers mDNS: http://osca-fingerprint.local
//
// Endpoints:
//   GET /live/detect/fingerprint  — Live detection (BMP if finger present)
//   GET /status                   — Device status + IP info
//
// Flow:
//   1. OSCA web app polls GET /live/detect/fingerprint every 500ms
//   2. ESP32 checks if finger is on sensor
//   3. If finger → capture image → return BMP (256x288)
//   4. If no finger → return { "detected": false }
//   5. OSCA shows live preview of fingerprint
//   6. User clicks "Capture" → stops polling, saves last image
// ============================================================

#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <HardwareSerial.h>

// ═══════════════════════════════════════════════════════════
// CONFIGURATION — CHANGE THESE TO MATCH YOUR WIFI
// ═══════════════════════════════════════════════════════════

// WiFi credentials (same network as your laptop/PC)
const char* WIFI_SSID = "YOUR_WIFI_NAME";    // ← Change this
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD"; // ← Change this

// mDNS hostname — access via http://osca-fingerprint.local
const char* MDNS_HOSTNAME = "osca-fingerprint";

// Fingerprint module UART pins
#define FP_RX 16  // ESP32 RX ← Module TX
#define FP_TX 17  // ESP32 TX → Module RX
#define FP_BAUD 57600

// Image dimensions (R307/AS608 standard)
#define IMG_WIDTH 256
#define IMG_HEIGHT 288
#define IMG_SIZE (IMG_WIDTH * IMG_HEIGHT)  // 73,728 bytes (8-bit grayscale)

// Status LED (built-in on most ESP32 boards)
#define LED_PIN 2

// ═══════════════════════════════════════════════════════════
// GLOBALS
// ═══════════════════════════════════════════════════════════

HardwareSerial fpSerial(2);  // UART2
WebServer server(80);

uint8_t imageBuffer[IMG_SIZE];   // Raw grayscale pixel buffer
bool lastCaptureSuccess = false;
unsigned long lastCaptureTime = 0;
uint32_t captureCount = 0;
String localIP = "";

// BMP file header for 256x288 8-bit grayscale
#define BMP_HEADER_SIZE 54
#define BMP_PALETTE_SIZE 1024
#define BMP_FILE_SIZE (BMP_HEADER_SIZE + BMP_PALETTE_SIZE + IMG_SIZE)

uint8_t bmpHeader[BMP_HEADER_SIZE + BMP_PALETTE_SIZE];

// ═══════════════════════════════════════════════════════════
// ZFM PROTOCOL (R307/AS608 Fingerprint Module)
// ═══════════════════════════════════════════════════════════

const uint8_t ZFM_HEADER[] = { 0xEF, 0x01 };
const uint8_t ZFM_ADDRESS[] = { 0xFF, 0xFF, 0xFF, 0xFF };

#define ZFM_CMD_GENIMG      0x01  // Capture fingerprint image
#define ZFM_CMD_UPIMAGE     0x0A  // Upload image to host
#define ZFM_CMD_HANDSHAKE   0x17  // Verify password

#define ZFM_ACK_OK          0x00
#define ZFM_ACK_NO_FINGER   0x02
#define ZFM_ACK_FAIL        0x01

/**
 * Send a command packet to the fingerprint module
 */
void sendCommand(uint8_t cmd, uint8_t* params = nullptr, uint16_t paramLen = 0) {
    uint16_t length = 3 + paramLen;
    
    uint16_t checksum = 0x01;
    checksum += (length >> 8) & 0xFF;
    checksum += length & 0xFF;
    checksum += cmd;
    for (int i = 0; i < paramLen; i++) {
        checksum += params[i];
    }
    
    fpSerial.write(ZFM_HEADER, 2);
    fpSerial.write(ZFM_ADDRESS, 4);
    fpSerial.write(0x01);
    fpSerial.write((length >> 8) & 0xFF);
    fpSerial.write(length & 0xFF);
    fpSerial.write(cmd);
    if (params && paramLen > 0) {
        fpSerial.write(params, paramLen);
    }
    fpSerial.write((checksum >> 8) & 0xFF);
    fpSerial.write(checksum & 0xFF);
}

/**
 * Read acknowledgment from the module
 */
uint8_t readAck(unsigned long timeout = 2000) {
    unsigned long start = millis();
    
    while (fpSerial.available() < 12) {
        if (millis() - start > timeout) return 0xFF;
        delay(1);
    }
    
    uint8_t buf[9];
    fpSerial.readBytes(buf, 9);
    
    if (buf[0] != 0xEF || buf[1] != 0x01) return 0xFE;
    
    uint8_t confirmCode = fpSerial.read();
    
    uint16_t length = (buf[7] << 8) | buf[8];
    int remaining = length - 1 - 2;
    for (int i = 0; i < remaining + 2; i++) {
        if (fpSerial.available()) fpSerial.read();
    }
    
    return confirmCode;
}

/**
 * Check if a finger is currently on the sensor
 */
bool isFingerPresent() {
    while (fpSerial.available()) fpSerial.read();
    sendCommand(ZFM_CMD_GENIMG);
    uint8_t ack = readAck(1000);
    return (ack == ZFM_ACK_OK);
}

/**
 * Upload the captured image from module to ESP32 memory
 */
bool uploadImage() {
    while (fpSerial.available()) fpSerial.read();
    
    sendCommand(ZFM_CMD_UPIMAGE);
    
    unsigned long start = millis();
    while (fpSerial.available() < 9) {
        if (millis() - start > 3000) return false;
        delay(1);
    }
    
    uint8_t ackBuf[9];
    fpSerial.readBytes(ackBuf, 9);
    uint8_t confirmCode = fpSerial.read();
    if (fpSerial.available() >= 2) { fpSerial.read(); fpSerial.read(); }
    
    if (confirmCode != ZFM_ACK_OK) {
        Serial.printf("[FP] UpImage failed: 0x%02X\n", confirmCode);
        return false;
    }
    
    // Read data packets
    uint32_t totalReceived = 0;
    bool done = false;
    
    while (!done && totalReceived < IMG_SIZE) {
        start = millis();
        while (fpSerial.available() < 9) {
            if (millis() - start > 8000) {
                Serial.printf("[FP] Timeout (received %d/%d bytes)\n", totalReceived, IMG_SIZE);
                return totalReceived > IMG_SIZE / 2;
            }
            delay(1);
        }
        
        uint8_t pktBuf[9];
        fpSerial.readBytes(pktBuf, 9);
        
        if (pktBuf[0] != 0xEF || pktBuf[1] != 0x01) continue;
        
        uint8_t pktType = pktBuf[6];
        uint16_t pktLength = (pktBuf[7] << 8) | pktBuf[8];
        uint16_t dataLen = pktLength - 2;
        
        start = millis();
        uint16_t bytesRead = 0;
        while (bytesRead < dataLen) {
            if (fpSerial.available()) {
                if (totalReceived + bytesRead < IMG_SIZE) {
                    imageBuffer[totalReceived + bytesRead] = fpSerial.read();
                } else {
                    fpSerial.read();
                }
                bytesRead++;
            }
            if (millis() - start > 5000) break;
        }
        
        totalReceived += bytesRead;
        
        start = millis();
        while (fpSerial.available() < 2) {
            if (millis() - start > 1000) break;
            delay(1);
        }
        if (fpSerial.available() >= 2) { fpSerial.read(); fpSerial.read(); }
        
        if (pktType == 0x08) done = true;
    }
    
    Serial.printf("[FP] Image received: %d bytes\n", totalReceived);
    return totalReceived >= IMG_SIZE / 2;
}

// ═══════════════════════════════════════════════════════════
// BMP IMAGE
// ═══════════════════════════════════════════════════════════

void initBmpHeader() {
    memset(bmpHeader, 0, sizeof(bmpHeader));
    
    bmpHeader[0] = 'B'; bmpHeader[1] = 'M';
    uint32_t fileSize = BMP_FILE_SIZE;
    memcpy(&bmpHeader[2], &fileSize, 4);
    uint32_t dataOffset = BMP_HEADER_SIZE + BMP_PALETTE_SIZE;
    memcpy(&bmpHeader[10], &dataOffset, 4);
    
    uint32_t headerSize = 40;
    memcpy(&bmpHeader[14], &headerSize, 4);
    int32_t width = IMG_WIDTH;
    int32_t height = IMG_HEIGHT;
    memcpy(&bmpHeader[18], &width, 4);
    memcpy(&bmpHeader[22], &height, 4);
    uint16_t planes = 1;
    memcpy(&bmpHeader[26], &planes, 2);
    uint16_t bpp = 8;
    memcpy(&bmpHeader[28], &bpp, 2);
    uint32_t imageSize = IMG_SIZE;
    memcpy(&bmpHeader[34], &imageSize, 4);
    int32_t ppm = 19685; // 500 DPI
    memcpy(&bmpHeader[38], &ppm, 4);
    memcpy(&bmpHeader[42], &ppm, 4);
    uint32_t colors = 256;
    memcpy(&bmpHeader[46], &colors, 4);
    memcpy(&bmpHeader[50], &colors, 4);
    
    for (int i = 0; i < 256; i++) {
        int offset = BMP_HEADER_SIZE + (i * 4);
        bmpHeader[offset] = i;
        bmpHeader[offset + 1] = i;
        bmpHeader[offset + 2] = i;
        bmpHeader[offset + 3] = 0;
    }
}

void sendBmpResponse() {
    server.setContentLength(BMP_FILE_SIZE);
    server.send(200, "image/bmp", "");
    server.client().write(bmpHeader, BMP_HEADER_SIZE + BMP_PALETTE_SIZE);
    for (int y = IMG_HEIGHT - 1; y >= 0; y--) {
        server.client().write(&imageBuffer[y * IMG_WIDTH], IMG_WIDTH);
    }
}

// ═══════════════════════════════════════════════════════════
// HTTP ENDPOINTS
// ═══════════════════════════════════════════════════════════

void handleLiveDetect() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    
    if (isFingerPresent()) {
        if (uploadImage()) {
            lastCaptureSuccess = true;
            lastCaptureTime = millis();
            captureCount++;
            
            server.sendHeader("X-Finger-Detected", "true");
            server.sendHeader("X-Capture-ID", String(captureCount));
            sendBmpResponse();
            
            digitalWrite(LED_PIN, HIGH);
            delay(50);
            digitalWrite(LED_PIN, LOW);
        } else {
            server.send(200, "application/json", 
                "{\"detected\":true,\"image\":false,\"error\":\"Image transfer failed. Try pressing finger more firmly.\"}");
        }
    } else {
        server.send(200, "application/json", 
            "{\"detected\":false,\"image\":false}");
    }
}

void handleStatus() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    
    String json = "{";
    json += "\"device\":\"ESP32 + R307 Fingerprint Scanner\",";
    json += "\"version\":\"2.0.0\",";
    json += "\"status\":\"running\",";
    json += "\"network\":{";
    json += "\"ip\":\"" + localIP + "\",";
    json += "\"ssid\":\"" + String(WIFI_SSID) + "\",";
    json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
    json += "\"mdns\":\"http://" + String(MDNS_HOSTNAME) + ".local\"";
    json += "},";
    json += "\"scanner\":{";
    json += "\"width\":" + String(IMG_WIDTH) + ",";
    json += "\"height\":" + String(IMG_HEIGHT) + ",";
    json += "\"dpi\":500";
    json += "},";
    json += "\"captureCount\":" + String(captureCount) + ",";
    json += "\"uptime\":" + String(millis() / 1000) + ",";
    json += "\"freeHeap\":" + String(ESP.getFreeHeap());
    json += "}";
    
    server.send(200, "application/json", json);
}

void handleCORS() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.sendHeader("Access-Control-Max-Age", "86400");
    server.send(204);
}

// ═══════════════════════════════════════════════════════════
// SETUP & LOOP
// ═══════════════════════════════════════════════════════════

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    
    Serial.println("\n══════════════════════════════════════════");
    Serial.println("  OSCA Fingerprint Bridge (ESP32) v2.0");
    Serial.println("══════════════════════════════════════════");
    
    // Initialize fingerprint module
    fpSerial.begin(FP_BAUD, SERIAL_8N1, FP_RX, FP_TX);
    Serial.printf("[FP] UART: GPIO%d(RX), GPIO%d(TX) @ %d baud\n", FP_RX, FP_TX, FP_BAUD);
    
    delay(500);
    sendCommand(ZFM_CMD_HANDSHAKE);
    uint8_t ack = readAck(2000);
    if (ack == ZFM_ACK_OK) {
        Serial.println("[FP] ✓ Fingerprint module connected!");
        digitalWrite(LED_PIN, HIGH); delay(200); digitalWrite(LED_PIN, LOW);
    } else {
        Serial.printf("[FP] ✗ Module not responding (0x%02X). Check wiring.\n", ack);
    }
    
    // Connect to WiFi (Station mode — same network as laptop)
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    
    Serial.printf("[WiFi] Connecting to \"%s\"", WIFI_SSID);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {
        delay(500);
        Serial.print(".");
        attempts++;
        // Blink LED while connecting
        digitalWrite(LED_PIN, attempts % 2);
    }
    digitalWrite(LED_PIN, LOW);
    
    if (WiFi.status() == WL_CONNECTED) {
        localIP = WiFi.localIP().toString();
        Serial.printf("\n[WiFi] ✓ Connected!\n");
        Serial.printf("[WiFi] IP Address: %s\n", localIP.c_str());
        Serial.printf("[WiFi] Signal: %d dBm\n", WiFi.RSSI());
        
        // Fast blink 3x to indicate success
        for (int i = 0; i < 3; i++) {
            digitalWrite(LED_PIN, HIGH); delay(100);
            digitalWrite(LED_PIN, LOW); delay(100);
        }
    } else {
        Serial.println("\n[WiFi] ✗ Connection FAILED!");
        Serial.println("[WiFi] Check WIFI_SSID and WIFI_PASS in the code.");
        Serial.println("[WiFi] Restarting in 5 seconds...");
        delay(5000);
        ESP.restart();
    }
    
    // Start mDNS (http://osca-fingerprint.local)
    if (MDNS.begin(MDNS_HOSTNAME)) {
        MDNS.addService("http", "tcp", 80);
        Serial.printf("[mDNS] ✓ http://%s.local\n", MDNS_HOSTNAME);
    } else {
        Serial.println("[mDNS] ✗ Failed to start mDNS");
    }
    
    // Initialize BMP header
    initBmpHeader();
    
    // Setup HTTP routes
    server.on("/live/detect/fingerprint", HTTP_GET, handleLiveDetect);
    server.on("/live/detect/fingerprint", HTTP_OPTIONS, handleCORS);
    server.on("/status", HTTP_GET, handleStatus);
    server.on("/status", HTTP_OPTIONS, handleCORS);
    
    server.begin();
    
    Serial.println("══════════════════════════════════════════");
    Serial.println("  Ready! Scanner accessible at:");
    Serial.printf("    http://%s/status\n", localIP.c_str());
    Serial.printf("    http://%s.local/status\n", MDNS_HOSTNAME);
    Serial.println("  ");
    Serial.println("  Endpoints:");
    Serial.println("    GET /live/detect/fingerprint");
    Serial.println("    GET /status");
    Serial.println("══════════════════════════════════════════");
    Serial.println("  Set this IP in OSCA Configuration →");
    Serial.println("  Scanner Settings → Endpoint URL");
    Serial.println("══════════════════════════════════════════\n");
}

void loop() {
    server.handleClient();
    
    // Reconnect WiFi if disconnected
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WiFi] Disconnected! Reconnecting...");
        WiFi.reconnect();
        unsigned long start = millis();
        while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
            delay(500);
            digitalWrite(LED_PIN, (millis() / 250) % 2);
        }
        if (WiFi.status() == WL_CONNECTED) {
            localIP = WiFi.localIP().toString();
            Serial.printf("[WiFi] Reconnected: %s\n", localIP.c_str());
            digitalWrite(LED_PIN, LOW);
        }
    }
    
    delay(1);
}
