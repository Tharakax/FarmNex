# Arduino Uno Integration - FarmNex IoT Soil Monitoring

## Overview
Arduino Uno soil moisture sensor integration for the FarmNex dashboard. This system reads soil moisture data from an Arduino Uno and sends it to your FarmNex backend API for storage and visualization.

## 🔧 Hardware Setup

### Required Components:
- **Arduino Uno** (connected via USB to COM4)
- **Soil Moisture Sensor** (capacitive or resistive)
- **Green LED** with 220Ω resistor
- **Red LED** with 220Ω resistor
- **Breadboard and jumper wires**

### Wiring Connections:
```
Arduino Uno     →   Component
─────────────────────────────────
5V              →   Soil Sensor VCC
GND             →   Soil Sensor GND
A0              →   Soil Sensor Signal
Pin 7           →   Green LED (+ resistor)
Pin 8           →   Red LED (+ resistor)
```

## 💻 Arduino Code

### Location:
- `arduino/SoilMoisture_LCD/SoilMoisture_Simple.ino`

### Features:
- ✅ **Serial output** at 9600 baud
- ✅ **LED indicators** (Green = wet, Red = dry)
- ✅ **Real-time monitoring** via Serial Monitor
- ✅ **Visual moisture bar** in console
- ✅ **Calibration guidance**
- ✅ **No external library dependencies**

### Upload Instructions:
1. Open Arduino IDE
2. Open: `arduino/SoilMoisture_LCD/SoilMoisture_Simple.ino`
3. Tools → Board → Arduino Uno
4. Tools → Port → COM4
5. Click Upload (➡️)

## 🌐 Backend Integration

### Serial Bridge:
- **File**: `backend/serialBridge_Arduino.js`
- **Purpose**: Connects Arduino Uno to FarmNex API
- **Baud Rate**: 9600 (Arduino Uno standard)
- **Device ID**: `ARDUINO-UNO-001`

### Configuration (.env):
```bash
# Arduino Uno Configuration  
ARDUINO_SERIAL_PORT=COM4
ARDUINO_DEVICE_ID=ARDUINO-UNO-001
IOT_API_KEY=your-secure-iot-api-key-123456
API_URL=http://localhost:3000
```

## 🚀 Running the System

### Step 1: Upload Arduino Code
```bash
# In Arduino IDE:
# - Open SoilMoisture_Simple.ino
# - Select Arduino Uno board
# - Select COM4 port  
# - Click Upload
```

### Step 2: Start Backend Server
```bash
cd backend
npm start
```

### Step 3: Start Arduino Serial Bridge
```bash
cd backend
npm run arduino-bridge
```

### Step 4: Verify Connection
```bash
# Test Arduino output:
python test_arduino_uno.py
```

## 📊 Data Flow

```
Arduino Uno → Serial (9600) → Serial Bridge → FarmNex API → MongoDB → Dashboard
```

### Data Format:
```
Serial Output: "Raw Sensor Value: 512 | Moisture: 45%"
API Payload:   {"deviceId": "ARDUINO-UNO-001", "moisture": 45.0, "raw": 512}
```

## 🔍 Testing & Monitoring

### Arduino Test Script:
```bash
python test_arduino_uno.py
```

### Expected Output:
```
✅ SUCCESS: Arduino Uno is working!
   📡 Serial communication: OK
   💧 Average moisture: 45.2%
   📈 Readings count: 12
   🌱 Moisture range: 32% - 67%
```

### LED Behavior:
- 🟢 **Green LED ON**: Moisture > 40% (soil adequately wet)
- 🔴 **Red LED ON**: Moisture ≤ 40% (soil needs watering)

## 📋 API Endpoints

### Send Data (IoT Device):
```http
POST /api/iot/soil
X-API-Key: your-secure-iot-api-key-123456
Content-Type: application/json

{
  "deviceId": "ARDUINO-UNO-001",
  "moisture": 45.0,
  "raw": 512
}
```

### Get Latest Reading:
```http
GET /api/soil/latest?deviceId=ARDUINO-UNO-001
```

### Get History:
```http
GET /api/soil/history?deviceId=ARDUINO-UNO-001&limit=50
```

### Get Statistics:
```http
GET /api/soil/stats?deviceId=ARDUINO-UNO-001&days=7
```

## 🔧 Calibration

### Auto-Calibration Process:
1. Upload Arduino code
2. Open Serial Monitor (9600 baud)
3. Place sensor in **dry soil/air** → note Raw value
4. Place sensor in **wet soil/water** → note Raw value
5. Update calibration values in code:

```cpp
// Example: If dry=950 and wet=300
moisturePercent = map(sensorValue, 950, 300, 0, 100);
```

### Default Values:
- **Dry**: 1023 (no moisture)
- **Wet**: 200 (in water)

## 📂 File Structure

```
FarmNex/
├── arduino/
│   ├── ESP32_SoilMoisture/           # ESP32 version
│   └── SoilMoisture_LCD/            # Arduino Uno version
│       ├── SoilMoisture.ino         # LCD version (needs library)
│       └── SoilMoisture_Simple.ino  # Simple version (no deps)
├── backend/
│   ├── serialBridge.js              # ESP32 bridge (115200 baud)
│   ├── serialBridge_Arduino.js      # Arduino bridge (9600 baud)
│   ├── models/soilReading.js        # Data model
│   ├── routers/soilRouter.js        # API routes
│   └── .env                         # Configuration
├── test_arduino_uno.py              # Arduino test script
└── ARDUINO_INTEGRATION.md           # This file
```

## 🛠 Troubleshooting

### Arduino Not Uploading:
- ❌ Wrong board selected → Select "Arduino Uno"
- ❌ Wrong port → Check Device Manager, select COM4
- ❌ Arduino IDE Serial Monitor open → Close it first

### No Serial Data:
- ❌ Code not uploaded → Upload `SoilMoisture_Simple.ino`
- ❌ Wrong baud rate → Ensure 9600 in Serial Monitor
- ❌ USB connection → Try different cable/port

### Serial Bridge Errors:
- ❌ Port in use → Close Arduino IDE Serial Monitor
- ❌ Wrong COM port → Update `ARDUINO_SERIAL_PORT` in .env
- ❌ Missing API key → Set `IOT_API_KEY` in .env

### API Errors:
- ❌ Server not running → `npm start` in backend/
- ❌ Database connection → Check MongoDB URL in .env
- ❌ Authentication → Verify `IOT_API_KEY` matches

## 🌱 Integration Status

- ✅ **Arduino Code**: Simplified version ready
- ✅ **Serial Bridge**: Arduino-specific bridge created
- ✅ **API Routes**: Soil data endpoints ready
- ✅ **Database Model**: Soil reading schema ready
- ✅ **Testing Script**: Python test for Arduino
- ✅ **Configuration**: .env setup complete

## 🚀 Next Steps

1. **Upload Arduino code** to your Arduino Uno
2. **Start the backend server** (`npm start`)
3. **Run the serial bridge** (`npm run arduino-bridge`)
4. **Test the integration** (`python test_arduino_uno.py`)
5. **Connect soil sensor** to pin A0 for real readings
6. **View data** in your FarmNex dashboard

Your Arduino Uno is now fully integrated into the FarmNex IoT ecosystem! 🎉
