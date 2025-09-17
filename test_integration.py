#!/usr/bin/env python3
"""
FarmNex Arduino Integration Test
Complete test of Arduino Uno + Serial Bridge + API integration
"""

import serial
import requests
import time
import json
import sys
from concurrent.futures import ThreadPoolExecutor
import subprocess

def test_arduino_connection():
    """Test direct Arduino connection"""
    print("🔌 Testing Arduino Uno Connection...")
    try:
        ser = serial.Serial('COM4', 9600, timeout=2)
        time.sleep(2)
        
        # Look for data in 5 seconds
        start = time.time()
        while (time.time() - start) < 5:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                if line:
                    print(f"✅ Arduino responding: {line[:50]}...")
                    ser.close()
                    return True
            time.sleep(0.1)
        
        ser.close()
        return False
        
    except Exception as e:
        print(f"❌ Arduino connection failed: {e}")
        return False

def test_backend_api():
    """Test backend API availability"""
    print("🌐 Testing Backend API...")
    try:
        response = requests.get('http://localhost:3000/api/soil/devices', timeout=5)
        if response.status_code == 200:
            print("✅ Backend API is running")
            return True
        else:
            print(f"⚠️ Backend API returned: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend API not running - start with 'npm start'")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_api_endpoint():
    """Test specific IoT endpoint"""
    print("📡 Testing IoT Endpoint...")
    try:
        # Test data
        test_payload = {
            "deviceId": "ARDUINO-UNO-001", 
            "moisture": 42.5,
            "raw": 512
        }
        
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': 'your-secure-iot-api-key-123456'
        }
        
        response = requests.post(
            'http://localhost:3000/api/iot/soil',
            json=test_payload,
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ IoT endpoint working")
            print(f"   📊 Test reading ID: {result.get('data', {}).get('id', 'N/A')}")
            return True
        else:
            print(f"❌ IoT endpoint error: {response.status_code}")
            try:
                error = response.json()
                print(f"   Details: {error.get('message', 'Unknown error')}")
            except:
                pass
            return False
            
    except Exception as e:
        print(f"❌ IoT endpoint test failed: {e}")
        return False

def check_processes():
    """Check if required processes are running"""
    print("🔍 Checking Running Processes...")
    
    # Check for Node.js processes
    try:
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq node.exe'], 
                              capture_output=True, text=True, shell=True)
        node_processes = result.stdout.count('node.exe')
        
        if node_processes > 0:
            print(f"✅ Found {node_processes} Node.js process(es)")
        else:
            print("⚠️ No Node.js processes found - backend may not be running")
            
    except Exception as e:
        print(f"⚠️ Could not check processes: {e}")

def run_full_integration_test():
    """Run complete integration test"""
    print("🚀 FarmNex Arduino Integration Test")
    print("="*50)
    
    results = {
        'arduino': test_arduino_connection(),
        'api': test_backend_api(),
        'iot_endpoint': False,
        'processes': True
    }
    
    check_processes()
    
    if results['api']:
        results['iot_endpoint'] = test_api_endpoint()
    
    print("\n" + "="*50)
    print("📋 INTEGRATION TEST RESULTS")
    print("="*50)
    
    status_icon = lambda x: "✅" if x else "❌"
    
    print(f"{status_icon(results['arduino'])} Arduino Uno Connection")
    print(f"{status_icon(results['api'])} Backend API Server")
    print(f"{status_icon(results['iot_endpoint'])} IoT Data Endpoint")
    
    all_passed = all(results.values())
    
    print("\n" + "="*50)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("Your Arduino integration is ready!")
        print("\n📋 Next Steps:")
        print("1. Upload Arduino code to your board")
        print("2. Run: npm run arduino-bridge")
        print("3. Connect soil moisture sensor to A0")
        print("4. Watch data flow into your dashboard!")
    else:
        print("⚠️  SOME TESTS FAILED")
        print("\n🔧 Required Actions:")
        
        if not results['arduino']:
            print("- Upload Arduino code to COM4")
            print("- Check USB connection")
            print("- Verify Arduino IDE port settings")
            
        if not results['api']:
            print("- Start backend: cd backend && npm start")
            print("- Check MongoDB connection")
            
        if not results['iot_endpoint']:
            print("- Verify IOT_API_KEY in .env file")
            print("- Check API authentication")
    
    print("\n📖 Full documentation: ARDUINO_INTEGRATION.md")
    return all_passed

if __name__ == "__main__":
    try:
        import serial
        import requests
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Install with: pip install pyserial requests")
        sys.exit(1)
    
    success = run_full_integration_test()
    sys.exit(0 if success else 1)
