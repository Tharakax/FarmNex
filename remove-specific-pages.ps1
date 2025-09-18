# Remove Specific Pages from PDF Script
# This script removes specified pages from a PDF file

param(
    [Parameter(Mandatory=$true)]
    [string]$InputPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "",
    
    [Parameter(Mandatory=$true)]
    [int[]]$PagesToRemove = @(2, 3)
)

Write-Host "PDF Specific Page Removal Tool" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

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
    $OutputPath = Join-Path $dir "$nameWithoutExt-pages-removed$ext"
}

Write-Host "Input: $InputPath" -ForegroundColor Cyan
Write-Host "Output: $OutputPath" -ForegroundColor Cyan
Write-Host "Pages to remove: $($PagesToRemove -join ', ')" -ForegroundColor Yellow

# Function to remove specific pages using Python
function Remove-SpecificPages-Python {
    param($Input, $Output, $Pages)
    
    Write-Host "`nUsing Python to remove pages..." -ForegroundColor Yellow
    
    # Check if Python is available
    $pythonPath = Get-Command "python" -ErrorAction SilentlyContinue
    if (-not $pythonPath) {
        $pythonPath = Get-Command "python3" -ErrorAction SilentlyContinue
    }
    
    if ($pythonPath) {
        Write-Host "Found Python at: $($pythonPath.Source)" -ForegroundColor Green
        
        # Convert pages array to Python format (0-indexed)
        $pythonPages = ($Pages | ForEach-Object { $_ - 1 }) -join ','
        
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
        sys.exit(1)

def remove_specific_pages(input_path, output_path, pages_to_remove):
    print(f"Using {pdf_library} library")
    
    try:
        # Read the PDF
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        total_pages = len(reader.pages)
        kept_pages = 0
        removed_pages = 0
        
        print(f"Total pages in document: {total_pages}")
        print(f"Pages to remove: {[p+1 for p in pages_to_remove]}")
        print("Processing pages...")
        
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
        
        print(f"\nProcessing complete!")
        print(f"Total pages: {total_pages}")
        print(f"Kept pages: {kept_pages}")
        print(f"Removed pages: {removed_pages}")
        print(f"Output saved to: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py input.pdf output.pdf [pages_to_remove]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Parse pages to remove (0-indexed)
    pages_to_remove = []
    if len(sys.argv) > 3:
        try:
            pages_to_remove = [int(x) for x in sys.argv[3].split(',')]
        except ValueError:
            print("Error: Invalid page numbers")
            sys.exit(1)
    
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        sys.exit(1)
    
    success = remove_specific_pages(input_file, output_file, pages_to_remove)
    sys.exit(0 if success else 1)
"@
        
        # Save Python script to temporary file
        $tempScript = Join-Path $env:TEMP "remove_specific_pages.py"
        $pythonScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        try {
            # Run Python script
            $result = & $pythonPath.Source $tempScript $Input $Output $pythonPages
            Write-Host $result
            Remove-Item $tempScript -ErrorAction SilentlyContinue
            
            # Check if output file was created
            if (Test-Path $Output) {
                return $true
            } else {
                return $false
            }
        } catch {
            Write-Warning "Python processing failed: $_"
            Remove-Item $tempScript -ErrorAction SilentlyContinue
            return $false
        }
    } else {
        Write-Warning "Python not found. Please install Python first."
        return $false
    }
}

# Function to remove pages using Ghostscript
function Remove-SpecificPages-Ghostscript {
    param($Input, $Output, $Pages)
    
    Write-Host "`nUsing Ghostscript to remove pages..." -ForegroundColor Yellow
    
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
        
        try {
            # First, get total page count
            $pageCountCmd = @(
                "-dNODISPLAY",
                "-dBATCH",
                "-dNOPAUSE",
                "-q",
                "-c",
                "($Input) (r) file runpdfbegin pdfpagecount = quit"
            )
            
            $totalPages = & $gsPath.Source @pageCountCmd
            $totalPages = [int]$totalPages.Trim()
            
            Write-Host "Total pages: $totalPages" -ForegroundColor Cyan
            
            # Create page range excluding the pages to remove
            $keepPages = @()
            for ($i = 1; $i -le $totalPages; $i++) {
                if ($Pages -notcontains $i) {
                    $keepPages += $i
                }
            }
            
            $pageRange = $keepPages -join ','
            Write-Host "Keeping pages: $pageRange" -ForegroundColor Cyan
            
            # Ghostscript command to extract specific pages
            $gsCommand = @(
                "-dNOPAUSE",
                "-dBATCH",
                "-sDEVICE=pdfwrite",
                "-dPDFSETTINGS=/prepress",
                "-sPageList=$pageRange",
                "-sOutputFile=$Output",
                $Input
            )
            
            & $gsPath.Source @gsCommand
            
            if (Test-Path $Output) {
                Write-Host "Successfully processed with Ghostscript" -ForegroundColor Green
                return $true
            } else {
                return $false
            }
        } catch {
            Write-Warning "Ghostscript processing failed: $_"
            return $false
        }
    } else {
        Write-Warning "Ghostscript not found. Please install Ghostscript or use Python method."
        Write-Host "Download from: https://www.ghostscript.com/download/gsdnld.html" -ForegroundColor Cyan
        return $false
    }
}

# Main execution
Write-Host "`nStarting page removal..." -ForegroundColor Green

$success = $false

# Try Python method first
$success = Remove-SpecificPages-Python -Input $InputPath -Output $OutputPath -Pages $PagesToRemove

# If Python failed, try Ghostscript
if (-not $success) {
    $success = Remove-SpecificPages-Ghostscript -Input $InputPath -Output $OutputPath -Pages $PagesToRemove
}

if ($success) {
    Write-Host "`nPages removed successfully!" -ForegroundColor Green
    Write-Host "Original file: $InputPath" -ForegroundColor Cyan
    Write-Host "New file: $OutputPath" -ForegroundColor Cyan
    
    # Show file sizes
    $originalSize = (Get-Item $InputPath).Length
    $newSize = (Get-Item $OutputPath).Length
    $savedBytes = $originalSize - $newSize
    
    Write-Host "`nFile size comparison:" -ForegroundColor Yellow
    Write-Host "Original: $([math]::Round($originalSize/1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "New: $([math]::Round($newSize/1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "Saved: $([math]::Round($savedBytes/1KB, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "`nFailed to remove pages. Please check:" -ForegroundColor Red
    Write-Host "1. Python is installed and PyPDF2 is available (pip install PyPDF2)" -ForegroundColor Yellow
    Write-Host "2. Ghostscript is installed and in PATH" -ForegroundColor Yellow
    Write-Host "3. The input file is a valid PDF" -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")