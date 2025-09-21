/*
 * FarmNex Unified Soil Moisture Sensor
 * Combines Simple, Debug, and Calibration modes in one file
 * 
 * MODES:
 * 0 = CALIBRATION_MODE - Find dry/wet values for your sensor
 * 1 = DEBUG_MODE       - Full diagnostics and troubleshooting  
 * 2 = SIMPLE_MODE      - Clean production mode
 * 
 * Change the MODE value below and upload to switch between modes
 */

// === CONFIGURATION ===
#define MODE 1  // Change this: 0=Calibration, 1=Debug, 2=Simple

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Hardware setup
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Will auto-detect 0x3F if needed
const int sensorPin = A0;   
const int powerPin = A1;    // Optional power control
const int greenLED = 7;    
const int redLED = 8;       

// Sensor variables
int sensorValue = 0;        
int moisturePercent = 0;    

// Calibration values (update these based on your sensor)
int dryValue = 1000;    // Reading in dry air
int wetValue = 200;     // Reading in water

// System variables
bool lcdFound = false;
bool wasWet = false;  // For anti-flickering

// === SETUP FUNCTION ===
void setup() {
  Serial.begin(9600);
  
  // Mode-specific initialization
  switch(MODE) {
    case 0: // CALIBRATION MODE
      setupCalibrationMode();
      break;
    case 1: // DEBUG MODE
      setupDebugMode();
      break;
    case 2: // SIMPLE MODE
      setupSimpleMode();
      break;
    default:
      Serial.println("ERROR: Invalid MODE! Set to 0, 1, or 2");
      while(1); // Stop execution
  }
}

// === MAIN LOOP ===
void loop() {
  switch(MODE) {
    case 0: // CALIBRATION MODE
      loopCalibrationMode();
      break;
    case 1: // DEBUG MODE
      loopDebugMode();
      break;
    case 2: // SIMPLE MODE
      loopSimpleMode();
      break;
  }
}


void setupCalibrationMode() {
  Serial.println("=== CALIBRATION MODE ===");
  Serial.println("Find the correct DRY and WET values for your sensor");
  Serial.println("Instructions:");
  Serial.println("1. Place sensor in DRY air - note the value");
  Serial.println("2. Place sensor in water/wet soil - note the value");
  Serial.println("3. Update dryValue and wetValue in the code");
  Serial.println();
  delay(2000);
}

void loopCalibrationMode() {

  int total = 0;
  const int numReadings = 10;
  
  for (int i = 0; i < numReadings; i++) {
    total += analogRead(sensorPin);
    delay(50);
  }
  
  int averageReading = total / numReadings;
  
  // Display results
  Serial.print("Raw Sensor Reading: ");
  Serial.print(averageReading);
  
  // Show estimated percentage with current calibration
  Serial.print(" | Current calibration: ");
  int testPercent = map(averageReading, dryValue, wetValue, 0, 100);
  testPercent = constrain(testPercent, 0, 100);
  Serial.print(testPercent);
  Serial.print("%");
  
  // Classification helper
  if (averageReading > 800) {
    Serial.print(" → LIKELY DRY AIR (use as dryValue)");
  } else if (averageReading < 400) {
    Serial.print(" → LIKELY WET (use as wetValue)");
  } else {
    Serial.print(" → MOIST SOIL");
  }
  
  Serial.println();
  delay(1000);
}

// =====================================
// DEBUG MODE FUNCTIONS
// =====================================
void setupDebugMode() {
  Serial.println("=== DEBUG MODE ===");
  Serial.println("Full diagnostics and troubleshooting enabled");
  
  // Setup power pin for sensor
  if (powerPin != sensorPin) {
    pinMode(powerPin, OUTPUT);
    digitalWrite(powerPin, HIGH);
    Serial.println("✓ Sensor power pin enabled");
  }
  
  // Test LCD connection
  detectLCD();
  
  if (lcdFound) {
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("Debug Mode");
    lcd.setCursor(0, 1);
    lcd.print("Initializing...");
  }
  
  // Setup LEDs
  pinMode(greenLED, OUTPUT);
  pinMode(redLED, OUTPUT);
  
  // LED startup test
  Serial.println("Testing LEDs...");
  digitalWrite(greenLED, HIGH);
  digitalWrite(redLED, HIGH);
  delay(500);
  digitalWrite(greenLED, LOW);
  digitalWrite(redLED, LOW);
  Serial.println("✓ LED test complete");
  
  Serial.println("✓ Hardware check complete!");
  Serial.println("Monitoring with full diagnostics...");
  Serial.println("---");
  delay(2000);
}

