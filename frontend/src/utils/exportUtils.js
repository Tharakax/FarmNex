import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export utilities for PDF and Excel functionality with FarmNex branding
 */


// Enhanced styling for colorful PDF exports
const PDF_STYLES = {
  fontSize: 12,
  headerFontSize: 16,
  titleFontSize: 22,
  subtitleFontSize: 14,
  margin: 20,
  lineHeight: 1.6,
  borderWidth: 0.5
};

// Professional color palette for clear, readable PDFs
const BRAND_COLORS = {
  primary: [34, 197, 94],         // Professional Green
  secondary: [59, 130, 246],      // Professional Blue
  accent: [245, 158, 11],         // Professional Orange
  success: [22, 163, 74],         // Success Green
  warning: [217, 119, 6],         // Warning Orange
  error: [220, 38, 38],           // Error Red
  info: [37, 99, 235],            // Info Blue
  dark: [31, 41, 55],             // Dark Text
  darkMedium: [75, 85, 99],       // Medium Dark
  gray: [107, 114, 128],          // Professional Gray
  grayLight: [156, 163, 175],     // Light Gray
  grayVeryLight: [243, 244, 246], // Very Light Gray
  white: [255, 255, 255],         // White
  black: [0, 0, 0],               // Black
  border: [209, 213, 219],        // Border Gray
};

// Professional section themes with subtle distinctions
const SECTION_COLORS = {
  products: {
    primary: BRAND_COLORS.primary,
    accent: BRAND_COLORS.success,
    title: 'PRODUCTS'
  },
  inventory: {
    primary: BRAND_COLORS.secondary,
    accent: BRAND_COLORS.info,
    title: 'INVENTORY'
  },
  supplies: {
    primary: BRAND_COLORS.accent,
    accent: BRAND_COLORS.warning,
    title: 'SUPPLIES'
  },
  sales: {
    primary: BRAND_COLORS.success,
    accent: BRAND_COLORS.primary,
    title: 'SALES'
  },
  reports: {
    primary: BRAND_COLORS.info,
    accent: BRAND_COLORS.secondary,
    title: 'REPORTS'
  },
  training: {
    primary: BRAND_COLORS.secondary,
    accent: BRAND_COLORS.info,
    title: 'TRAINING'
  },
  analytics: {
    primary: BRAND_COLORS.info,
    accent: BRAND_COLORS.secondary,
    title: 'ANALYTICS'
  },
  home: {
    primary: BRAND_COLORS.primary,
    accent: BRAND_COLORS.success,
    title: 'DASHBOARD'
  },
  weather: {
    primary: BRAND_COLORS.secondary,
    accent: BRAND_COLORS.info,
    title: 'WEATHER'
  },
  settings: {
    primary: BRAND_COLORS.gray,
    accent: BRAND_COLORS.darkMedium,
    title: 'SETTINGS'
  },
  default: {
    primary: BRAND_COLORS.primary,
    accent: BRAND_COLORS.success,
    title: 'REPORT'
  }
};

/**
 * Export data to PDF format with colorful styling
 * @param {Array} data - Array of objects to export
 * @param {string} title - Title for the PDF document
 * @param {Array} columns - Array of column definitions {header: string, key: string}
 * @param {string} filename - Filename without extension
 * @param {string} section - Section type for color theming (products, inventory, etc.)
 */
