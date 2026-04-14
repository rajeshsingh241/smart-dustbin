/*
 * Smart Dustbin Fill Level Sensor
 * Hardware : NodeMCU ESP8266 + HC-SR04 Ultrasonic Sensor
 * Author   : Smart Dustbin Project
 *
 * Wiring:
 *   HC-SR04 VCC  → NodeMCU 3.3V (or Vin for 5V)
 *   HC-SR04 GND  → NodeMCU GND
 *   HC-SR04 TRIG → NodeMCU D1  (GPIO 5)
 *   HC-SR04 ECHO → NodeMCU D2  (GPIO 4)
 *
 * Built-in LED (D4 / GPIO2):
 *   Blinks while connecting to WiFi
 *   Solid ON  = connected + sending data
 *   Rapid blink = HTTP error
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ─── CONFIGURE THESE ──────────────────────────────────────────────────────────

const char* WIFI_SSID     = "SMART-DUSTBIN";        // Your WiFi name
const char* WIFI_PASSWORD = "12345678";     // Your WiFi password

// Laptop IP address on the same WiFi network.
// On Windows: open CMD → ipconfig → look for "IPv4 Address" under your WiFi adapter.
// Example: "192.168.1.105"
const char* SERVER_IP   = "192.168.137.1";
const int   SERVER_PORT = 3000;

// Must match SENSOR_API_KEY in your .env.local
const char* API_KEY = "smartbin-sensor-2024";

// Which dustbin ID to update (must match one of the IDs on your dashboard)
const char* DUSTBIN_ID = "BIN001";

// Physical height of the bin in centimetres (empty = sensor to bin bottom distance)
// Measure the inside depth of your dustbin when it is completely empty.
const float BIN_HEIGHT_CM = 30.0;

// Minimum distance threshold (sensor blind spot ~ 2 cm)
const float MIN_DISTANCE_CM = 2.0;

// How often to send data (milliseconds)
const unsigned long SEND_INTERVAL_MS = 5000; // 5 seconds

// ─── PIN DEFINITIONS ─────────────────────────────────────────────────────────

const int TRIG_PIN = D1;  // GPIO 5
const int ECHO_PIN = D2;  // GPIO 4
const int LED_PIN  = D4;  // GPIO 2 (built-in LED, active LOW)

// ─── GLOBALS ─────────────────────────────────────────────────────────────────

unsigned long lastSendTime = 0;
int consecutiveErrors       = 0;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Trigger the HC-SR04 and return the measured distance in centimetres.
 * Returns -1.0 on timeout.
 */
float measureDistanceCm() {
  // Clear trigger
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  // Send 10 µs pulse
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Measure echo duration (timeout = 30 ms → ~5 m max range)
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    return -1.0; // timeout / no object detected
  }

  // Speed of sound = 0.0343 cm/µs; round trip → divide by 2
  float distance = (duration * 0.0343f) / 2.0f;
  return distance;
}

/**
 * Average several readings to reduce noise.
 */
float getSmoothedDistance(int samples = 5) {
  float total = 0;
  int   valid = 0;

  for (int i = 0; i < samples; i++) {
    float d = measureDistanceCm();
    if (d > 0) {
      total += d;
      valid++;
    }
    delay(50);
  }

  if (valid == 0) return -1.0;
  return total / valid;
}

/**
 * Convert distance → fill percentage.
 *   distance == BIN_HEIGHT_CM  →  0%   (empty)
 *   distance == MIN_DISTANCE_CM → 100% (full)
 */
int distanceToFillLevel(float distanceCm) {
  if (distanceCm < 0) return -1; // sensor error

  // Clamp to valid range
  distanceCm = constrain(distanceCm, MIN_DISTANCE_CM, BIN_HEIGHT_CM);

  // Map: large distance = low fill, small distance = high fill
  float fill = (BIN_HEIGHT_CM - distanceCm) / (BIN_HEIGHT_CM - MIN_DISTANCE_CM) * 100.0f;
  return (int)constrain(fill, 0.0f, 100.0f);
}

/**
 * Blink the built-in LED n times.
 */
void blinkLED(int times, int delayMs = 150) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, LOW);  // LED ON  (active LOW)
    delay(delayMs);
    digitalWrite(LED_PIN, HIGH); // LED OFF
    delay(delayMs);
  }
}

// ─── WIFI ────────────────────────────────────────────────────────────────────

