import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const SERIAL_PORT = process.env.ARDUINO_SERIAL_PORT || 'COM4';
const BAUD_RATE = 9600;
const API_URL = process.env.API_URL || 'http://localhost:3000';
const IOT_API_KEY = process.env.IOT_API_KEY;
const DEVICE_ID = process.env.ARDUINO_DEVICE_ID || 'ARDUINO-UNO-001';

// Reconnection settings
const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 999; // Essentially unlimited
let reconnectAttempts = 0;
let isConnected = false;
let port = null;
let parser = null;

console.log('🌱 FarmNex Auto-Reconnecting Soil Monitor Starting...');
console.log('🔄 This will automatically reconnect when Arduino is unplugged/replugged');
console.log(`📡 Target Arduino port: ${SERIAL_PORT}`);
console.log(`🆔 Device ID: ${DEVICE_ID}`);
console.log('');

// Validate API key
if (!IOT_API_KEY) {
  console.error('❌ IOT_API_KEY not set in environment variables');
  console.log('💡 Add to your .env file: IOT_API_KEY=your-secret-key-here');
  process.exit(1);
}

// Connection function
async function connectToArduino() {
  try {
    console.log(`🔌 Attempting to connect to Arduino on ${SERIAL_PORT}...`);
    
    // Create new serial port instance
    port = new SerialPort({
      path: SERIAL_PORT,
      baudRate: BAUD_RATE,
      autoOpen: false
    });

    // Create new parser
    parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    // Setup event handlers
    setupEventHandlers();

    // Attempt to open the port
    await openPort();

  } catch (error) {
    handleConnectionError(error);
  }
}

