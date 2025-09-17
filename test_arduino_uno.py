#!/usr/bin/env python3
"""
Test Arduino Uno Soil Moisture Sensor
Monitors COM4 at 9600 baud for Arduino Uno data
"""

import serial
import time
import sys

def test_arduino_uno():
    """Test Arduino Uno soil moisture sensor"""
    port = "COM4"
    baudrate = 9600  # Arduino Uno standard baud rate
    timeout = 30  # seconds
    
    print(f"Testing Arduino Uno on {port} at {baudrate} baud...")
    print("=" * 50)
    
    try:
        # Open serial connection
        ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(2)  # Give time for connection to establish
        
        print(f"Connected to {port}")
        print("Listening for Arduino Uno data...")
        print("Expected: Moisture readings, LED status")
        print("Press Ctrl+C to stop")
        print("-" * 50)
        
        start_time = time.time()
        data_received = False
        moisture_readings = []
        
        while (time.time() - start_time) < timeout:
            if ser.in_waiting > 0:
                try:
                    # Read line from serial
                    line = ser.readline().decode('utf-8').strip()
                    
                    if line:
                        data_received = True
                        timestamp = time.strftime('%H:%M:%S')
                        print(f"[{timestamp}] {line}")
                        
                        # Parse moisture readings
                        if "Moisture:" in line and "%" in line:
                            try:
                                # Extract moisture percentage
                                moisture_part = line.split("Moisture:")[1].strip()
                                moisture_value = int(moisture_part.replace("%", ""))
                                moisture_readings.append(moisture_value)
                                print(f"  -> 📊 Moisture Level: {moisture_value}%")
                            except:
                                pass
                                
                        # Status indicators
                        if "wet enough" in line.lower():
                            print("  -> 🟢 Status: Soil is adequately moist")
                        elif "too dry" in line.lower():
                            print("  -> 🔴 Status: Soil needs watering!")
                        
                except UnicodeDecodeError:
                    print("  -> Received non-UTF8 data")
                    
            time.sleep(0.1)
        
        ser.close()
        
        # Results summary
        print("\n" + "=" * 50)
        if data_received:
            print("✅ SUCCESS: Arduino Uno is working!")
            print(f"   📡 Serial communication: OK")
            if moisture_readings:
                avg_moisture = sum(moisture_readings) / len(moisture_readings)
                print(f"   💧 Average moisture: {avg_moisture:.1f}%")
                print(f"   📈 Readings count: {len(moisture_readings)}")
                print(f"   🌱 Moisture range: {min(moisture_readings)}% - {max(moisture_readings)}%")
            
            print("\n🔧 Hardware Status Check:")
            print("   - LCD Display: Should show moisture percentage")
            print("   - Green LED (Pin 7): ON when moisture > 40%")  
            print("   - Red LED (Pin 8): ON when moisture ≤ 40%")
            print("   - Soil Sensor (A0): Connected and reading")
        else:
            print("⚠️  No data received from Arduino Uno")
            print("Possible issues:")
            print("   - Arduino code not uploaded")
            print("   - Wrong baud rate (should be 9600)")
            print("   - Arduino not powered/connected")
            print("   - I2C LCD not connected (address 0x27)")
            
    except serial.SerialException as e:
        print(f"❌ Serial connection error: {e}")
        print("Check:")
        print("  - Arduino Uno connected to COM4")
        print("  - Correct drivers installed")
        print("  - No other programs using COM4")
        return False
    except KeyboardInterrupt:
        print("\n\nStopped by user")
        if 'ser' in locals() and ser.is_open:
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
    
    print("🔌 Arduino Uno Soil Moisture Sensor Test")
    print("Hardware Expected:")
    print("  - Arduino Uno on COM4")
    print("  - Soil moisture sensor on pin A0")
    print("  - Green LED on pin 7")
    print("  - Red LED on pin 8") 
    print("  - I2C LCD display (0x27)")
    print("")
    
    success = test_arduino_uno()
    sys.exit(0 if success else 1)
