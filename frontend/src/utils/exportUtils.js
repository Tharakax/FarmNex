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
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add company header
    pdf.setFontSize(PDF_STYLES.titleFontSize);
    pdf.setTextColor(BRAND_COLORS.primary);
    pdf.text('FarmNex Dashboard', pageWidth / 2, 30, { align: 'center' });
    
    // Add title
    pdf.setFontSize(PDF_STYLES.headerFontSize);
    pdf.setTextColor(BRAND_COLORS.secondary);
    pdf.text(title, pageWidth / 2, 45, { align: 'center' });
    
    // Add export date
    pdf.setFontSize(10);
    pdf.setTextColor(BRAND_COLORS.secondary);
    const currentDate = new Date().toLocaleDateString();
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, 55, { align: 'center' });
    
    // Prepare table data
    const headers = columns.map(col => col.header);
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key];
        return value !== null && value !== undefined ? String(value) : '';
      })
    );
    
    // Add table
    pdf.autoTable({
      head: [headers],
      body: rows,
      startY: 70,
      theme: 'striped',
      headStyles: {
        fillColor: BRAND_COLORS.primary,
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 70, left: PDF_STYLES.margin, right: PDF_STYLES.margin },
      columnStyles: {},
      didDrawPage: (data) => {
        // Add footer with page numbers
        pdf.setFontSize(8);
        pdf.setTextColor(BRAND_COLORS.secondary);
        const pageNum = pdf.internal.getNumberOfPages();
        const currentPage = data.pageNumber;
        pdf.text(`Page ${currentPage} of ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export PDF. Please try again.');
    return false;
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
