/*
 * ESP32 Soil Moisture Sensor
 * Reads analog soil moisture sensor and sends data via Serial to Node.js bridge
 * 
 * Hardware Connections:
 * - Soil Moisture Sensor VCC -> 3.3V
 * - Soil Moisture Sensor GND -> GND  
 * - Soil Moisture Sensor A0  -> GPIO 34 (ADC1_CH6)
 * 
 * Optional:
 * - DS18B20 Temperature Sensor -> GPIO 4 (for temperature readings)
 * 
 * Created for FarmNex IoT Dashboard
 */

#include <ArduinoJson.h>
#include <HardwareSerial.h>
#include <USBAPI.h>

// Pin definitions
const int SOIL_MOISTURE_PIN = 34;  // ADC1_CH6 - use ADC1 pins for WiFi compatibility
const int POWER_PIN = 32;          // Optional: Power control pin to reduce corrosion

// Sensor calibration values (adjust based on your sensor)
const int DRY_VALUE = 4095;   // Sensor reading in completely dry soil (12-bit ADC max)
const int WET_VALUE = 1500;   // Sensor reading in completely wet soil

// Reading configuration
const unsigned long READING_INTERVAL = 10000; // 10 seconds between readings
const int NUM_SAMPLES = 10;                   // Number of samples to average

// Device configuration
const String DEVICE_ID = "ESP32-SOIL-001";
const String FIELD_ID = "FIELD-A";  // Optional: specify which field/plot

unsigned long lastReading = 0;

void setup() {
  Serial.begin(115200);
  
  // Configure pins
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  if (POWER_PIN > 0) {
    pinMode(POWER_PIN, OUTPUT);
    digitalWrite(POWER_PIN, LOW); // Start with sensor off to prevent corrosion
  }
  
  // Wait for serial connection
  delay(2000);
  
  Serial.println("INFO: ESP32 Soil Moisture Sensor Starting...");
  Serial.println("INFO: Device ID: " + DEVICE_ID);
  Serial.println("INFO: Sampling every " + String(READING_INTERVAL / 1000) + " seconds");
  Serial.println("INFO: Ready to send data to serial bridge");
  Serial.println("");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if it's time for a new reading
  if (currentTime - lastReading >= READING_INTERVAL) {
    takeSoilMoistureReading();
    lastReading = currentTime;
  }
  
  delay(100); // Small delay to prevent excessive CPU usage
}

void takeSoilMoistureReading() {
  // Power on sensor to take reading (if power control is used)
  if (POWER_PIN > 0) {
    digitalWrite(POWER_PIN, HIGH);
    delay(100); // Allow sensor to stabilize
  }
  
  // Take multiple samples and average them
  long totalReading = 0;
  int validSamples = 0;
  
  for (int i = 0; i < NUM_SAMPLES; i++) {
    int reading = analogRead(SOIL_MOISTURE_PIN);
    
    // Basic validation - ESP32 ADC is 12-bit (0-4095)
    if (reading >= 0 && reading <= 4095) {
      totalReading += reading;
      validSamples++;
    }
    
    delay(10); // Small delay between samples
  }
  
  // Power off sensor to prevent corrosion
  if (POWER_PIN > 0) {
    digitalWrite(POWER_PIN, LOW);
  }
  
  if (validSamples == 0) {
    Serial.println("ERROR: No valid sensor readings obtained");
    return;
  }
  
  // Calculate average raw reading
  int rawReading = totalReading / validSamples;
  
  // Convert to moisture percentage (0-100%)
  // Note: Lower analog reading = higher moisture
  float moisturePercent = map(rawReading, DRY_VALUE, WET_VALUE, 0, 100);
  
  // Constrain to valid range
  moisturePercent = constrain(moisturePercent, 0, 100);
  
  // Optional: Add temperature reading (if DS18B20 connected)
  float temperature = readTemperature();
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["moisture"] = round(moisturePercent * 10) / 10.0; // Round to 1 decimal place
  doc["raw"] = rawReading;
  doc["fieldId"] = FIELD_ID;
  doc["samples"] = validSamples;
  doc["timestamp"] = millis();
  
  // Add temperature if available
  if (temperature != -999) {
    doc["temperature"] = temperature;
  }
  
  // Add battery level if monitoring is available
  float batteryLevel = readBatteryLevel();
  if (batteryLevel > 0) {
    doc["batteryLevel"] = batteryLevel;
  }
  
  // Send JSON to serial
  serializeJson(doc, Serial);
  Serial.println(); // Add newline for parser
  
  // Debug output (will be filtered by bridge script)
  Serial.println("DEBUG: Raw=" + String(rawReading) + 
                 ", Moisture=" + String(moisturePercent, 1) + "%");
}

float readTemperature() {
  // Placeholder for DS18B20 or DHT22 temperature sensor
  // Implement if you have a temperature sensor connected
  return -999; // Return -999 if no sensor available
}

float readBatteryLevel() {
  // Placeholder for battery monitoring
  // Implement if running on battery power
  // Could read voltage divider on ADC pin
  return 0; // Return 0 if not implemented
}

// Calibration helper function - uncomment to run calibration
void runCalibration() {
  Serial.println("=== CALIBRATION MODE ===");
  Serial.println("1. Place sensor in completely DRY soil");
  Serial.println("2. Wait 10 seconds and note the RAW reading");
  Serial.println("3. Place sensor in completely WET soil");
  Serial.println("4. Wait 10 seconds and note the RAW reading");
  Serial.println("5. Update DRY_VALUE and WET_VALUE constants");
  Serial.println("");
  
  while (true) {
    int reading = analogRead(SOIL_MOISTURE_PIN);
    Serial.println("Current RAW reading: " + String(reading));
    delay(1000);
  }
}

/*
 * SETUP INSTRUCTIONS:
 * 
 * 1. Hardware Setup:
 *    - Connect soil moisture sensor VCC to ESP32 3.3V
 *    - Connect sensor GND to ESP32 GND
 *    - Connect sensor A0/Signal to ESP32 GPIO 34
 *    - Optionally connect GPIO 32 to sensor VCC for power control
 * 
 * 2. Calibration:
 *    - Uncomment runCalibration() in setup() to run calibration mode
 *    - Note dry and wet readings, update DRY_VALUE and WET_VALUE constants
 *    - Comment out calibration and upload final sketch
 * 
 * 3. Serial Bridge:
 *    - Upload this sketch to ESP32
 *    - Note the COM port (Windows) or /dev/tty* (Mac/Linux) 
 *    - Update ESP32_SERIAL_PORT in backend/.env
 *    - Run: node serialBridge.js
 * 
 * 4. Troubleshooting:
 *    - Check serial monitor at 115200 baud for debug messages
 *    - Ensure good connections and adequate power supply
 *    - Verify sensor is properly inserted in soil
 *    - Check that COM port is not used by other applications
 */