// Promise wrapper for port.open()
function openPort() {
  return new Promise((resolve, reject) => {
    port.open((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Setup all event handlers
function setupEventHandlers() {
  // Port opened successfully
  port.on('open', () => {
    isConnected = true;
    reconnectAttempts = 0;
    console.log('✅ Arduino connected successfully!');
    console.log('📊 Monitoring soil moisture data...');
    console.log('🔄 Will auto-reconnect if USB is unplugged');
    console.log('');
  });

  // Port closed/disconnected
  port.on('close', () => {
    if (isConnected) {
      console.log('🔌 Arduino USB disconnected');
      isConnected = false;
      scheduleReconnect();
    }
  });

  // Port error
  port.on('error', (err) => {
    console.error('❌ Serial port error:', err.message);
    isConnected = false;
    
    if (err.message.includes('cannot open') || err.message.includes('Access denied')) {
      console.log('💡 Arduino might be unplugged or in use by another program');
    }
    
    scheduleReconnect();
  });

  // Data received
  parser.on('data', async (line) => {
    await processArduinoData(line.toString().trim());
  });
}

// Handle connection errors
function handleConnectionError(error) {
  console.error('❌ Failed to connect:', error.message);
  
  if (error.message.includes('cannot open')) {
    console.log('💡 Troubleshooting:');
    console.log('   • Arduino may not be plugged in');
    console.log('   • Check USB cable connection');
    console.log('   • Close Arduino IDE if open');
    console.log('   • Try different USB port');
  }
  
  scheduleReconnect();
}

// Schedule reconnection attempt
function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('❌ Maximum reconnection attempts reached. Exiting...');
    process.exit(1);
  }
  
  reconnectAttempts++;
  
  console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY/1000} seconds...`);
  
  setTimeout(() => {
    connectToArduino();
  }, RECONNECT_DELAY);
}

// Process Arduino data (same as original)
async function processArduinoData(data) {
  if (!data) return;
  
  console.log('📥 Raw data:', data);
  
  try {
    let moistureValue = null;
    let rawValue = null;
    let status = null;
    
    // Try to parse as JSON first
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
    
    // Parse Arduino debug format: "Raw Sensor: 1022 | Constrained: 800 | Moisture: 0%"
    else if (data.includes('Raw Sensor:') && data.includes('Moisture:')) {
      const rawMatch = data.match(/Raw Sensor:\s*(\d+)/);
      const moistureMatch = data.match(/Moisture:\s*(\d+(?:\.\d+)?)%/);
      
      if (rawMatch && moistureMatch) {
        rawValue = parseInt(rawMatch[1]);
        moistureValue = parseFloat(moistureMatch[1]);
      }
    }
    
    // Parse simple format: "Raw Sensor Value: 512 | Moisture: 45%"
    else if (data.includes('Raw Sensor Value:') && data.includes('Moisture:')) {
      const rawMatch = data.match(/Raw Sensor Value:\s*(\d+)/);
      const moistureMatch = data.match(/Moisture:\s*(\d+(?:\.\d+)?)%/);
      
      if (rawMatch && moistureMatch) {
        rawValue = parseInt(rawMatch[1]);
        moistureValue = parseFloat(moistureMatch[1]);
      }
    }
    
    // Parse status messages
    else if (data.includes('Status:')) {
      if (data.includes('wet enough') || data.includes('SOIL WET')) {
        status = 'optimal';
        console.log('  -> 🟢 Status: Soil adequately moist');
      } else if (data.includes('too dry') || data.includes('SOIL DRY')) {
        status = 'dry';
        console.log('  -> 🔴 Status: Soil needs watering');
      }
      return; // Don't post status-only messages
    }
    
    // Handle info messages
    else if (data.includes('Starting') || data.includes('Setup complete') || 
             data.includes('Classification:') || data.includes('Level:') ||
             data.includes('Arduino Soil Moisture Sensor Debug') ||
             data.includes('Hardware check') || data.includes('LCD found') ||
             data.includes('Calibration') || data.includes('===') ||
             data.includes('---')) {
      console.log('  -> ℹ️  Arduino info:', data);
      return;
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
        moisture: Math.round(moistureValue * 10) / 10,
        ...(rawValue !== null && !isNaN(rawValue) && { raw: rawValue }),
        ...(status && { status })
      };
      
      console.log('📤 Sending to API:', JSON.stringify(payload, null, 2));
      
      // Post to API
      try {
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
      } catch (apiError) {
        console.error('❌ Failed to send data to API:', apiError.message);
        // Don't restart connection for API errors
      }
      
    } else {
      console.log('  -> 📝 Arduino message (no data extracted)');
    }
    
  } catch (error) {
    console.error('❌ Error processing data:', error.message);
  }
  
  console.log(''); // Add spacing
}

// Helper function for status emoji
function getStatusEmoji(moisture) {
  if (moisture < 30) return '🔴 DRY';
  if (moisture > 70) return '🔵 WET';
  return '🟢 OPTIMAL';
}

// Check if Arduino is available
async function checkArduinoAvailability() {
  try {
    const availablePorts = await SerialPort.list();
    const targetPort = availablePorts.find(port => 
      port.path === SERIAL_PORT || 
      port.path.includes('COM') || 
      port.manufacturer?.toLowerCase().includes('arduino')
    );
    
    if (targetPort) {
      console.log(`✅ Found potential Arduino port: ${targetPort.path}`);
      if (targetPort.manufacturer) {
        console.log(`   Manufacturer: ${targetPort.manufacturer}`);
      }
      return true;
    } else {
      console.log(`⚠️  No Arduino found on ${SERIAL_PORT}`);
      console.log('Available ports:');
      availablePorts.forEach(port => {
        console.log(`   ${port.path} - ${port.manufacturer || 'Unknown'}`);
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking ports:', error.message);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down soil monitor...');
  if (port && port.isOpen) {
    port.close(() => {
      console.log('✅ Serial port closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Periodic status update
setInterval(() => {
  if (isConnected && port && port.isOpen) {
    console.log(`💚 Soil monitor active - ${new Date().toLocaleTimeString()}`);
  } else {
    console.log(`⚠️  Soil monitor disconnected - attempting reconnection...`);
  }
}, 60000); // Every minute

// Start the connection process
console.log('🔍 Checking for Arduino...');
checkArduinoAvailability().then(() => {
  connectToArduino();
});