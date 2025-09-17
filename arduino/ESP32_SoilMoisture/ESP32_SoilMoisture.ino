

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
  
  delay(100); 
}

void takeSoilMoistureReading() {

  if (POWER_PIN > 0) {
    digitalWrite(POWER_PIN, HIGH);
    delay(100);
  }
  

  long totalReading = 0;
  int validSamples = 0;
  
  for (int i = 0; i < NUM_SAMPLES; i++) {
    int reading = analogRead(SOIL_MOISTURE_PIN);
    
    // Basic validation - ESP32 ADC is 12-bit (0-4095)
    if (reading >= 0 && reading <= 4095) {
      totalReading += reading;
      validSamples++;
    }
    
    delay(10); 
  }
  

  if (POWER_PIN > 0) {
    digitalWrite(POWER_PIN, LOW);
  }
  
  if (validSamples == 0) {
    Serial.println("ERROR: No valid sensor readings obtained");
    return;
  }
  

  int rawReading = totalReading / validSamples;
  
 
  float moisturePercent = map(rawReading, DRY_VALUE, WET_VALUE, 0, 100);
  

  moisturePercent = constrain(moisturePercent, 0, 100);
  

  float temperature = readTemperature();
  

  StaticJsonDocument<200> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["moisture"] = round(moisturePercent * 10) / 10.0; // Round to 1 decimal place
  doc["raw"] = rawReading;
  doc["fieldId"] = FIELD_ID;
  doc["samples"] = validSamples;
  doc["timestamp"] = millis();
  

  if (temperature != -999) {
    doc["temperature"] = temperature;
  }
  

  float batteryLevel = readBatteryLevel();
  if (batteryLevel > 0) {
    doc["batteryLevel"] = batteryLevel;
  }
  

  serializeJson(doc, Serial);
  Serial.println(); 
  

  Serial.println("DEBUG: Raw=" + String(rawReading) + 
                 ", Moisture=" + String(moisturePercent, 1) + "%");
}

float readTemperature() {

  return -999; 
}

float readBatteryLevel() {
  
  return 0; 
}


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