void connectWiFi() {
  Serial.printf("\n[WiFi] Connecting to \"%s\"", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // blink while connecting
    delay(500);
    Serial.print(".");
    attempts++;
    if (attempts > 60) {
      Serial.println("\n[WiFi] Failed after 30 s — restarting...");
      ESP.restart();
    }
  }

  digitalWrite(LED_PIN, LOW); // solid ON = connected
  Serial.println();
  Serial.println("[WiFi] Connected!");
  Serial.printf("[WiFi] IP Address : %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("[WiFi] Signal     : %d dBm\n", WiFi.RSSI());
}

// ─── HTTP POST ───────────────────────────────────────────────────────────────

bool sendSensorData(int fillLevel, float distanceCm) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Not connected to WiFi — skipping send");
    connectWiFi();
    return false;
  }

  String url = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + "/api/sensor";

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["dustbinId"] = DUSTBIN_ID;
  doc["fillLevel"] = fillLevel;
  doc["distance"]  = (float)((int)(distanceCm * 10)) / 10.0; // 1 decimal place
  doc["apiKey"]    = API_KEY;

  String payload;
  serializeJson(doc, payload);

  WiFiClient   client;
  HTTPClient   http;

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(8000); // 8 s timeout

  Serial.printf("[HTTP] POST %s\n", url.c_str());
  Serial.printf("[HTTP] Payload: %s\n", payload.c_str());

  int httpCode = http.POST(payload);
  String response = http.getString();
  http.end();

  if (httpCode == 200 || httpCode == 201) {
    Serial.printf("[HTTP] Response %d: %s\n", httpCode, response.c_str());
    consecutiveErrors = 0;
    blinkLED(1, 80); // quick blink = success
    return true;
  } else {
    Serial.printf("[HTTP] Error %d: %s\n", httpCode, response.c_str());
    consecutiveErrors++;
    blinkLED(3, 100); // triple blink = HTTP error
    return false;
  }
}

// ─── SETUP ───────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println("\n========================================");
  Serial.println("  Smart Dustbin NodeMCU Sensor v1.0");
  Serial.println("========================================");
  Serial.printf("  Dustbin ID  : %s\n", DUSTBIN_ID);
  Serial.printf("  Bin Height  : %.0f cm\n", BIN_HEIGHT_CM);
  Serial.printf("  Send Every  : %lu ms\n", SEND_INTERVAL_MS);
  Serial.println("========================================\n");

  // Pin setup
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN,  OUTPUT);
  digitalWrite(LED_PIN, HIGH); // LED OFF initially (active LOW)
  digitalWrite(TRIG_PIN, LOW);

  // Connect to WiFi
  connectWiFi();

  Serial.println("[Setup] Ready — starting sensor loop\n");
}

// ─── LOOP ────────────────────────────────────────────────────────────────────

void loop() {
  unsigned long now = millis();

  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Loop] WiFi lost — reconnecting...");
    digitalWrite(LED_PIN, HIGH); // LED OFF while reconnecting
    connectWiFi();
  }

  // Restart if too many consecutive errors
  if (consecutiveErrors >= 10) {
    Serial.println("[Loop] Too many errors — restarting NodeMCU...");
    delay(1000);
    ESP.restart();
  }

  // Read and send at the configured interval
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    // ── Measure ──────────────────────────────────────────────────────────────
    float distanceCm = getSmoothedDistance(5);
    int   fillLevel  = distanceToFillLevel(distanceCm);

    // ── Log to Serial Monitor ────────────────────────────────────────────────
    Serial.println("─────────────────────────────────────");
    if (distanceCm < 0) {
      Serial.println("[Sensor] ERROR — no echo received");
      Serial.println("         Check HC-SR04 wiring!");
      blinkLED(5, 80);
    } else {
      const char* statusLabel =
        fillLevel >= 80 ? "CRITICAL" :
        fillLevel >= 50 ? "WARNING"  : "Normal";

      Serial.printf("[Sensor] Distance  : %.1f cm\n", distanceCm);
      Serial.printf("[Sensor] Fill Level: %d%%\n", fillLevel);
      Serial.printf("[Sensor] Status    : %s\n", statusLabel);

      // ── Send to Dashboard ─────────────────────────────────────────────────
      bool ok = sendSensorData(fillLevel, distanceCm);
      if (ok) {
        Serial.println("[Sensor] ✓ Data sent to dashboard");
      } else {
        Serial.println("[Sensor] ✗ Failed to send — will retry");
      }
    }
    Serial.println("─────────────────────────────────────\n");
  }

  delay(100); // small yield to keep WiFi stack healthy
}