void loopDebugMode() {
  // Read sensor with averaging
  int readings[5];
  int total = 0;
  
  for (int i = 0; i < 5; i++) {
    readings[i] = analogRead(sensorPin);
    total += readings[i];
    delay(10);
  }
  
  sensorValue = total / 5;  // Average reading
  
  // Calculate moisture with validation
  int constrainedValue = constrain(sensorValue, wetValue, dryValue);
  moisturePercent = map(constrainedValue, dryValue, wetValue, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  
  // Detailed serial output
  Serial.print("Raw: ");
  Serial.print(sensorValue);
  Serial.print(" | Constrained: ");
  Serial.print(constrainedValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");
  
  // Sensor validation
  validateSensor();
  
  // Update LCD
  updateLCDDebug();
  
  // LED control with hysteresis
  controlLEDsDebug();
  
  // Periodic diagnostics
  if (millis() % 10000 < 1000) {  // Every 10 seconds
    printDiagnostics();
  }
  
  Serial.println("---");
  delay(1000);
}

// =====================================
// SIMPLE MODE FUNCTIONS
// =====================================
void setupSimpleMode() {
  Serial.println("=== SIMPLE MODE ===");
  Serial.println("Arduino Uno Soil Moisture Sensor Starting...");
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  
  // Setup LEDs
  pinMode(greenLED, OUTPUT);
  pinMode(redLED, OUTPUT);
  
  // Display initial message
  lcd.setCursor(0, 0);
  lcd.print("Soil Moisture:");
  
  Serial.println("✓ Setup complete. Reading sensor data...");
}

void loopSimpleMode() {
  // Read sensor
  sensorValue = analogRead(sensorPin);
  
  // Calculate moisture percentage
  moisturePercent = map(sensorValue, dryValue, wetValue, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  
  // Update LCD
  lcd.setCursor(0, 1);
  lcd.print("Wet: ");
  lcd.print(moisturePercent);
  lcd.print("%   "); // Clear trailing chars
  
  // LED control
  if (moisturePercent > 40) {   // Soil wet enough
    digitalWrite(greenLED, HIGH);
    digitalWrite(redLED, LOW);
    Serial.println("Status: Soil is wet enough (Green LED ON)");
  } else {                      // Soil too dry
    digitalWrite(greenLED, LOW);
    digitalWrite(redLED, HIGH);
    Serial.println("Status: Soil too dry! (Red LED ON)");
  }
  
  // Serial output
  Serial.print("Raw: ");
  Serial.print(sensorValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");
  Serial.println("---");
  
  delay(1000);
}

// =====================================
// HELPER FUNCTIONS
// =====================================
void detectLCD() {
  Wire.begin();
  
  // Try 0x27 first
  Wire.beginTransmission(0x27);
  if (Wire.endTransmission() == 0) {
    lcdFound = true;
    Serial.println("✓ LCD found at address 0x27");
    return;
  }
  
  // Try 0x3F
  Wire.beginTransmission(0x3F);
  if (Wire.endTransmission() == 0) {
    lcd = LiquidCrystal_I2C(0x3F, 16, 2);
    lcdFound = true;
    Serial.println("✓ LCD found at address 0x3F");
    return;
  }
  
  Serial.println("⚠ WARNING: LCD not found! Check connections.");
}

void validateSensor() {
  if (sensorValue < 50) {
    Serial.println("⚠ WARNING: Sensor reading too low - check connections!");
  } else if (sensorValue > 1020) {
    Serial.println("⚠ WARNING: Sensor reading too high - sensor may be disconnected!");
  }
}

void updateLCDDebug() {
  if (!lcdFound) return;
  
  lcd.setCursor(0, 0);
  lcd.print("Moisture: ");
  lcd.print(moisturePercent);
  lcd.print("%  ");
  
  lcd.setCursor(0, 1);
  lcd.print("Raw: ");
  lcd.print(sensorValue);
  lcd.print("    ");
}

void controlLEDsDebug() {
  // Anti-flickering logic
  int threshold = wasWet ? 35 : 40;  // Hysteresis
  
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
}

void printDiagnostics() {
  Serial.println("=== DIAGNOSTIC INFO ===");
  Serial.print("Mode: ");
  switch(MODE) {
    case 0: Serial.println("CALIBRATION"); break;
    case 1: Serial.println("DEBUG"); break;
    case 2: Serial.println("SIMPLE"); break;
  }
  Serial.print("Calibration - Dry: ");
  Serial.print(dryValue);
  Serial.print(", Wet: ");
  Serial.println(wetValue);
  Serial.print("LCD Status: ");
  Serial.println(lcdFound ? "OK" : "NOT FOUND");
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");
  Serial.println("=======================");
}

// Scan for I2C devices (can be called manually if needed)
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