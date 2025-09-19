/*
 * Soil Moisture Sensor Calibration Tool
 * Use this to find the correct DRY and WET values for your sensor
 * 
 * Instructions:
 * 1. Upload this code to your Arduino
 * 2. Open Serial Monitor (115200 baud)
 * 3. Note the "Dry Air" value when sensor is in air
 * 4. Note the "In Water" value when sensor touches water
 * 5. Use these values in your main code
 */

const int sensorPin = A0;
const int numReadings = 10;

void setup() {
  Serial.begin(115200);
  Serial.println("=== Soil Moisture Sensor Calibration Tool ===");
  Serial.println("Place sensor in DRY air first, then in water/wet soil");
  Serial.println("Record the values to update your main code");
  Serial.println();
  delay(2000);
}

void loop() {
  // Take multiple readings for accuracy
  int total = 0;
  for (int i = 0; i < numReadings; i++) {
    total += analogRead(sensorPin);
    delay(50);
  }
  
  int averageReading = total / numReadings;
  
  // Display raw reading and estimated values
  Serial.print("Raw Sensor Reading: ");
  Serial.print(averageReading);
  
  // Show what it would be with common calibration ranges
  Serial.print(" | If DRY=900, WET=300: ");
  int moisturePercent = map(averageReading, 900, 300, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  Serial.print(moisturePercent);
  Serial.print("%");
  
  // Classification
  if (averageReading > 800) {
    Serial.print(" (LIKELY DRY AIR - use this as DRY_VALUE)");
  } else if (averageReading < 400) {
    Serial.print(" (LIKELY WET - use this as WET_VALUE)");
  } else {
    Serial.print(" (MOIST SOIL)");
  }
  
  Serial.println();
  delay(1000);
}