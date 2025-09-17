#!/usr/bin/env python3
"""
Test ESP32 Serial Communication
Simple script to monitor COM4 for ESP32 soil moisture sensor data
"""

import serial
import time
import json
import sys

def test_esp32_serial():
    """Test serial communication with ESP32"""
    port = "COM4"
    baudrate = 115200
    timeout = 20  # seconds
    
    print(f"Testing ESP32 on {port} at {baudrate} baud...")
    print("=" * 50)
    
    try:
        # Open serial connection
        ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(2)  # Give time for connection to establish
        
        print(f"Connected to {port}")
        print("Listening for data...")
        print("Press Ctrl+C to stop")
        print("-" * 50)
        
        start_time = time.time()
        data_received = False
        
        while (time.time() - start_time) < timeout:
            if ser.in_waiting > 0:
                try:
                    # Read line from serial
                    line = ser.readline().decode('utf-8').strip()
                    
                    if line:
                        data_received = True
                        print(f"[{time.strftime('%H:%M:%S')}] {line}")
                        
                        # Try to parse JSON data
                        if line.startswith('{') and line.endswith('}'):
                            try:
                                data = json.loads(line)
                                print(f"  -> Parsed JSON: Device={data.get('deviceId', 'N/A')}, "
                                     f"Moisture={data.get('moisture', 'N/A')}%, "
                                     f"Raw={data.get('raw', 'N/A')}")
                            except json.JSONDecodeError:
                                print("  -> Invalid JSON format")
                        
                except UnicodeDecodeError:
                    print("  -> Received non-UTF8 data")
                    
            time.sleep(0.1)
        
        ser.close()
        
        if data_received:
            print("\n" + "=" * 50)
            print("✅ SUCCESS: ESP32 is working and sending data!")
        else:
            print("\n" + "=" * 50)
            print("⚠️  No data received. Possible issues:")
            print("   - ESP32 code not uploaded")
            print("   - Wrong baud rate")
            print("   - Sensor not connected")
            print("   - ESP32 not powered/reset")
            
    except serial.SerialException as e:
        print(f"❌ Serial connection error: {e}")
        return False
    except KeyboardInterrupt:
        print("\n\nStopped by user")
        ser.close()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return data_received

if __name__ == "__main__":
    # Check if pyserial is available
    try:
        import serial
    except ImportError:
        print("❌ Error: pyserial not installed")
        print("Install with: pip install pyserial")
        sys.exit(1)
    
    success = test_esp32_serial()
    sys.exit(0 if success else 1)
