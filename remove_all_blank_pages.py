#!/usr/bin/env python3
"""
Enhanced script to automatically detect and remove all blank pages from a PDF
"""

import sys
import os
from PyPDF2 import PdfReader, PdfWriter
import re

def is_blank_page(page, threshold=50):
    """
    Determine if a page is blank based on text content
    
    Args:
        page: PDF page object
        threshold: Minimum character count to consider page non-blank
    
    Returns:
        bool: True if page appears blank, False otherwise
    """
    try:
        # Extract text from the page
        text = page.extract_text().strip()
        
        # Remove whitespace and newlines
        cleaned_text = re.sub(r'\s+', '', text)
        
        # Check various conditions for blank pages
        if len(cleaned_text) == 0:
            return True
        
        # Very short content might be just headers/footers
        if len(cleaned_text) < threshold:
            # Check if it's just common blank page indicators
            blank_indicators = [
                'page', 'blank', 'intentionally', 'left', 'empty',
                'this', 'is', 'a', 'blank', 'page'
            ]
            
            text_lower = text.lower()
            is_likely_blank = any(indicator in text_lower for indicator in blank_indicators)
            
            if is_likely_blank or len(cleaned_text) < 10:
                return True
        
        return False
        
    except Exception as e:
        print(f"Warning: Could not extract text from page. Assuming non-blank. Error: {e}")
        return False

def analyze_pdf_pages(input_path):
    """
    Analyze all pages in the PDF and identify blank pages
    
    Args:
        input_path: Path to input PDF file
        
    Returns:
        tuple: (total_pages, blank_pages_list, page_analysis)
    """
    try:
        reader = PdfReader(input_path)
        total_pages = len(reader.pages)
        blank_pages = []
        page_analysis = []
        
        print(f"📄 Analyzing {total_pages} pages for blank content...")
        print("=" * 50)
        
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            is_blank = is_blank_page(page)
            text_length = len(page.extract_text().strip())
            
            status = "BLANK" if is_blank else "CONTENT"
            page_info = {
                'page_num': page_num,
                'is_blank': is_blank,
                'text_length': text_length,
                'status': status
            }
            
            page_analysis.append(page_info)
            
            if is_blank:
                blank_pages.append(page_num)
                print(f"Page {page_num:2d}: {status:7s} (text length: {text_length:3d} chars)")
            else:
                print(f"Page {page_num:2d}: {status:7s} (text length: {text_length:3d} chars)")
        
        return total_pages, blank_pages, page_analysis
        
    except Exception as e:
        print(f"❌ Error analyzing PDF: {e}")
        return 0, [], []

def remove_blank_pages_auto(input_path, output_path):
    """
    Automatically detect and remove all blank pages from PDF
    
    Args:
        input_path: Path to input PDF file
        output_path: Path to output PDF file
        
    Returns:
        bool: True if successful, False otherwise
    """
    
    print(f"🔍 Auto-detecting blank pages in: {os.path.basename(input_path)}")
    print(f"📁 Output will be saved as: {os.path.basename(output_path)}")
    print()
    
    # First, analyze the PDF
    total_pages, blank_pages, page_analysis = analyze_pdf_pages(input_path)
    
    if total_pages == 0:
        return False
    
    print("=" * 50)
    print(f"📊 Analysis Summary:")
    print(f"   Total pages: {total_pages}")
    print(f"   Blank pages: {len(blank_pages)}")
    print(f"   Content pages: {total_pages - len(blank_pages)}")
    
    if len(blank_pages) == 0:
        print("✨ No blank pages detected! Your PDF is already clean.")
        return True
    
    print(f"🗑️  Blank pages to remove: {', '.join(map(str, blank_pages))}")
    print()
    
    try:
        # Process the PDF
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        kept_pages = 0
        removed_pages = 0
        
        print("🔄 Processing pages...")
        
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            
            if page_num not in blank_pages:
                writer.add_page(page)
                kept_pages += 1
                print(f"Page {page_num:2d}: ✅ Kept")
            else:
                removed_pages += 1
                print(f"Page {page_num:2d}: 🗑️  Removed (blank)")
        
        # Write the output PDF
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        print()
        print("=" * 50)
        print(f"✅ Processing complete!")
        print(f"📊 Results:")
        print(f"   Total pages processed: {total_pages}")
        print(f"   Pages kept: {kept_pages}")
        print(f"   Pages removed: {removed_pages}")
        print(f"   Final page count: {kept_pages}")
        print(f"📁 Output saved to: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing PDF: {e}")
        return False

def main():
    # Define input and output paths for the (6) version
    input_file = r"C:\Users\Win10\Downloads\Training_Materials_Report_2025-09-18 (6).pdf"
    output_file = r"C:\Users\Win10\Downloads\Training_Materials_Report_2025-09-18 (6)_cleaned.pdf"
    
    print("🚀 FarmNex Training Materials - Blank Page Remover")
    print("=" * 60)
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Error: Input file not found!")
        print(f"📍 Looking for: {input_file}")
        
        # List available training material PDFs
        downloads_dir = r"C:\Users\Win10\Downloads"
        print("\n📋 Available training material PDFs:")
        
        training_pdfs = []
        for file in os.listdir(downloads_dir):
            if file.startswith("Training_Materials_Report") and file.endswith(".pdf"):
                training_pdfs.append(file)
        
        if training_pdfs:
            training_pdfs.sort(reverse=True)  # Show newest first
            for idx, file in enumerate(training_pdfs, 1):
                file_path = os.path.join(downloads_dir, file)
                file_size = os.path.getsize(file_path) / 1024  # KB
                print(f"  {idx}. {file} ({file_size:.1f} KB)")
            
            # Use the first (newest) file if target not found
            fallback_file = os.path.join(downloads_dir, training_pdfs[0])
            print(f"\n🔄 Using most recent file: {training_pdfs[0]}")
            input_file = fallback_file
            output_file = fallback_file.replace(".pdf", "_cleaned.pdf")
        else:
            print("   No training material PDFs found!")
            sys.exit(1)
    
    # Process the PDF
    success = remove_blank_pages_auto(input_file, output_file)
    
    if success and os.path.exists(output_file):
        # Show file size comparison
        original_size = os.path.getsize(input_file)
        new_size = os.path.getsize(output_file)
        saved_bytes = original_size - new_size
        
        print()
        print("=" * 60)
        print(f"📊 File Size Comparison:")
        print(f"   Original: {original_size/1024:.2f} KB")
        print(f"   Cleaned:  {new_size/1024:.2f} KB")
        print(f"   Saved:    {saved_bytes/1024:.2f} KB ({saved_bytes/original_size*100:.1f}%)")
        
        print()
        print("🎉 SUCCESS! Your training materials report is now clean!")
        print(f"📁 Location: {output_file}")
        print()
        print("💡 Tips:")
        print("   • The original file is preserved as backup")
        print("   • Review the cleaned file to ensure all content is correct")
        print("   • You can now use the cleaned version for distribution")
        
    else:
        print()
        print("❌ Failed to process the PDF file.")
        print("🔧 Troubleshooting:")
        print("   • Ensure the PDF file is not corrupted")
        print("   • Check that the file is not password protected")
        print("   • Verify you have write permissions to the output location")
        sys.exit(1)

if __name__ == "__main__":
    main()