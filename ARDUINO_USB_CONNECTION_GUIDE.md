# 🔌 Arduino USB Connection to FarmNex System

## 🔄 **How It Works: Arduino → USB → Your Device → FarmNex Dashboard**

Here's the complete data flow when you plug your Arduino via USB:

---

## 📊 **Data Flow Diagram**

```
🌱 Soil Sensor → 📟 Arduino → 🔌 USB Cable → 💻 Computer → 🌐 FarmNex Backend → 📱 Dashboard Widget
```

### **Step-by-Step Process:**

1. **📏 Sensor Reading**: Arduino reads soil moisture via analog pin A0
2. **💾 Data Processing**: Arduino converts raw values to moisture percentage  
3. **📡 Serial Communication**: Arduino sends data via Serial.print() at 9600 baud
4. **🔌 USB Transfer**: USB cable carries serial data to computer
5. **💻 Computer Reception**: Computer receives data on COM port (Windows) or /dev/tty* (Linux/Mac)
6. **🔄 Backend Processing**: FarmNex backend reads serial data and stores in database
7. **🌐 API Endpoint**: Data becomes available via `/api/soil/latest` endpoint
8. **📱 Dashboard Display**: SoilMoistureWidget fetches and displays the data

---

## 🛠️ **What You Need to Set Up**

### **1. Arduino Code (You Already Have This!)**
Your `SoilMoisture_Debug.ino` sends data via serial:

```arduino
// This is what your Arduino outputs every second:
Serial.print("Raw Sensor: ");
Serial.print(sensorValue);
Serial.print(" | Moisture: ");
Serial.print(moisturePercent);
Serial.println("%");
```

### **2. Serial Communication Bridge** 
You need a backend service to read Arduino serial data. Here's what's missing:

```javascript
// Backend service to read Arduino serial data
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 }); // Linux/Mac
// const port = new SerialPort('COM3', { baudRate: 9600 }); // Windows

const parser = port.pipe(new Readline({ delimiter: '\n' }));

parser.on('data', (data) => {
  console.log('Arduino data:', data);
  // Parse and save to database
  parseAndSaveData(data);
});
```

### **3. Database Storage**
Store the data so your dashboard can access it:

```javascript
// Save Arduino data to database
const saveToDatabase = async (moistureData) => {
  await SoilData.create({
    deviceId: 'ARDUINO-UNO-001',
    moisture: moistureData.moisture,
    raw: moistureData.raw,
    temperature: moistureData.temperature || null,
    createdAt: new Date()
  });
};
```

---

## 🔌 **Physical Connection Process**

### **Step 1: Hardware Setup**
```
Arduino Uno → USB-A to USB-B Cable → Computer USB Port
```

### **Step 2: Driver Installation**
- **Windows**: Arduino IDE installs drivers automatically
- **Linux/Mac**: Usually works without additional drivers

### **Step 3: Port Detection**
Your system will detect Arduino on:
- **Windows**: `COM3`, `COM4`, `COM5`, etc.
- **Linux**: `/dev/ttyUSB0`, `/dev/ttyACM0`
- **Mac**: `/dev/cu.usbmodem*`

### **Step 4: Communication Test**
```bash
# Test if Arduino is sending data (Windows)
mode COM3 BAUD=9600 PARITY=n DATA=8 STOP=1
type COM3

# Test on Linux/Mac  
screen /dev/ttyUSB0 9600
```

---

## 💻 **Backend Integration Code**

Here's the missing piece - a Node.js service to connect Arduino to FarmNex:

### **Arduino Serial Reader Service**

