#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD setup - try both common addresses
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Try 0x3F if 0x27 doesn't work

const int sensorPin = A0;   
const int powerPin = A1;    
const int greenLED = 7;    
const int redLED = 8;       

int sensorValue = 0;        
int moisturePercent = 0;    

// Calibration values - adjusted for typical soil moisture sensor
int dryValue = 1000;    // Sensor reading in dry air (updated for your sensor)
int wetValue = 200;     // Sensor reading in water (updated for your sensor)

bool lcdFound = false;

void setup() {
  Serial.begin(9600);
  Serial.println("=== Arduino Soil Moisture Sensor Debug ===");
  
  // Setup power pin for sensor (optional)
  if (powerPin != sensorPin) {
    pinMode(powerPin, OUTPUT);
    digitalWrite(powerPin, HIGH);
    Serial.println("Sensor power pin enabled");
  }
  
  // Test LCD connection
  Wire.begin();
  Wire.beginTransmission(0x27);
  if (Wire.endTransmission() == 0) {
    lcdFound = true;
    Serial.println("LCD found at address 0x27");
  } else {
    Wire.beginTransmission(0x3F);
    if (Wire.endTransmission() == 0) {
      // Update LCD address and reinitialize
      lcd = LiquidCrystal_I2C(0x3F, 16, 2);
      lcdFound = true;
      Serial.println("LCD found at address 0x3F");
    } else {
      Serial.println("WARNING: LCD not found! Check connections.");
    }
  }
  
  if (lcdFound) {
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("Soil Monitor");
    lcd.setCursor(0, 1);
    lcd.print("Calibrating...");
  }
  
  pinMode(greenLED, OUTPUT);
  pinMode(redLED, OUTPUT);
  
  // LED startup test
  digitalWrite(greenLED, HIGH);
  digitalWrite(redLED, HIGH);
  delay(500);
  digitalWrite(greenLED, LOW);
  digitalWrite(redLED, LOW);
  
  Serial.println("Hardware check complete!");
  Serial.println("Raw sensor readings for calibration:");
  Serial.println("- Put sensor in dry air and note the value");
  Serial.println("- Put sensor in water and note the value");
  Serial.println("- Update dryValue and wetValue in code accordingly");
  Serial.println("---");
  
  delay(2000);
}

void loop() {
  // Read sensor multiple times for stability
  int readings[5];
  int total = 0;
  
  for (int i = 0; i < 5; i++) {
    readings[i] = analogRead(sensorPin);
    total += readings[i];
    delay(10);
  }
  
  sensorValue = total / 5;  // Average reading
  
  // Calculate moisture percentage with improved mapping
  // Constrain the sensor value to prevent negative percentages
  int constrainedValue = constrain(sensorValue, wetValue, dryValue);
  moisturePercent = map(constrainedValue, dryValue, wetValue, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  
  // Detailed serial output
  Serial.print("Raw Sensor: ");
  Serial.print(sensorValue);
  Serial.print(" | Constrained: ");
  Serial.print(constrainedValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");
  
  // Sensor validation
  if (sensorValue < 50) {
    Serial.println("WARNING: Sensor reading too low - check connections!");
  } else if (sensorValue > 1020) {
    Serial.println("WARNING: Sensor reading too high - sensor may be disconnected!");
  }
  
  // Show on LCD if available
  if (lcdFound) {
    lcd.setCursor(0, 0);
    lcd.print("Moisture: ");
    lcd.print(moisturePercent);
    lcd.print("%  ");
    
    lcd.setCursor(0, 1);
    lcd.print("Raw: ");
    lcd.print(sensorValue);
    lcd.print("    ");
  }
  
  // LED logic with hysteresis to prevent flickering
  static bool wasWet = false;
  int threshold = wasWet ? 35 : 40;  // Lower threshold when transitioning from wet to dry
  
  if (moisturePercent > threshold) {
    digitalWrite(greenLED, HIGH);
    digitalWrite(redLED, LOW);
    wasWet = true;
    Serial.println("Status: SOIL WET (Green LED)");
  } else {
    digitalWrite(greenLED, LOW);
    digitalWrite(redLED, HIGH);
    wasWet = false;
    Serial.println("Status: SOIL DRY (Red LED)");
  }
  
  // Diagnostic information
  if (millis() % 10000 < 1000) {  // Every 10 seconds
    Serial.println("=== DIAGNOSTIC INFO ===");
    Serial.print("Calibration - Dry: ");
    Serial.print(dryValue);
    Serial.print(", Wet: ");
    Serial.println(wetValue);
    Serial.print("LCD Status: ");
    Serial.println(lcdFound ? "OK" : "NOT FOUND");
    Serial.println("=======================");
  }
  
  Serial.println("---");
  delay(1000);
}

// Helper function to scan for I2C devices (can be called manually)
void scanI2C() {
  Serial.println("Scanning I2C devices...");
  int deviceCount = 0;
  
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
      deviceCount++;
    }
  }
  
  if (deviceCount == 0) {
    Serial.println("No I2C devices found");
  } else {
    Serial.print("Found ");
    Serial.print(deviceCount);
    Serial.println(" I2C devices");
  }
}