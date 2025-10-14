import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configuration for Arduino Uno
const SERIAL_PORT = process.env.ARDUINO_SERIAL_PORT || 'COM11'; // Arduino Uno port
const BAUD_RATE = 9600; // Arduino Uno baud rate
const API_URL = process.env.API_URL || 'http://localhost:3000';
const IOT_API_KEY = process.env.IOT_API_KEY;
const DEVICE_ID = process.env.ARDUINO_DEVICE_ID || 'ARDUINO-UNO-001';

// Validate configuration
if (!IOT_API_KEY) {
  console.error('❌ IOT_API_KEY not set in environment variables');
  console.log('💡 Add to your .env file: IOT_API_KEY=your-secret-key-here');
  process.exit(1);
}

console.log('🌱 Arduino Uno Soil Moisture Serial Bridge Starting...');
console.log(`📡 Connecting to Arduino on port: ${SERIAL_PORT}`);
console.log(`🔧 Baud rate: ${BAUD_RATE}`);
console.log(`🚀 API URL: ${API_URL}`);
console.log(`🆔 Device ID: ${DEVICE_ID}`);
console.log('');

// Initialize serial port
const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
  autoOpen: false
});

// Parser for line-by-line reading
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Connection handlers
port.on('open', () => {
  console.log('✅ Serial port connected successfully');
  console.log('📊 Waiting for Arduino soil moisture data...');
  console.log('🔍 Listening for both JSON and text data formats');
  console.log('');
});

port.on('error', (err) => {
  console.error('❌ Serial port error:', err.message);
  
  // Common error handling
  if (err.message.includes('cannot open')) {
    console.log('\\n💡 Troubleshooting tips:');
    console.log('   • Check Arduino Uno is plugged in via USB');
    console.log('   • Verify correct COM port (check Device Manager on Windows)');
    console.log('   • Close Arduino IDE serial monitor if open');
    console.log('   • Try different USB cable or port');
    console.log(`   • Update ARDUINO_SERIAL_PORT in .env file (currently: ${SERIAL_PORT})`);
    console.log('   • Ensure Arduino code is uploaded with Serial.begin(9600)');
  }
  
  setTimeout(() => {
    console.log('🔄 Retrying connection in 5 seconds...');
    connectSerial();
  }, 5000);
});

// Data parsing and API posting
parser.on('data', async (line) => {
  const data = line.toString().trim();
  
  // Skip empty lines
  if (!data) return;
  
  console.log('📥 Raw data:', data);
  
  try {
    let moistureValue = null;
    let rawValue = null;
    let status = null;
    
    // Try to parse as JSON first (if Arduino sends JSON)
    if (data.startsWith('{') && data.endsWith('}')) {
      try {
        const jsonData = JSON.parse(data);
        moistureValue = jsonData.moisture;
        rawValue = jsonData.raw;
        status = jsonData.status;
      } catch (jsonError) {
        console.log('⚠️  Invalid JSON format');
      }
    }
    
    // Parse Arduino text format: "Raw Sensor Value: 512 | Moisture: 45%"
    else if (data.includes('Raw Sensor Value:') && data.includes('Moisture:')) {
      const rawMatch = data.match(/Raw Sensor Value:\s*(\d+)/);
      const moistureMatch = data.match(/Moisture:\s*(\d+(?:\.\d+)?)%/);
      
      if (rawMatch && moistureMatch) {
        rawValue = parseInt(rawMatch[1]);
        moistureValue = parseFloat(moistureMatch[1]);
      }
    }
    
    // Parse Arduino debug format: "Raw Sensor: 1022 | Constrained: 800 | Moisture: 0%"
    else if (data.includes('Raw Sensor:') && data.includes('Moisture:')) {
      const rawMatch = data.match(/Raw Sensor:\s*(\d+)/);
      const moistureMatch = data.match(/Moisture:\s*(\d+(?:\.\d+)?)%/);
      
      if (rawMatch && moistureMatch) {
        rawValue = parseInt(rawMatch[1]);
        moistureValue = parseFloat(moistureMatch[1]);
      }
    }
    
    // Parse status messages
    else if (data.includes('Status:')) {
      if (data.includes('wet enough')) {
        status = 'optimal';
        console.log('  -> 🟢 Status: Soil adequately moist');
      } else if (data.includes('too dry')) {
        status = 'dry';
        console.log('  -> 🔴 Status: Soil needs watering');
      }
      return; // Don't post status-only messages
    }
    
    // Handle startup and info messages
    else if (data.includes('Starting') || data.includes('Setup complete') || 
             data.includes('Classification:') || data.includes('Level:')) {
      console.log('  -> ℹ️  Arduino info:', data);
      return; // Don't post info messages
    }
    
    // If we extracted moisture data, send to API
    if (moistureValue !== null && !isNaN(moistureValue)) {
      // Validate moisture range
      if (moistureValue < 0 || moistureValue > 100) {
        console.log('⚠️  Invalid moisture value:', moistureValue);
        return;
      }
      
      // Prepare payload for API
      const payload = {
        deviceId: DEVICE_ID,
        moisture: Math.round(moistureValue * 10) / 10, // Round to 1 decimal
        ...(rawValue !== null && !isNaN(rawValue) && { raw: rawValue }),
        ...(status && { status })
      };
      
      console.log('📤 Sending to API:', JSON.stringify(payload, null, 2));
      
      // Post to API
      const response = await fetch(`${API_URL}/api/iot/soil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': IOT_API_KEY
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const statusEmoji = getStatusEmoji(payload.moisture);
        console.log(`✅ ${statusEmoji} Data saved successfully!`);
        console.log(`   💧 Moisture: ${payload.moisture}%`);
        console.log(`   🕒 Time: ${new Date().toLocaleTimeString()}`);
        
        if (result.data) {
          console.log(`   🆔 Reading ID: ${result.data.id}`);
        }
      } else {
        console.error('❌ API Error:', result.message || 'Unknown error');
        if (result.errors) {
          console.error('   Details:', result.errors);
        }
      }
      
    } else {
      console.log('  -> 📝 Arduino message (no data extracted)');
    }
    
  } catch (error) {
    console.error('❌ Error processing data:', error.message);
  }
  
  console.log(''); // Add spacing between readings
});

// Helper function for status emoji
function getStatusEmoji(moisture) {
  if (moisture < 30) return '🔴 DRY';
  if (moisture > 70) return '🔵 WET';
  return '🟢 OPTIMAL';
}

// Connection management
function connectSerial() {
  if (!port.isOpen) {
    port.open((err) => {
      if (err) {
        console.error('❌ Failed to open serial port:', err.message);
      }
    });
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down Arduino serial bridge...');
  if (port.isOpen) {
    port.close(() => {
      console.log('✅ Serial port closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Auto-reconnection on disconnect
port.on('close', () => {
  console.log('❌ Serial port disconnected');
  setTimeout(() => {
    console.log('🔄 Attempting to reconnect...');
    connectSerial();
  }, 3000);
});

// Start connection
connectSerial();

// Periodic connection status
setInterval(() => {
  if (port.isOpen) {
    console.log(`💚 Arduino bridge active - listening on ${SERIAL_PORT} at ${BAUD_RATE} baud`);
  }
}, 30000); // Every 30 seconds