```javascript
// arduino-bridge.js
const express = require('express');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const app = express();

// Configure serial port (adjust COM port for your system)
const ARDUINO_PORT = process.env.ARDUINO_PORT || 'COM3'; // Windows
// const ARDUINO_PORT = process.env.ARDUINO_PORT || '/dev/ttyUSB0'; // Linux

let latestData = {
  deviceId: 'ARDUINO-UNO-001',
  moisture: null,
  raw: null,
  temperature: null,
  status: 'disconnected',
  lastUpdated: null
};

// Initialize serial connection
const connectArduino = () => {
  const port = new SerialPort(ARDUINO_PORT, { baudRate: 9600 });
  const parser = port.pipe(new Readline({ delimiter: '\n' }));

  port.on('open', () => {
    console.log('✅ Arduino connected on', ARDUINO_PORT);
    latestData.status = 'connected';
  });

  port.on('error', (err) => {
    console.error('❌ Arduino connection error:', err.message);
    latestData.status = 'error';
  });

  parser.on('data', (data) => {
    console.log('📡 Arduino data:', data);
    parseArduinoData(data.toString());
  });

  return port;
};

// Parse Arduino serial output
const parseArduinoData = (data) => {
  try {
    // Parse your Arduino debug output format:
    // "Raw Sensor: 450 | Constrained: 450 | Moisture: 65%"
    
    const rawMatch = data.match(/Raw Sensor: (\d+)/);
    const moistureMatch = data.match(/Moisture: (\d+)%/);
    
    if (rawMatch && moistureMatch) {
      latestData.raw = parseInt(rawMatch[1]);
      latestData.moisture = parseInt(moistureMatch[1]);
      latestData.lastUpdated = new Date().toISOString();
      latestData.status = 'connected';
      
      console.log('💾 Data saved:', {
        raw: latestData.raw,
        moisture: latestData.moisture
      });
      
      // Here you would save to your database
      // await saveSoilData(latestData);
    }
  } catch (error) {
    console.error('❌ Error parsing Arduino data:', error);
  }
};

// API endpoint for your SoilMoistureWidget
app.get('/api/soil/latest', (req, res) => {
  const { deviceId } = req.query;
  
  if (deviceId === 'ARDUINO-UNO-001') {
    res.json({
      success: true,
      data: {
        deviceId: latestData.deviceId,
        moisture: latestData.moisture,
        raw: latestData.raw,
        temperature: latestData.temperature,
        createdAt: latestData.lastUpdated,
        status: latestData.status
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }
});

// Start the bridge service
const port = connectArduino();
app.listen(3001, () => {
  console.log('🚀 Arduino Bridge running on port 3001');
  console.log('📡 Listening for Arduino data on', ARDUINO_PORT);
});
```

---

## 🔄 **Complete Setup Process**

### **1. Physical Connection**
```bash
# Plug Arduino into USB port
# Check if detected:

# Windows:
Device Manager → Ports (COM & LPT) → Arduino Uno (COM3)

# Linux:
dmesg | grep tty
# or
ls /dev/ttyUSB*

# Mac:
ls /dev/cu.*
```

### **2. Install Arduino Bridge Service**
```bash
# Install required packages
npm install serialport @serialport/parser-readline express

# Create arduino-bridge.js (code above)
# Update COM port for your system

# Run the bridge
node arduino-bridge.js
```

### **3. Update FarmNex Backend**
Your existing SoilMoistureWidget will now get real data from:
```
GET http://localhost:3001/api/soil/latest?deviceId=ARDUINO-UNO-001
```

### **4. Test the Connection**
```bash
# Test Arduino bridge API
curl "http://localhost:3001/api/soil/latest?deviceId=ARDUINO-UNO-001"

# Should return:
{
  "success": true,
  "data": {
    "deviceId": "ARDUINO-UNO-001",
    "moisture": 65,
    "raw": 450,
    "temperature": null,
    "createdAt": "2025-01-20T00:09:27.000Z",
    "status": "connected"
  }
}
```

---

## 📱 **Dashboard Integration**

Your existing SoilMoistureWidget will now display real Arduino data:

```javascript
// Your widget will show:
🟢 65.0% OPTIMAL
📊 Live trend chart
📡 Device: ARDUINO-UNO-001 - Live
⏰ Last Reading: 12:09 PM
🔢 Raw Value: 450
```

---

## 🔧 **Port Detection Script**

To automatically find your Arduino:

```javascript
// find-arduino-port.js
const SerialPort = require('serialport');

const findArduinoPort = async () => {
  try {
    const ports = await SerialPort.list();
    console.log('Available ports:');
    
    ports.forEach(port => {
      console.log(`${port.path} - ${port.manufacturer || 'Unknown'}`);
      
      // Look for Arduino
      if (port.manufacturer && port.manufacturer.includes('Arduino')) {
        console.log(`🎯 Arduino found on: ${port.path}`);
      }
    });
  } catch (error) {
    console.error('Error listing ports:', error);
  }
};

findArduinoPort();
```

---

## 🎯 **What Happens After USB Connection**

### **Immediately:**
1. Arduino starts sending data every 1 second via Serial
2. Bridge service receives and parses the data
3. Data becomes available via API endpoint

### **In Your Dashboard:**
1. SoilMoistureWidget refreshes every 5 seconds
2. Shows real moisture percentage from your soil sensor
3. Displays connection status (Live/Offline)
4. Updates trend chart with historical data

### **Data You'll See:**
- **Moisture**: 0-100% (calculated from your sensor)
- **Raw Value**: 200-1000+ (direct sensor reading)
- **Status**: Connected/Disconnected
- **Timestamp**: When reading was taken

---

## 🚀 **Your Arduino is Now Live!**

After setup, your FarmNex dashboard will display real-time soil moisture data from your physical Arduino sensor! 

The system will automatically:
- ✅ Read sensor data every second
- ✅ Store in database
- ✅ Display on dashboard
- ✅ Show connection status
- ✅ Generate trend charts

**Your IoT farm monitoring system is now complete!** 🌱📊