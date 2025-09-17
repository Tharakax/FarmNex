#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD setup (check address: 0x27 or 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);

const int sensorPin = A0;   // Soil moisture analog input
const int greenLED = 7;     // Green LED pin
const int redLED = 8;       // Red LED pin

int sensorValue = 0;        
int moisturePercent = 0;    

void setup() {
  // Serial setup for monitoring
  Serial.begin(9600);
  Serial.println("Arduino Uno Soil Moisture Sensor Starting...");
  
  // LCD setup
  lcd.init();
  lcd.backlight();

  // LED pins
  pinMode(greenLED, OUTPUT);
  pinMode(redLED, OUTPUT);

  lcd.setCursor(0, 0);
  lcd.print("Soil Moisture:");
  
  Serial.println("Setup complete. Reading sensor data...");
}

void loop() {
  // Read sensor
  sensorValue = analogRead(sensorPin);  
  // Map to percentage (adjust values for calibration)
  moisturePercent = map(sensorValue, 1023, 200, 0, 100);

  // Show on LCD
  lcd.setCursor(0, 1);
  lcd.print("Wet: ");
  lcd.print(moisturePercent);
  lcd.print("%   "); // Clear trailing chars

  // LED logic
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
  Serial.println("---");

  delay(1000);
}