export const exportToPDF = (data, title, columns, filename = 'export', section = 'default') => {
  try {
    console.log('Starting colorful PDF export with data:', data.length, 'items');
    
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to export');
    }
    
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      throw new Error('No columns defined for export');
    }

    // Create PDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    console.log('PDF instance created, dimensions:', pageWidth, 'x', pageHeight);
    
    // Get section-specific colors
    const sectionColors = SECTION_COLORS[section] || SECTION_COLORS.default;
    const sectionPrimary = sectionColors.primary;
    const sectionAccent = sectionColors.accent;
    const sectionTitle = sectionColors.title;
    
    // Create professional header with better spacing
    pdf.setFillColor(...sectionPrimary);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // Add subtle bottom border
    pdf.setFillColor(...BRAND_COLORS.border);
    pdf.rect(0, 60, pageWidth, 1, 'F');
    
    // Company branding area (no logo)
    pdf.setFillColor(...BRAND_COLORS.white);
    pdf.roundedRect(15, 8, 80, 22, 4, 4, 'F');
    
    // Company name
    pdf.setFontSize(14);
    pdf.setTextColor(...sectionPrimary);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FarmNex', 45, 20, { align: 'center' });
    
    // Section identifier in top right
    pdf.setFontSize(10);
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.setFont('helvetica', 'normal');
    pdf.text(sectionTitle, pageWidth - 15, 18, { align: 'right' });
    
    // Main title with better spacing and visibility
    pdf.setFontSize(PDF_STYLES.titleFontSize);
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FARM MANAGEMENT SYSTEM', pageWidth / 2, 38, { align: 'center' });
    
    // Clean section title with more spacing
    pdf.setFontSize(PDF_STYLES.headerFontSize);
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.setFont('helvetica', 'normal');
    pdf.text(title || 'Report', pageWidth / 2, 52, { align: 'center' });
    
    // Professional metadata below header with proper spacing
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_COLORS.dark);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date();
    const metaY = 75;
    pdf.text(`Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, metaY);
    pdf.text(`Total Records: ${data.length}`, pageWidth - 15, metaY, { align: 'right' });
    
    // Prepare table data with better text handling
    const headers = columns.map(col => col.header || col.key || '');
    const rows = data.map(item => 
      columns.map((col, index) => {
        let value = item[col.key];
        if (value === null || value === undefined) return '';
        
        const stringValue = String(value).replace(/[\r\n\t]/g, ' ').trim();
        
        // Apply different text length limits based on column type
        if (col.key === 'description') {
          return stringValue.length > 50 ? stringValue.substring(0, 47) + '...' : stringValue;
        } else if (col.key === 'name' || col.key === 'productName') {
          return stringValue.length > 25 ? stringValue.substring(0, 22) + '...' : stringValue;
        } else if (col.key === 'id') {
          // Show only the last 6-8 characters of long IDs for better readability
          if (stringValue.length > 8) {
            return '...' + stringValue.slice(-6);
          }
          return stringValue;
        } else {
          return stringValue.length > 20 ? stringValue.substring(0, 17) + '...' : stringValue;
        }
      })
    );
    
    console.log('Table data prepared. Headers:', headers.length, 'Rows:', rows.length);
    
    // Use autoTable through the pdf instance (attached by side-effect import)
    console.log('Using pdf.autoTable method');
    
    try {
      // Check if autoTable is available on the pdf instance
      if (typeof pdf.autoTable !== 'function') {
        throw new Error('autoTable plugin not properly loaded');
      }
      
      // Professional table styling with optimal readability
      pdf.autoTable({
        head: [headers],
        body: rows,
        startY: 85,
        theme: 'striped',
        margin: { left: 10, right: 10, top: 10, bottom: 30 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          lineColor: [...BRAND_COLORS.border],
          lineWidth: 0.5,
          fontStyle: 'normal',
          textColor: [...BRAND_COLORS.dark],
          minCellWidth: 15,
          cellWidth: 'auto'
        },
        headStyles: {
          fillColor: [...BRAND_COLORS.grayVeryLight],
          textColor: [...BRAND_COLORS.dark],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 4,
          minCellHeight: 10,
          lineColor: [...BRAND_COLORS.border],
          lineWidth: 1
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [...BRAND_COLORS.dark],
          valign: 'top',
          cellPadding: 3,
          lineColor: [...BRAND_COLORS.border],
          lineWidth: 0.3
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        columnStyles: (() => {
          // Dynamic column widths that ensure all columns fit within page width
          const availableWidth = pageWidth - 40; // Account for margins
          const baseStyles = {
            0: { fontStyle: 'bold', halign: 'center' }, // ID
            1: { fontStyle: 'bold' }, // Name/Product Name
          };
          
          // Calculate widths based on number of columns to ensure all fit
          if (columns.length <= 7) {
            // Standard width distribution for 7 or fewer columns
            return {
              ...baseStyles,
              0: { ...baseStyles[0], cellWidth: 18 }, // ID
              1: { ...baseStyles[1], cellWidth: 38 }, // Name
              2: { cellWidth: 22 }, // Category
              3: { cellWidth: 45, fontSize: 7 }, // Description
              4: { cellWidth: 22, fontStyle: 'bold', halign: 'right' }, // Price
              5: { cellWidth: 18, halign: 'center' }, // Stock
              6: { cellWidth: 17, halign: 'center' }, // Unit
            };
          } else if (columns.length === 8) {
            // Adjusted for 8 columns with proper Status column width
            return {
              ...baseStyles,
              0: { ...baseStyles[0], cellWidth: 12 }, // ID - smaller to make room
              1: { ...baseStyles[1], cellWidth: 28 }, // Name - smaller
              2: { cellWidth: 16 }, // Category - smaller
              3: { cellWidth: 30, fontSize: 7 }, // Description - smaller
              4: { cellWidth: 16, fontStyle: 'bold', halign: 'right' }, // Price - smaller
              5: { cellWidth: 14, halign: 'center' }, // Stock - smaller
              6: { cellWidth: 10, halign: 'center' }, // Unit - smaller
              7: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }, // Status - MUCH LARGER WIDTH
            };
          } else {
            // 9 columns - compact layout
            return {
              ...baseStyles,
              0: { ...baseStyles[0], cellWidth: 14 }, // ID
              1: { ...baseStyles[1], cellWidth: 28 }, // Name
              2: { cellWidth: 18 }, // Category
              3: { cellWidth: 32, fontSize: 6 }, // Description
              4: { cellWidth: 18, fontStyle: 'bold', halign: 'right' }, // Price
              5: { cellWidth: 14, halign: 'center' }, // Stock
              6: { cellWidth: 12, halign: 'center' }, // Unit
              7: { cellWidth: 16, halign: 'center' }, // Status
              8: { cellWidth: 18, fontSize: 7 }, // Date
            };
          }
        })(),
        didParseCell: function(data) {
          // Apply text wrapping for better readability
          data.cell.styles.overflow = 'linebreak';
          data.cell.styles.cellWidth = 'wrap';
          
          // Professional status highlighting with subtle colors
          if (data.column.index === columns.findIndex(col => col.key === 'status')) {
            const cellText = data.cell.text[0];
            if (cellText) {
              const status = cellText.toLowerCase();
              if (status.includes('active') || status.includes('in stock') || status.includes('available')) {
                data.cell.styles.textColor = [...BRAND_COLORS.success];
                data.cell.styles.fontStyle = 'bold';
              } else if (status.includes('low') || status.includes('warning')) {
                data.cell.styles.textColor = [...BRAND_COLORS.warning];
                data.cell.styles.fontStyle = 'bold';
              } else if (status.includes('out') || status.includes('inactive') || status.includes('expired')) {
                data.cell.styles.textColor = [...BRAND_COLORS.error];
                data.cell.styles.fontStyle = 'bold';
              } else if (status.includes('over')) {
                data.cell.styles.textColor = [...BRAND_COLORS.info];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
          
          // Professional currency highlighting
          if (data.cell.text[0] && (data.cell.text[0].includes('LKR') || data.cell.text[0].includes('$') || data.cell.text[0].includes('Rs'))) {
            data.cell.styles.textColor = [...BRAND_COLORS.success];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'right';
          }
          
          // Subtle number emphasis
          if (data.cell.text[0] && /^\d+(\.\d+)?$/.test(data.cell.text[0])) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'right';
          }
          
          // Better alignment for different data types
          if (data.column.index === 0) { // ID column
            data.cell.styles.halign = 'center';
          }
        }
      });
    } catch (autoTableError) {
      console.error('AutoTable failed, using manual table generation:', autoTableError);
      
      // Enhanced manual table creation as fallback with better spacing
      let yPosition = 95;
      const rowHeight = 12;
      const availableWidth = pageWidth - 24;
      
      // Dynamic column widths based on content type and total columns
      const columnWidths = headers.map((header, index) => {
        const headerLower = header.toLowerCase();
        const totalCols = headers.length;
        
        if (totalCols <= 7) {
          // Standard spacing for 7 or fewer columns
          if (headerLower.includes('id')) return 18;
          if (headerLower.includes('name')) return 38;
          if (headerLower.includes('description')) return 45;
          if (headerLower.includes('price') || headerLower.includes('cost')) return 22;
          if (headerLower.includes('quantity') || headerLower.includes('stock')) return 18;
          if (headerLower.includes('category')) return 22;
          if (headerLower.includes('unit')) return 17;
          return Math.max(20, availableWidth / totalCols);
        } else if (totalCols === 8) {
          // Tighter spacing for 8 columns with proper Status column width
          if (headerLower.includes('id')) return 12;
          if (headerLower.includes('name')) return 28;
          if (headerLower.includes('description')) return 30;
          if (headerLower.includes('price') || headerLower.includes('cost')) return 16;
          if (headerLower.includes('quantity') || headerLower.includes('stock')) return 14;
          if (headerLower.includes('status')) return 28; // MUCH LARGER WIDTH
          if (headerLower.includes('category')) return 16;
          if (headerLower.includes('unit')) return 10;
          return Math.max(18, availableWidth / totalCols);
        } else {
          // Very tight spacing for 9+ columns
          if (headerLower.includes('id')) return 14;
          if (headerLower.includes('name')) return 28;
          if (headerLower.includes('description')) return 32;
          if (headerLower.includes('price') || headerLower.includes('cost')) return 18;
          if (headerLower.includes('quantity') || headerLower.includes('stock')) return 14;
          if (headerLower.includes('status')) return 16;
          if (headerLower.includes('category')) return 18;
          if (headerLower.includes('unit')) return 12;
          if (headerLower.includes('date') || headerLower.includes('created')) return 18;
          return Math.max(15, availableWidth / totalCols);
        }
      });
      
      let xStart = 12;
      
      // Professional header design
      pdf.setFillColor(...BRAND_COLORS.grayVeryLight);
      pdf.rect(xStart, yPosition - 6, pageWidth - 24, rowHeight + 2, 'F');
      
      pdf.setDrawColor(...BRAND_COLORS.border);
      pdf.setLineWidth(1);
      pdf.rect(xStart, yPosition - 6, pageWidth - 24, rowHeight + 2, 'S');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...BRAND_COLORS.white);
      
      let x = xStart + 2;
      headers.forEach((header, i) => {
        const headerText = String(header);
        const colWidth = columnWidths[i];
        
        // Center align header text in the column
        pdf.text(headerText, x + (colWidth / 2), yPosition, { align: 'center', maxWidth: colWidth - 4 });
        x += colWidth;
      });
      
      yPosition += rowHeight + 2;
      
      // Enhanced data rows with colorful styling
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      rows.forEach((row, rowIndex) => {
        // Professional alternate row backgrounds
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(xStart, yPosition - 6, pageWidth - 24, rowHeight, 'F');
        }
        
        // Clean row borders
        pdf.setDrawColor(...BRAND_COLORS.border);
        pdf.setLineWidth(0.3);
        pdf.rect(xStart, yPosition - 6, pageWidth - 24, rowHeight, 'S');
        
        x = xStart + 2;
        row.forEach((cell, cellIndex) => {
          const colWidth = columnWidths[cellIndex];
          const cellText = String(cell);
          
          // Professional content formatting
          if (cellText.includes('LKR') || cellText.includes('$') || cellText.includes('Rs')) {
            pdf.setTextColor(...BRAND_COLORS.success);
            pdf.setFont('helvetica', 'bold');
            pdf.text(cellText, x + colWidth - 2, yPosition, { align: 'right', maxWidth: colWidth - 4 });
          } else if (cellIndex === 0) { // ID column
            pdf.setTextColor(...BRAND_COLORS.dark);
            pdf.setFont('helvetica', 'bold');
            pdf.text(cellText, x + (colWidth / 2), yPosition, { align: 'center', maxWidth: colWidth - 4 });
          } else if (/^\d+(\.\d+)?$/.test(cellText)) { // Number columns
            pdf.setTextColor(...BRAND_COLORS.dark);
            pdf.setFont('helvetica', 'bold');
            pdf.text(cellText, x + colWidth - 2, yPosition, { align: 'right', maxWidth: colWidth - 4 });
          } else {
            pdf.setTextColor(...BRAND_COLORS.dark);
            pdf.setFont('helvetica', 'normal');
            // Use text wrapping for long content
            const lines = pdf.splitTextToSize(cellText, colWidth - 4);
            pdf.text(lines[0] || cellText, x + 2, yPosition, { maxWidth: colWidth - 4 });
          }
          
          x += colWidth;
        });
        yPosition += rowHeight;
        
        // Enhanced page break with header continuation
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 40;
          
          // Repeat professional header on new page
          pdf.setFillColor(...BRAND_COLORS.grayVeryLight);
          pdf.rect(xStart, yPosition - 6, pageWidth - 24, rowHeight + 2, 'F');
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...BRAND_COLORS.dark);
          
          x = xStart + 2;
          headers.forEach((header, i) => {
            const colWidth = columnWidths[i];
            pdf.text(String(header), x + (colWidth / 2), yPosition, { align: 'center', maxWidth: colWidth - 4 });
            x += colWidth;
          });
          yPosition += rowHeight + 2;
        }
      });
    }
    
    // Add colorful footer and page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Professional footer with border
      pdf.setDrawColor(...BRAND_COLORS.border);
      pdf.setLineWidth(0.5);
      pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      
      // Professional page numbering and footer
      pdf.setFontSize(9);
      pdf.setTextColor(...BRAND_COLORS.gray);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      
      // Company info
      pdf.setFontSize(8);
      pdf.text('FarmNex Farm Management System', 15, pageHeight - 8);
      const timestamp = new Date().toLocaleString();
      pdf.text(`Generated: ${timestamp}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
    }
    
    // Professional summary section
    if (data.length > 0) {
      const finalY = pdf.lastAutoTable?.finalY || 200;
      
      // Clean summary border
      pdf.setDrawColor(...BRAND_COLORS.border);
      pdf.setLineWidth(1);
      pdf.rect(15, finalY + 15, pageWidth - 30, 25, 'S');
      
      // Summary title
      pdf.setFontSize(12);
      pdf.setTextColor(...BRAND_COLORS.dark);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORT SUMMARY', pageWidth / 2, finalY + 26, { align: 'center' });
      
      // Summary content
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total records: ${data.length} | Generated by FarmNex System`, pageWidth / 2, finalY + 34, { align: 'center' });
    }
    
    console.log('PDF generation completed, saving file');
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return true;
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error(`PDF Export Failed: ${error.message || 'Unknown error occurred'}`);
  }
};

/**
 * Export data to Excel format
 * @param {Array} data - Array of objects to export
 * @param {string} title - Title for the Excel sheet
 * @param {Array} columns - Array of column definitions {header: string, key: string}
 * @param {string} filename - Filename without extension
 */
/**
 * Safely truncate text for Excel cell limits
 * @param {any} value - Value to truncate
 * @param {number} maxLength - Maximum length (default: 32000 for safety)
 * @returns {string} - Truncated string
 */
const safeExcelText = (value, maxLength = 32000) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  if (stringValue.length <= maxLength) {
    return stringValue;
  }
  
  console.warn(`⚠️ Truncating text from ${stringValue.length} to ${maxLength} characters`);
  return stringValue.substring(0, maxLength - 3) + '...';
};

export const exportToExcel = async (data, title, columns, filename = 'export') => {
  try {
    console.log('📊 Starting Excel export with:', { dataLength: data.length, title, columnsCount: columns.length, filename });
    
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to export');
    }
    
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      throw new Error('No columns defined for export');
    }
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare headers with safe text truncation
    const headers = columns.map(col => safeExcelText(col.header, 255));
    
    // Prepare data rows with safe text truncation
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key];
        return safeExcelText(value);
      })
    );
    
    // Create worksheet data with headers
    const worksheetData = [headers, ...rows];
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = columns.map(col => ({ width: 15 }));
    worksheet['!cols'] = columnWidths;
    
    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "22c55e" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    console.log('📁 Saving Excel file as:', `${filename}.xlsx`);
    
    // Save the file
    saveAs(blob, `${filename}.xlsx`);
    
    console.log('✅ Excel export completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      data: data ? data.length : 'null',
      columns: columns ? columns.length : 'null'
    });
    
    // Throw the error to be handled by the calling function
    throw new Error(`Excel Export Failed: ${error.message || 'Unknown error occurred'}`);
  }
};

/**
 * Format currency values for display
 * @param {number} value - Numeric value to format
 * @param {string} currency - Currency symbol (default: $)
 */
export const formatCurrency = (value, currency = 'LKR ') => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return `${currency}${Number(value).toFixed(2)}`;
};

/**
 * Format date values for display
 * @param {string|Date} date - Date to format
 */
export const formatDate = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
};

/**
 * Get common column definitions for inventory data
 */
export const getInventoryColumns = () => [
  { header: 'Product Name', key: 'productName' },
  { header: 'Category', key: 'category' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price', key: 'pricePerUnit' },
  { header: 'Total Value', key: 'totalValue' },
  { header: 'Status', key: 'status' }
];

/**
 * Get common column definitions for supplies data
 */
export const getSuppliesColumns = () => [
  { header: 'ID', key: 'id' },
  { header: 'Supply Name', key: 'name' },
  { header: 'Type', key: 'type' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit', key: 'unit' },
  { header: 'Cost per Unit', key: 'costPerUnit' },
  { header: 'Total Cost', key: 'totalCost' },
  { header: 'Supplier', key: 'supplier' },
  { header: 'Status', key: 'status' },
  { header: 'Purchase Date', key: 'purchaseDate' }
];

/**
 * Get common column definitions for products data
 */
export const getProductsColumns = () => [
  { header: 'ID', key: 'id' },
  { header: 'Product Name', key: 'name' },
  { header: 'Category', key: 'category' },
  { header: 'Description', key: 'description' },
  { header: 'Price', key: 'price' },
  { header: 'Stock Quantity', key: 'stockQuantity' },
  { header: 'Unit', key: 'unit' },
  { header: 'Status', key: 'status' },
  { header: 'Created Date', key: 'createdDate' }
];

/**
 * Get common column definitions for sales data
 */
export const getSalesColumns = () => [
  { header: 'ID', key: 'id' },
  { header: 'Customer', key: 'customer' },
  { header: 'Product', key: 'product' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price', key: 'unitPrice' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Sale Date', key: 'saleDate' },
  { header: 'Payment Status', key: 'paymentStatus' },
  { header: 'Delivery Status', key: 'deliveryStatus' }
];

/**
 * Process data for export (format currencies, dates, etc.)
 * @param {Array} data - Raw data array
 * @param {Array} currencyFields - Fields that should be formatted as currency
 * @param {Array} dateFields - Fields that should be formatted as dates
 */
export const processDataForExport = (data, currencyFields = [], dateFields = []) => {
  return data.map(item => {
    const processed = { ...item };
    
    // Format currency fields
    currencyFields.forEach(field => {
      if (processed[field] !== undefined && processed[field] !== null) {
        processed[field] = formatCurrency(processed[field]);
      }
    });
    
    // Format date fields
    dateFields.forEach(field => {
      if (processed[field]) {
        processed[field] = formatDate(processed[field]);
      }
    });
    
    return processed;
  });
};

/**
 * Load image from URL and convert to base64 for PDF embedding
 * @param {string} imageUrl - URL of the image to load
 * @returns {Promise<string>} - Base64 encoded image data
 */
const loadImageAsBase64 = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};

/**
 * Export products data to PDF with embedded images
 * @param {Array} data - Array of product objects with image URLs
 * @param {string} title - Title for the PDF document
 * @param {Array} columns - Array of column definitions
 * @param {string} filename - Filename without extension
 * @param {string} section - Section type for color theming
 */
export const exportProductsToPDFWithImages = async (data, title, columns, filename = 'products_export', section = 'products') => {
  try {
    console.log('Starting PDF export with embedded images...');
    
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to export');
    }
    
    // Create PDF instance
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for better image display
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    console.log('PDF instance created (landscape), dimensions:', pageWidth, 'x', pageHeight);
    
    // Get section colors
    const sectionColors = SECTION_COLORS[section] || SECTION_COLORS.default;
    const sectionPrimary = sectionColors.primary;
    
    // Create header
    pdf.setFillColor(...sectionPrimary);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // Company branding area (no logo)
    pdf.setFillColor(...BRAND_COLORS.white);
    pdf.roundedRect(15, 8, 80, 22, 4, 4, 'F');
    
    // Company name
    pdf.setFontSize(14);
    pdf.setTextColor(...sectionPrimary);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FarmNex', 50, 20, { align: 'center' });
    
    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(...BRAND_COLORS.white);
    pdf.text('FARM MANAGEMENT SYSTEM', pageWidth / 2, 35, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(title || 'Products Report with Images', pageWidth / 2, 50, { align: 'center' });
    
    // Metadata
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_COLORS.dark);
    const currentDate = new Date();
    pdf.text(`Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 75);
    pdf.text(`Total Records: ${data.length}`, pageWidth - 15, 75, { align: 'right' });
    
    let yPosition = 90;
    const itemHeight = 65; // Height for each product item with image
    const imageSize = 50; // Size of product images
    const leftMargin = 15;
    const rightMargin = 15;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    
    // Process each product with image
    for (let i = 0; i < data.length; i++) {
      const product = data[i];
      
      // Check if we need a new page
      if (yPosition + itemHeight > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Product container background
      pdf.setFillColor(248, 249, 250);
      pdf.roundedRect(leftMargin, yPosition, contentWidth, itemHeight, 3, 3, 'F');
      
      // Product container border
      pdf.setDrawColor(...BRAND_COLORS.border);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(leftMargin, yPosition, contentWidth, itemHeight, 3, 3, 'S');
      
      try {
        // Load and embed product image
        if (product.image) {
          console.log(`Loading image for ${product.name}:`, product.image);
          
          try {
            const base64Image = await loadImageAsBase64(product.image);
            pdf.addImage(base64Image, 'JPEG', leftMargin + 5, yPosition + 5, imageSize, imageSize * 0.75);
          } catch (imageError) {
            console.warn(`Failed to load image for ${product.name}:`, imageError);
            // Draw placeholder rectangle for missing image
            pdf.setFillColor(200, 200, 200);
            pdf.rect(leftMargin + 5, yPosition + 5, imageSize, imageSize * 0.75, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text('No Image', leftMargin + 5 + imageSize/2, yPosition + 25, { align: 'center' });
          }
        } else {
          // Draw placeholder for no image
          pdf.setFillColor(220, 220, 220);
          pdf.rect(leftMargin + 5, yPosition + 5, imageSize, imageSize * 0.75, 'F');
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text('No Image', leftMargin + 5 + imageSize/2, yPosition + 25, { align: 'center' });
        }
      } catch (error) {
        console.warn('Image processing error:', error);
      }
      
      // Product information starting after image
      const infoStartX = leftMargin + imageSize + 15;
      const infoWidth = contentWidth - imageSize - 20;
      
      // Product name
      pdf.setFontSize(14);
      pdf.setTextColor(...BRAND_COLORS.dark);
      pdf.setFont('helvetica', 'bold');
      pdf.text(product.name || 'Unknown Product', infoStartX, yPosition + 15);
      
      // Category
      pdf.setFontSize(10);
      pdf.setTextColor(...BRAND_COLORS.gray);
      pdf.setFont('helvetica', 'normal');
      const category = (product.category || 'uncategorized').replace('-', ' ');
      pdf.text(`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`, infoStartX, yPosition + 25);
      
      // Price with styling
      if (product.price) {
        pdf.setFontSize(12);
        pdf.setTextColor(...BRAND_COLORS.success);
        pdf.setFont('helvetica', 'bold');
        const priceText = typeof product.price === 'string' ? product.price : `LKR ${product.price}`;
        pdf.text(`Price: ${priceText}`, infoStartX, yPosition + 35);
      }
      
      // Revenue (if available)
      if (product.revenue) {
        pdf.setFontSize(10);
        pdf.setTextColor(...BRAND_COLORS.info);
        pdf.text(`Revenue: $${product.revenue.toLocaleString()}`, infoStartX + 80, yPosition + 35);
      }
      
      // Stock quantity
      if (product.stockQuantity !== undefined) {
        pdf.setFontSize(10);
        pdf.setTextColor(...BRAND_COLORS.dark);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Stock: ${product.stockQuantity} ${product.unit || 'units'}`, infoStartX, yPosition + 45);
      }
      
      // Rating (if available)
      if (product.rating) {
        pdf.setFontSize(10);
        pdf.setTextColor(...BRAND_COLORS.warning);
        const ratingText = typeof product.rating === 'string' ? product.rating : `${product.rating}/5.0`;
        pdf.text(`Rating: ${ratingText}`, infoStartX + 80, yPosition + 45);
      }
      
      // Status with color coding
      if (product.status) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        const status = product.status.toLowerCase();
        if (status.includes('stock') && !status.includes('out')) {
          pdf.setTextColor(...BRAND_COLORS.success);
        } else if (status.includes('low')) {
          pdf.setTextColor(...BRAND_COLORS.warning);
        } else if (status.includes('out')) {
          pdf.setTextColor(...BRAND_COLORS.error);
        } else {
          pdf.setTextColor(...BRAND_COLORS.info);
        }
        
        pdf.text(`Status: ${product.status}`, infoStartX, yPosition + 55);
      }
      
      // Description (if available and fits)
      if (product.description && infoWidth > 200) {
        pdf.setFontSize(8);
        pdf.setTextColor(...BRAND_COLORS.gray);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(product.description, infoWidth - 100);
        pdf.text(lines[0] || product.description, infoStartX + 160, yPosition + 25);
        if (lines[1]) {
          pdf.text(lines[1], infoStartX + 160, yPosition + 33);
        }
      }
      
      yPosition += itemHeight + 10;
    }
    
    // Add footer to all pages
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Footer line
      pdf.setDrawColor(...BRAND_COLORS.border);
      pdf.setLineWidth(0.5);
      pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      
      // Page number
      pdf.setFontSize(9);
      pdf.setTextColor(...BRAND_COLORS.gray);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      
      // Footer info
      pdf.setFontSize(8);
      pdf.text('FarmNex Farm Management System', 15, pageHeight - 8);
      const timestamp = new Date().toLocaleString();
      pdf.text(`Generated: ${timestamp}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
    }
    
    console.log('PDF with images generated successfully');
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return true;
    
  } catch (error) {
    console.error('Error exporting PDF with images:', error);
    throw new Error(`Image PDF Export Failed: ${error.message || 'Unknown error occurred'}`);
  }
};

export default {
  exportToPDF,
  exportToExcel,
  exportProductsToPDFWithImages,
  loadImageAsBase64,
  formatCurrency,
  formatDate,
  getInventoryColumns,
  getSuppliesColumns,
  getProductsColumns,
  getSalesColumns,
  processDataForExport
};
