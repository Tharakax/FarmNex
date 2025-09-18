#!/usr/bin/env python3
"""
Test script to generate PDF from the optimized backend endpoint
"""

import requests
import os
from datetime import datetime

def test_pdf_generation():
    print("🧪 Testing Optimized PDF Generation...")
    print("=" * 50)
    
    # Backend endpoint
    url = "http://localhost:3000/api/training/export/pdf"
    
    try:
        print("📡 Making request to backend...")
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            print("✅ Request successful!")
            
            # Save the PDF
            timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
            filename = f"C:\\Users\\Win10\\Downloads\\FarmNex_Training_OPTIMIZED_{timestamp}.pdf"
            
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            file_size = len(response.content)
            
            print(f"📁 PDF saved to: {filename}")
            print(f"📊 File size: {file_size} bytes ({file_size/1024:.2f} KB)")
            
            # Quick analysis of the file
            if file_size > 0:
                print("✅ PDF generated successfully with optimized backend!")
                print("🔍 This should be a compact PDF with no blank pages")
                return True
            else:
                print("❌ PDF file is empty")
                return False
                
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("💡 Make sure the backend server is running on port 3000")
        return False
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_pdf_generation()
    
    if success:
        print("\n🎉 SUCCESS! The optimized PDF generation is working!")
        print("📋 Next steps:")
        print("   1. Open the generated PDF")
        print("   2. Verify it has no blank pages")
        print("   3. Check that all content is properly formatted")
    else:
        print("\n❌ Test failed. Please check the backend server and try again.")