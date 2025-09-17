#!/usr/bin/env python3
"""
Send Test Data to FarmNex Dashboard
Simulates Arduino Uno soil moisture readings
"""

import requests
import time
import json

def send_test_reading(moisture, raw=None):
    """Send a test reading to the API"""
    
    payload = {
        "deviceId": "ARDUINO-UNO-001",
        "moisture": moisture
    }
    
    if raw is not None:
        payload["raw"] = raw
    
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-secure-iot-api-key-123456'
    }
    
    try:
        response = requests.post(
            'http://localhost:3000/api/iot/soil',
            json=payload,
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Sent: {moisture}% moisture (Raw: {raw}) - ID: {result.get('data', {}).get('id', 'N/A')}")
            return True
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to send data: {e}")
        return False

def main():
    print("🌱 Sending Test Data to FarmNex Dashboard")
    print("Device: ARDUINO-UNO-001")
    print("="*50)
    
    # Send several test readings with varying moisture levels
    test_readings = [
        (25, 800),   # Dry soil
        (35, 650),   # Getting dry
        (45, 500),   # Optimal
        (55, 400),   # Good moisture
        (38, 600),   # Needs attention
        (42, 520),   # Optimal
        (28, 750),   # Dry
        (52, 380),   # Well watered
    ]
    
    successful = 0
    
    for i, (moisture, raw) in enumerate(test_readings, 1):
        print(f"[{i}/8] ", end="")
        if send_test_reading(moisture, raw):
            successful += 1
        time.sleep(2)  # Space out readings
    
    print("\n" + "="*50)
    print(f"📊 Summary: {successful}/{len(test_readings)} readings sent successfully")
    
    if successful > 0:
        print("\n🎉 Test data sent! Check your dashboard:")
        print("   💧 You should now see soil moisture readings")
        print("   📈 History and statistics should be available")
        print("   🟢 Widget should show 'Live' status")
        print("\n🔗 Dashboard URL: http://localhost:3174/farmer-dashboard")
    else:
        print("\n⚠️  No data sent successfully")
        print("Check:")
        print("   - Backend server running (npm start)")
        print("   - Correct API_URL and IOT_API_KEY")
        
    return successful > 0

if __name__ == "__main__":
    try:
        import requests
    except ImportError:
        print("❌ Missing dependency: requests")
        print("Install with: pip install requests")
        exit(1)
    
    success = main()
    exit(0 if success else 1)
