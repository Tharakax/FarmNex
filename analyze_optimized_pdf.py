#!/usr/bin/env python3
"""
Analyze the newly generated optimized PDF to verify no blank pages
"""

import os
from PyPDF2 import PdfReader

def analyze_optimized_pdf():
    # Find the most recent optimized PDF
    downloads_dir = r"C:\Users\Win10\Downloads"
    
    # Look for the optimized PDF we just generated
    optimized_files = []
    for file in os.listdir(downloads_dir):
        if file.startswith("FarmNex_Training_OPTIMIZED") and file.endswith(".pdf"):
            full_path = os.path.join(downloads_dir, file)
            optimized_files.append((file, full_path, os.path.getmtime(full_path)))
    
    if not optimized_files:
        print("❌ No optimized PDF files found")
        return
    
    # Get the most recent optimized file
    latest_file = sorted(optimized_files, key=lambda x: x[2], reverse=True)[0]
    filename, filepath, _ = latest_file
    
    print("🔍 Analyzing Optimized PDF...")
    print("=" * 60)
    print(f"📁 File: {filename}")
    
    try:
        reader = PdfReader(filepath)
        total_pages = len(reader.pages)
        
        print(f"📄 Total pages: {total_pages}")
        print("\n📊 Page Analysis:")
        print("-" * 40)
        
        blank_pages = []
        content_pages = []
        
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            try:
                text = page.extract_text().strip()
                text_length = len(text)
                
                is_blank = text_length == 0 or (text_length < 50 and text.isspace())
                
                if is_blank:
                    blank_pages.append(page_num)
                    status = "BLANK"
                    icon = "❌"
                else:
                    content_pages.append(page_num)
                    status = "CONTENT" 
                    icon = "✅"
                
                print(f"Page {page_num:2d}: {icon} {status:7s} ({text_length:3d} chars)")
                
            except Exception as e:
                print(f"Page {page_num:2d}: ⚠️  ERROR   (Could not analyze)")
        
        print("-" * 40)
        print(f"📊 Summary:")
        print(f"   Total pages: {total_pages}")
        print(f"   Content pages: {len(content_pages)}")
        print(f"   Blank pages: {len(blank_pages)}")
        
        # File size
        file_size = os.path.getsize(filepath)
        print(f"   File size: {file_size} bytes ({file_size/1024:.2f} KB)")
        
        # Verdict
        print("\n🏆 VERDICT:")
        if len(blank_pages) == 0:
            print("✅ SUCCESS! No blank pages found in optimized PDF!")
            print("🎉 The backend optimization is working perfectly!")
        elif len(blank_pages) < total_pages * 0.2:  # Less than 20% blank
            print("⚠️  GOOD: Only a few blank pages detected")
            print(f"   Blank pages: {blank_pages}")
        else:
            print("❌ ISSUE: Still too many blank pages")
            print(f"   Blank pages: {blank_pages}")
            
        return len(blank_pages) == 0
        
    except Exception as e:
        print(f"❌ Error analyzing PDF: {e}")
        return False

if __name__ == "__main__":
    success = analyze_optimized_pdf()
    
    if success:
        print("\n🎉 OPTIMIZATION SUCCESSFUL!")
        print("The backend changes have eliminated blank pages!")
    else:
        print("\n🔧 May need further optimization...")