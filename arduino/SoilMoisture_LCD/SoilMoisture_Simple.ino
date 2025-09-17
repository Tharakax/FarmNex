

const int sensorPin = A0;   // Soil moisture analog input
const int greenLED = 7;     // Green LED pin  
const int redLED = 8;       // Red LED pin

int sensorValue = 0;        // Raw sensor value
int moisturePercent = 0;    // Mapped percentage

void setup() {
  // Serial setup for monitoring
  Serial.begin(9600);
  Serial.println("Arduino Uno Soil Moisture Sensor Starting...");
  Serial.println("=== FarmNex Soil Monitor (Simplified) ===");
  Serial.println("");
  
  // LED pins
  pinMode(greenLED, OUTPUT);
  pinMode(redLED, OUTPUT);
  
  // Test LEDs on startup
  digitalWrite(greenLED, HIGH);
  digitalWrite(redLED, HIGH);
  delay(500);
  digitalWrite(greenLED, LOW);
  digitalWrite(redLED, LOW);
  
  Serial.println("Setup complete. Reading sensor data...");
  Serial.println("Calibration: Dry=1023, Wet=200 (adjust as needed)");
  Serial.println("Threshold: >40% = Green LED, <=40% = Red LED");
  Serial.println("");
}

void loop() {
  // Read sensor
  sensorValue = analogRead(sensorPin);
  
  // Map to percentage (adjust values for calibration)
  // 1023 = completely dry (no moisture)
  // 200 = completely wet (in water)
  moisturePercent = map(sensorValue, 1023, 200, 0, 100);
  
  // Constrain to valid range
  moisturePercent = constrain(moisturePercent, 0, 100);
  
  // LED logic and status
  if (moisturePercent > 40) {   // Soil wet enough
    digitalWrite(greenLED, HIGH);
    digitalWrite(redLED, LOW);
    Serial.println("Status: Soil is wet enough (Green LED ON)");
  } else {                      // Soil too dry
    digitalWrite(greenLED, LOW);
    digitalWrite(redLED, HIGH);
    Serial.println("Status: Soil too dry! (Red LED ON)");
  }
  
  // Serial output for monitoring
  Serial.print("Raw Sensor Value: ");
  Serial.print(sensorValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");
  
  // Show moisture level graphically
  Serial.print("Level: [");
  int bars = moisturePercent / 10;  // 0-10 bars
  for (int i = 0; i < 10; i++) {
    if (i < bars) {
      Serial.print("█");
    } else {
      Serial.print("░");
    }
  }
  Serial.print("] ");
  Serial.print(moisturePercent);
  Serial.println("%");
  
  // Moisture classification
  if (moisturePercent >= 70) {
    Serial.println("Classification: Very Wet 💧💧💧");
  } else if (moisturePercent >= 50) {
    Serial.println("Classification: Wet 💧💧");
  } else if (moisturePercent >= 30) {
    Serial.println("Classification: Moist 💧");
  } else if (moisturePercent >= 10) {
    Serial.println("Classification: Dry 🟡");
  } else {
    Serial.println("Classification: Very Dry 🔴");
  }
  
  Serial.println("---");
  delay(2000); // Read every 2 seconds
}

/*
 * Calibration Instructions:
 * 1. Upload this code to Arduino
 * 2. Open Serial Monitor (9600 baud)
 * 3. Put sensor in dry soil/air -> note Raw value (should be ~1023)
 * 4. Put sensor in wet soil/water -> note Raw value (should be ~200-400)
 * 5. Adjust the map() values in line 42 based on your readings
 * 
 * Example: If dry=950 and wet=300, change to:
 * moisturePercent = map(sensorValue, 950, 300, 0, 100);
 */
