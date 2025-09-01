import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export utilities for PDF and Excel functionality
 */

// Common styling for PDF exports
const PDF_STYLES = {
  fontSize: 12,
  headerFontSize: 16,
  titleFontSize: 20,
  margin: 20,
  lineHeight: 1.5
};

// Common colors for branding
const BRAND_COLORS = {
  primary: '#22c55e', // Green
  secondary: '#374151', // Gray
  accent: '#f59e0b' // Amber
};

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {string} title - Title for the PDF document
 * @param {Array} columns - Array of column definitions {header: string, key: string}
 * @param {string} filename - Filename without extension
 */
export const exportToPDF = (data, title, columns, filename = 'export') => {
  try {
    console.log('Starting PDF export with data:', data.length, 'items');
    
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
    console.log('Checking autoTable availability...');
    
    // Add company header
    pdf.setFontSize(20);
    pdf.setTextColor(34, 197, 94);
    pdf.text('FarmNex Dashboard', pageWidth / 2, 30, { align: 'center' });
    
    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(55, 65, 81);
    pdf.text(title || 'Report', pageWidth / 2, 45, { align: 'center' });
    
    // Add export date
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' });
    
    // Prepare table data
    const headers = columns.map(col => col.header || col.key || '');
    const rows = data.map(item => 
      columns.map(col => {
        let value = item[col.key];
        if (value === null || value === undefined) return '';
        
        const stringValue = String(value).replace(/[\r\n\t]/g, ' ').trim();
        return stringValue.length > 35 ? stringValue.substring(0, 32) + '...' : stringValue;
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
      
      pdf.autoTable({
        head: [headers],
        body: rows,
        startY: 65,
        theme: 'striped',
        margin: { left: 10, right: 10 },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });
    } catch (autoTableError) {
      console.error('AutoTable failed, using manual table generation:', autoTableError);
      
      // Manual table creation as fallback
      let yPosition = 70;
      const rowHeight = 8;
      const colWidth = Math.max(15, (pageWidth - 20) / headers.length);
      let xStart = 10;
      
      // Header
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(34, 197, 94);
      pdf.rect(xStart, yPosition - 5, pageWidth - 20, rowHeight, 'F');
      
      let x = xStart + 2;
      headers.forEach((header, i) => {
        pdf.text(String(header).substring(0, 12), x, yPosition);
        x += colWidth;
      });
      
      yPosition += rowHeight;
      
      // Data rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      
      rows.forEach((row, rowIndex) => {
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(xStart, yPosition - 5, pageWidth - 20, rowHeight, 'F');
        }
        
        x = xStart + 2;
        row.forEach((cell, i) => {
          const cellText = String(cell).substring(0, 12);
          pdf.text(cellText, x, yPosition);
          x += colWidth;
        });
        yPosition += rowHeight;
        
        // Page break check
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
      });
    }
    
    // Add page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
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
export const exportToExcel = (data, title, columns, filename = 'export') => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare headers
    const headers = columns.map(col => col.header);
    
    // Prepare data rows
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key];
        return value !== null && value !== undefined ? value : '';
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
    
    // Save the file
    saveAs(blob, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export Excel file. Please try again.');
    return false;
  }
};

/**
 * Format currency values for display
 * @param {number} value - Numeric value to format
 * @param {string} currency - Currency symbol (default: $)
 */
export const formatCurrency = (value, currency = '$') => {
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
  { header: 'ID', key: 'id' },
  { header: 'Product Name', key: 'productName' },
  { header: 'Category', key: 'category' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit', key: 'unit' },
  { header: 'Price per Unit', key: 'pricePerUnit' },
  { header: 'Total Value', key: 'totalValue' },
  { header: 'Location', key: 'location' },
  { header: 'Status', key: 'status' },
  { header: 'Last Updated', key: 'lastUpdated' }
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

export default {
  exportToPDF,
  exportToExcel,
  formatCurrency,
  formatDate,
  getInventoryColumns,
  getSuppliesColumns,
  getProductsColumns,
  getSalesColumns,
  processDataForExport
};
