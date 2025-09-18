#!/usr/bin/env python3
"""
Simple script to remove pages 2 and 3 from a PDF file
"""

import sys
import os
from PyPDF2 import PdfReader, PdfWriter

def remove_pages_2_and_3(input_path, output_path):
    """Remove pages 2 and 3 from the PDF"""
    
    print(f"Input file: {input_path}")
    print(f"Output file: {output_path}")
    
    try:
        # Read the PDF
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        total_pages = len(reader.pages)
        print(f"Total pages in document: {total_pages}")
        
        if total_pages < 3:
            print("Error: Document has fewer than 3 pages. Cannot remove pages 2 and 3.")
            return False
        
        print("Processing pages...")
        print("Pages to remove: 2, 3")
        
        # Add all pages except pages 2 and 3 (which are indices 1 and 2)
        pages_to_remove = [1, 2]  # 0-indexed
        kept_pages = 0
        removed_pages = 0
        
        for i, page in enumerate(reader.pages):
            if i not in pages_to_remove:
                writer.add_page(page)
                kept_pages += 1
                print(f"Page {i+1}: Kept")
            else:
                removed_pages += 1
                print(f"Page {i+1}: Removed")
        
        # Write the output PDF
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        print(f"\n✅ Processing complete!")
        print(f"Total pages: {total_pages}")
        print(f"Kept pages: {kept_pages}")
        print(f"Removed pages: {removed_pages}")
        print(f"Output saved to: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing PDF: {e}")
        return False

if __name__ == "__main__":
    # Define input and output paths - Updated for latest file
    input_file = r"C:\Users\Win10\Downloads\Training_Materials_Report_2025-09-18 (8).pdf"
    output_file = r"C:\Users\Win10\Downloads\Training_Materials_Report_2025-09-18 (8)_pages_2_3_removed.pdf"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Error: Input file '{input_file}' not found.")
        
        # List available training material PDFs
        downloads_dir = r"C:\Users\Win10\Downloads"
        print("\nAvailable training material PDFs:")
        for file in os.listdir(downloads_dir):
            if file.startswith("Training_Materials_Report") and file.endswith(".pdf"):
                print(f"  - {file}")
        sys.exit(1)
    
    # Process the PDF
    success = remove_pages_2_and_3(input_file, output_file)
    
    if success:
        # Show file size comparison
        original_size = os.path.getsize(input_file)
        new_size = os.path.getsize(output_file)
        saved_bytes = original_size - new_size
        
        print(f"\n📊 File size comparison:")
        print(f"Original: {original_size/1024:.2f} KB")
        print(f"New: {new_size/1024:.2f} KB")
        print(f"Saved: {saved_bytes/1024:.2f} KB")
        
        print(f"\n🎉 Successfully removed blank pages 2 and 3!")
        print(f"📁 New file location: {output_file}")
    else:
        print(f"\n❌ Failed to process the PDF file.")
        sys.exit(1)