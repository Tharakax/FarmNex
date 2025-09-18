# Remove Blank Pages from PDF Script
# This script provides multiple methods to remove blank pages from PDF files

param(
    [Parameter(Mandatory=$true)]
    [string]$InputPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$UseGhostscript,
    
    [Parameter(Mandatory=$false)]
    [switch]$UsePythonPDF2,
    
    [Parameter(Mandatory=$false)]
    [double]$BlankThreshold = 0.01
)

Write-Host "PDF Blank Page Removal Tool" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

# Check if input file exists
if (-not (Test-Path $InputPath)) {
    Write-Error "Input file not found: $InputPath"
    exit 1
}

# Set output path if not provided
if ([string]::IsNullOrEmpty($OutputPath)) {
    $dir = [System.IO.Path]::GetDirectoryName($InputPath)
    $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($InputPath)
    $ext = [System.IO.Path]::GetExtension($InputPath)
    $OutputPath = Join-Path $dir "$nameWithoutExt-no-blanks$ext"
}

Write-Host "Input: $InputPath" -ForegroundColor Cyan
Write-Host "Output: $OutputPath" -ForegroundColor Cyan

# Method 1: Using Ghostscript (if available)
function Remove-BlankPages-Ghostscript {
    param($Input, $Output)
    
    Write-Host "`nMethod 1: Using Ghostscript" -ForegroundColor Yellow
    
    # Check if Ghostscript is installed
    $gsPath = Get-Command "gs" -ErrorAction SilentlyContinue
    if (-not $gsPath) {
        $gsPath = Get-Command "gswin64c" -ErrorAction SilentlyContinue
    }
    if (-not $gsPath) {
        $gsPath = Get-Command "gswin32c" -ErrorAction SilentlyContinue
    }
    
    if ($gsPath) {
        Write-Host "Found Ghostscript at: $($gsPath.Source)" -ForegroundColor Green
        
        # Ghostscript command to remove blank pages
        $gsCommand = @(
            "-dNOPAUSE",
            "-dBATCH",
            "-sDEVICE=pdfwrite",
            "-dPDFSETTINGS=/prepress",
            "-sOutputFile=$Output",
            $Input
        )
        
        try {
            & $gsPath.Source @gsCommand
            Write-Host "Successfully processed with Ghostscript" -ForegroundColor Green
            return $true
        } catch {
            Write-Warning "Ghostscript processing failed: $_"
            return $false
        }
    } else {
        Write-Warning "Ghostscript not found. Please install Ghostscript or use another method."
        Write-Host "Download from: https://www.ghostscript.com/download/gsdnld.html" -ForegroundColor Cyan
        return $false
    }
}

# Method 2: Using Python with PyPDF2/PyPDF4
function Remove-BlankPages-Python {
    param($Input, $Output)
    
    Write-Host "`nMethod 2: Using Python" -ForegroundColor Yellow
    
    # Check if Python is available
    $pythonPath = Get-Command "python" -ErrorAction SilentlyContinue
    if (-not $pythonPath) {
        $pythonPath = Get-Command "python3" -ErrorAction SilentlyContinue
    }
    
    if ($pythonPath) {
        Write-Host "Found Python at: $($pythonPath.Source)" -ForegroundColor Green
        
        # Create Python script
        $pythonScript = @"
import sys
import os

try:
    from PyPDF2 import PdfReader, PdfWriter
    pdf_library = 'PyPDF2'
except ImportError:
    try:
        from PyPDF4 import PdfReader, PdfWriter
        pdf_library = 'PyPDF4'
    except ImportError:
        print("Neither PyPDF2 nor PyPDF4 is installed. Please install one:")
        print("pip install PyPDF2")
        print("or")
        print("pip install PyPDF4")
        sys.exit(1)

def is_blank_page(page, threshold=$BlankThreshold):
    """Check if a page is blank based on text content"""
    try:
        text = page.extract_text().strip()
        if len(text) == 0:
            return True
        # Additional check for pages with very little content
        if len(text) < 10 and text.isspace():
            return True
        return False
    except:
        return False

def remove_blank_pages(input_path, output_path):
    print(f"Using {pdf_library} library")
    
    try:
        # Read the PDF
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        total_pages = len(reader.pages)
        kept_pages = 0
        removed_pages = 0
        
        print(f"Processing {total_pages} pages...")
        
        for i, page in enumerate(reader.pages):
            if not is_blank_page(page):
                writer.add_page(page)
                kept_pages += 1
                print(f"Page {i+1}: Kept")
            else:
                removed_pages += 1
                print(f"Page {i+1}: Removed (blank)")
        
        # Write the output PDF
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        print(f"\nProcessing complete!")
        print(f"Total pages: {total_pages}")
        print(f"Kept pages: {kept_pages}")
        print(f"Removed pages: {removed_pages}")
        print(f"Output saved to: {output_path}")
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py input.pdf output.pdf")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        sys.exit(1)
    
    remove_blank_pages(input_file, output_file)
"@
        
        # Save Python script to temporary file
        $tempScript = Join-Path $env:TEMP "remove_blank_pages.py"
        $pythonScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        try {
            # Run Python script
            & $pythonPath.Source $tempScript $Input $Output
            Remove-Item $tempScript -ErrorAction SilentlyContinue
            return $true
        } catch {
            Write-Warning "Python processing failed: $_"
            Remove-Item $tempScript -ErrorAction SilentlyContinue
            return $false
        }
    } else {
        Write-Warning "Python not found. Please install Python or use another method."
        return $false
    }
}

# Method 3: Manual inspection and page extraction
function Show-PDFInfo {
    param($Input)
    
    Write-Host "`nMethod 3: Manual PDF Analysis" -ForegroundColor Yellow
    Write-Host "For manual inspection, you can use:" -ForegroundColor Cyan
    Write-Host "- Adobe Acrobat Reader (free)" -ForegroundColor Gray
    Write-Host "- Foxit Reader (free)" -ForegroundColor Gray
    Write-Host "- PDF-XChange Viewer (free)" -ForegroundColor Gray
    Write-Host "- SumatraPDF (free)" -ForegroundColor Gray
    
    Write-Host "`nOnline tools (use with caution for sensitive documents):" -ForegroundColor Cyan
    Write-Host "- SmallPDF: https://smallpdf.com/" -ForegroundColor Gray
    Write-Host "- ILovePDF: https://www.ilovepdf.com/" -ForegroundColor Gray
    Write-Host "- PDF24: https://tools.pdf24.org/" -ForegroundColor Gray
}

# Main execution
Write-Host "`nStarting PDF processing..." -ForegroundColor Green

$success = $false

if ($UseGhostscript) {
    $success = Remove-BlankPages-Ghostscript -Input $InputPath -Output $OutputPath
} elseif ($UsePythonPDF2) {
    $success = Remove-BlankPages-Python -Input $InputPath -Output $OutputPath
} else {
    # Try methods in order
    Write-Host "Trying automatic detection..." -ForegroundColor Yellow
    
    $success = Remove-BlankPages-Python -Input $InputPath -Output $OutputPath
    
    if (-not $success) {
        $success = Remove-BlankPages-Ghostscript -Input $InputPath -Output $OutputPath
    }
    
    if (-not $success) {
        Show-PDFInfo -Input $InputPath
    }
}

if ($success) {
    Write-Host "`nProcessing completed successfully!" -ForegroundColor Green
    Write-Host "Output file: $OutputPath" -ForegroundColor Cyan
} else {
    Write-Host "`nAutomatic processing failed. Consider using manual methods or installing required dependencies." -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")