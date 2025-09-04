import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const SERIAL_PORT = process.env.ESP32_SERIAL_PORT || 'COM3'; // Change to your ESP32 port
const BAUD_RATE = 115200;
const API_URL = process.env.API_URL || 'http://localhost:3000';
const IOT_API_KEY = process.env.IOT_API_KEY;
const DEVICE_ID = process.env.DEVICE_ID || 'ESP32-SOIL-001';

// Validate configuration
if (!IOT_API_KEY) {
  console.error('❌ IOT_API_KEY not set in environment variables');
  process.exit(1);
}

console.log('🌱 Soil Moisture Serial Bridge Starting...');
console.log(`📡 Connecting to ESP32 on port: ${SERIAL_PORT}`);
console.log(`🚀 API URL: ${API_URL}`);
console.log(`🆔 Device ID: ${DEVICE_ID}`);

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
  console.log('📊 Waiting for soil moisture data...\n');
});

port.on('error', (err) => {
  console.error('❌ Serial port error:', err.message);
  
  // Common error handling
  if (err.message.includes('cannot open')) {
    console.log('\n💡 Troubleshooting tips:');
    console.log('   • Check ESP32 is plugged in via USB');
    console.log('   • Verify correct COM port (check Device Manager on Windows)');
    console.log('   • Close Arduino IDE serial monitor if open');
    console.log('   • Try different USB cable or port');
    console.log(`   • Update ESP32_SERIAL_PORT in .env file (currently: ${SERIAL_PORT})`);
  }
  
  setTimeout(() => {
    console.log('🔄 Retrying connection in 5 seconds...');
    connectSerial();
  }, 5000);
});

// Data parsing and API posting
parser.on('data', async (line) => {
  const data = line.toString().trim();
  
  // Skip empty lines or debug messages
  if (!data || data.startsWith('DEBUG:') || data.startsWith('INFO:')) {
    return;
  }
  
  console.log('📥 Raw data:', data);
  
  try {
    // Parse JSON data from ESP32
    const sensorData = JSON.parse(data);
    
    // Validate required fields
    if (typeof sensorData.moisture !== 'number' || sensorData.moisture < 0 || sensorData.moisture > 100) {
      console.log('⚠️  Invalid moisture value:', sensorData.moisture);
      return;
    }
    
    // Prepare payload for API
    const payload = {
      deviceId: DEVICE_ID,
      moisture: Math.round(sensorData.moisture * 10) / 10, // Round to 1 decimal
      ...(sensorData.raw && { raw: sensorData.raw }),
      ...(sensorData.temperature && { temperature: sensorData.temperature }),
      ...(sensorData.fieldId && { fieldId: sensorData.fieldId })
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
      const status = getStatusEmoji(payload.moisture);
      console.log(`✅ ${status} Data saved successfully!`);
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
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log('⚠️  Received non-JSON data:', data);
    } else {
      console.error('❌ Error processing data:', error.message);
    }
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
  console.log('\n🛑 Shutting down serial bridge...');
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
    console.log(`💚 Bridge active - listening on ${SERIAL_PORT}`);
  }
}, 30000); // Every 30 seconds
