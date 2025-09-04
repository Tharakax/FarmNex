import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

class ExportService {
  // Company/Farm branding info
  static COMPANY_INFO = {
    name: 'FarmNex Management System',
    address: 'Your Farm Address',
    phone: 'Your Phone Number',
    email: 'your-email@farm.com',
    logo: null // Can be set to a base64 image if needed
  };

  // Common PDF styling
  static PDF_STYLES = {
    headerColor: [34, 197, 94], // Green
    alternateRowColor: [249, 250, 251], // Light gray
    textColor: [31, 41, 55], // Dark gray
    fontSize: {
      title: 20,
      subtitle: 14,
      header: 12,
      body: 10,
      small: 8
    }
  };

  /**
   * Generate PDF header with company info and report details
   */
  static addPDFHeader(doc, reportTitle, reportSubtitle = '') {
    const pageWidth = doc.internal.pageSize.width;
    
    // Company name
    doc.setFontSize(this.PDF_STYLES.fontSize.title);
    doc.setTextColor(...this.PDF_STYLES.headerColor);
    doc.text(this.COMPANY_INFO.name, 20, 25);
    
    // Report title
    doc.setFontSize(this.PDF_STYLES.fontSize.subtitle);
    doc.setTextColor(...this.PDF_STYLES.textColor);
    doc.text(reportTitle, 20, 40);
    
    if (reportSubtitle) {
      doc.setFontSize(this.PDF_STYLES.fontSize.body);
      doc.text(reportSubtitle, 20, 50);
    }
    
    // Date and time
    const now = new Date();
    const dateString = `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    doc.setFontSize(this.PDF_STYLES.fontSize.small);
    doc.text(dateString, pageWidth - 20, 25, { align: 'right' });
    
    // Line separator
    doc.setDrawColor(...this.PDF_STYLES.headerColor);
    doc.line(20, reportSubtitle ? 60 : 50, pageWidth - 20, reportSubtitle ? 60 : 50);
    
    return reportSubtitle ? 70 : 60; // Return Y position for content start
  }

  /**
   * Add PDF footer with page numbers
   */
  static addPDFFooter(doc) {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(this.PDF_STYLES.fontSize.small);
    doc.setTextColor(...this.PDF_STYLES.textColor);
    
    // Page number
    const pageNumber = doc.internal.getNumberOfPages();
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    // Company info
    doc.text(this.COMPANY_INFO.name, 20, pageHeight - 10);
  }

  /**
   * Export Inventory Data (Products + Supplies)
   */
  static exportInventoryToPDF(inventoryData, stats) {
    try {
      const doc = new jsPDF();
      const startY = this.addPDFHeader(doc, 'Inventory Management Report', `Total Items: ${stats.totalItems} | Total Value: LKR ${stats.totalValue.toFixed(2)}`);
      
      // Prepare table data
      const tableData = inventoryData.map(item => {
        const currentStock = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
        const stockValue = currentStock * (item.price || 0);
        return [
          item.name,
          item.category.replace('-', ' '),
          item.type.toUpperCase(),
          currentStock.toString(),
          item.unit || 'units',
          `LKR ${(item.price || 0).toFixed(2)}`,
          `LKR ${stockValue.toFixed(2)}`,
          this.getStockStatusText(item)
        ];
      });

      // Add table
      doc.autoTable({
        head: [['Product/Supply', 'Category', 'Type', 'Quantity', 'Unit', 'Unit Price', 'Stock Value', 'Status']],
        body: tableData,
        startY: startY,
        theme: 'grid',
        headStyles: { fillColor: this.PDF_STYLES.headerColor },
        alternateRowStyles: { fillColor: this.PDF_STYLES.alternateRowColor },
        fontSize: this.PDF_STYLES.fontSize.body,
        margin: { top: 20, bottom: 30 }
      });

      this.addPDFFooter(doc);
      doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Inventory report exported as PDF!');
    } catch (error) {
      console.error('Error exporting inventory to PDF:', error);
      toast.error('Failed to export inventory as PDF');
    }
  }

  static exportInventoryToExcel(inventoryData, stats) {
    try {
      // Prepare data for Excel
      const excelData = inventoryData.map(item => {
        const currentStock = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
        const minStock = item.type === 'product' ? (item.stock?.minimum || 5) : (item.minQuantity || 5);
        const maxStock = item.type === 'product' ? (item.stock?.maximum || 100) : (item.maxQuantity || 100);
        const stockValue = currentStock * (item.price || 0);
        
        return {
          'Name': item.name,
          'Description': item.description || '',
          'Category': item.category.replace('-', ' '),
          'Type': item.type.toUpperCase(),
          'Current Stock': currentStock,
          'Min Stock': minStock,
          'Max Stock': maxStock,
          'Unit': item.unit || 'units',
          'Unit Price': item.price || 0,
          'Stock Value': stockValue,
          'Status': this.getStockStatusText(item),
          'Supplier': item.supplier || item.supplier?.name || '',
          'Last Updated': item.updatedAt || item.lastRestocked || item.createdAt || ''
        };
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add inventory data sheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
      
      // Add summary sheet
      const summaryData = [
        ['Inventory Summary', ''],
        ['Total Items', stats.totalItems],
        ['Total Products', stats.totalProducts],
        ['Total Supplies', stats.totalSupplies],
        ['Total Value', `LKR ${stats.totalValue.toFixed(2)}`],
        ['In Stock Items', stats.inStockItems],
        ['Low Stock Items', stats.lowStockItems],
        ['Out of Stock Items', stats.outOfStockItems],
        ['Overstocked Items', stats.overstockedItems],
        ['Total Units', stats.totalUnits],
        ['Generated On', new Date().toLocaleString()]
      ];
      
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      // Export file
      const fileName = `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Inventory report exported as Excel!');
    } catch (error) {
      console.error('Error exporting inventory to Excel:', error);
      toast.error('Failed to export inventory as Excel');
    }
  }

  /**
   * Export Farm Supplies Data
   */
  static exportFarmSupplies = {
    toPDF: (suppliesData, stats) => {
      try {
        const doc = new jsPDF();
        const startY = ExportService.addPDFHeader(doc, 'Farm Supplies Report', `Total Supplies: ${suppliesData.length} | Total Value: LKR ${stats.totalValue.toFixed(2)}`);
        
        const tableData = suppliesData.map(supply => [
          supply.name,
          supply.category.replace('-', ' '),
          supply.quantity.toString(),
          supply.unit,
          `LKR ${supply.price.toFixed(2)}`,
          `LKR ${(supply.quantity * supply.price).toFixed(2)}`,
          supply.supplier?.name || 'Unknown',
          supply.status || 'Active',
          supply.expiryDate ? new Date(supply.expiryDate).toLocaleDateString() : 'N/A'
        ]);

        doc.autoTable({
          head: [['Name', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Total Value', 'Supplier', 'Status', 'Expiry']],
          body: tableData,
          startY: startY,
          theme: 'grid',
          headStyles: { fillColor: ExportService.PDF_STYLES.headerColor },
          alternateRowStyles: { fillColor: ExportService.PDF_STYLES.alternateRowColor },
          fontSize: ExportService.PDF_STYLES.fontSize.body,
          margin: { top: 20, bottom: 30 }
        });

        ExportService.addPDFFooter(doc);
        doc.save(`farm-supplies-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Farm supplies exported as PDF!');
      } catch (error) {
        console.error('Error exporting farm supplies to PDF:', error);
        toast.error('Failed to export farm supplies as PDF');
      }
    },

    toExcel: (suppliesData, stats) => {
      try {
        const excelData = suppliesData.map(supply => ({
          'Name': supply.name,
          'Description': supply.description || '',
          'Category': supply.category.replace('-', ' '),
          'Quantity': supply.quantity,
          'Min Quantity': supply.minQuantity || 5,
          'Max Quantity': supply.maxQuantity || 100,
          'Unit': supply.unit,
          'Unit Price': supply.price,
          'Total Value': supply.quantity * supply.price,
          'Supplier': supply.supplier?.name || 'Unknown',
          'Status': supply.status || 'Active',
          'Expiry Date': supply.expiryDate || '',
          'Storage Location': supply.storage?.location || '',
          'Batch Number': supply.batchNumber || '',
          'Last Restocked': supply.lastRestocked || supply.createdAt || '',
          'Created Date': supply.createdAt || ''
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Farm Supplies');

        // Add summary sheet
        const summaryData = [
          ['Farm Supplies Summary', ''],
          ['Total Supplies', suppliesData.length],
          ['Total Value', `LKR ${stats.totalValue.toFixed(2)}`],
          ['Categories', stats.categories || 'N/A'],
          ['Low Stock Items', stats.lowStock || 0],
          ['Expired Items', stats.expired || 0],
          ['Generated On', new Date().toLocaleString()]
        ];
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        const fileName = `farm-supplies-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Farm supplies exported as Excel!');
      } catch (error) {
        console.error('Error exporting farm supplies to Excel:', error);
        toast.error('Failed to export farm supplies as Excel');
      }
    }
  };

  /**
   * Export Products Data
   */
  static exportProducts = {
    toPDF: (productsData, stats) => {
      try {
        const doc = new jsPDF();
        const startY = ExportService.addPDFHeader(doc, 'Products Report', `Total Products: ${productsData.length} | Total Value: LKR ${stats.totalValue.toFixed(2)}`);
        
        const tableData = productsData.map(product => [
          product.name,
          product.category.replace('-', ' '),
          (product.stock?.current || 0).toString(),
          product.unit || 'units',
          `LKR ${(product.price || 0).toFixed(2)}`,
          `LKR ${((product.stock?.current || 0) * (product.price || 0)).toFixed(2)}`,
          product.stock?.minimum || 5,
          product.stock?.maximum || 100,
          ExportService.getStockStatusText(product)
        ]);

        doc.autoTable({
          head: [['Product', 'Category', 'Stock', 'Unit', 'Price', 'Stock Value', 'Min', 'Max', 'Status']],
          body: tableData,
          startY: startY,
          theme: 'grid',
          headStyles: { fillColor: ExportService.PDF_STYLES.headerColor },
          alternateRowStyles: { fillColor: ExportService.PDF_STYLES.alternateRowColor },
          fontSize: ExportService.PDF_STYLES.fontSize.body,
          margin: { top: 20, bottom: 30 }
        });

        ExportService.addPDFFooter(doc);
        doc.save(`products-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Products exported as PDF!');
      } catch (error) {
        console.error('Error exporting products to PDF:', error);
        toast.error('Failed to export products as PDF');
      }
    },

    toExcel: (productsData, stats) => {
      try {
        const excelData = productsData.map(product => ({
          'Product Name': product.name,
          'Description': product.description || '',
          'Category': product.category.replace('-', ' '),
          'Current Stock': product.stock?.current || 0,
          'Min Stock': product.stock?.minimum || 5,
          'Max Stock': product.stock?.maximum || 100,
          'Unit': product.unit || 'units',
          'Unit Price': product.price || 0,
          'Stock Value': (product.stock?.current || 0) * (product.price || 0),
          'Status': ExportService.getStockStatusText(product),
          'SKU': product.sku || '',
          'Tags': product.tags ? product.tags.join(', ') : '',
          'Created Date': product.createdAt || '',
          'Last Updated': product.updatedAt || ''
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Products');

        // Add summary sheet
        const summaryData = [
          ['Products Summary', ''],
          ['Total Products', productsData.length],
          ['Total Stock Value', `LKR ${stats.totalValue.toFixed(2)}`],
          ['In Stock', stats.inStock || 0],
          ['Low Stock', stats.lowStock || 0],
          ['Out of Stock', stats.outOfStock || 0],
          ['Generated On', new Date().toLocaleString()]
        ];
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        const fileName = `products-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Products exported as Excel!');
      } catch (error) {
        console.error('Error exporting products to Excel:', error);
        toast.error('Failed to export products as Excel');
      }
    }
  };

  /**
   * Export Sales Data
   */
  static exportSales = {
    toPDF: (salesData, period = 'All Time') => {
      try {
        const doc = new jsPDF();
        const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const startY = ExportService.addPDFHeader(doc, 'Sales Report', `Period: ${period} | Total Revenue: LKR ${totalRevenue.toFixed(2)}`);
        
        const tableData = salesData.map(sale => [
          sale.customer?.name || 'Unknown Customer',
          new Date(sale.createdAt || sale.date).toLocaleDateString(),
          (sale.items || []).map(item => `${item.name} (${item.quantity})`).join(', '),
          `LKR ${(sale.totalAmount || 0).toFixed(2)}`,
          sale.paymentMethod || 'Unknown',
          sale.status || 'Completed'
        ]);

        doc.autoTable({
          head: [['Customer', 'Date', 'Items', 'Total', 'Payment', 'Status']],
          body: tableData,
          startY: startY,
          theme: 'grid',
          headStyles: { fillColor: ExportService.PDF_STYLES.headerColor },
          alternateRowStyles: { fillColor: ExportService.PDF_STYLES.alternateRowColor },
          fontSize: ExportService.PDF_STYLES.fontSize.body,
          margin: { top: 20, bottom: 30 }
        });

        ExportService.addPDFFooter(doc);
        doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Sales report exported as PDF!');
      } catch (error) {
        console.error('Error exporting sales to PDF:', error);
        toast.error('Failed to export sales as PDF');
      }
    },

    toExcel: (salesData, period = 'All Time') => {
      try {
        const excelData = salesData.map(sale => ({
          'Customer Name': sale.customer?.name || 'Unknown Customer',
          'Customer Email': sale.customer?.email || '',
          'Sale Date': sale.createdAt || sale.date || '',
          'Items Sold': (sale.items || []).map(item => `${item.name} (${item.quantity})`).join('; '),
          'Total Amount': sale.totalAmount || 0,
          'Payment Method': sale.paymentMethod || '',
          'Status': sale.status || 'Completed',
          'Notes': sale.notes || '',
          'Sale ID': sale._id || sale.id || ''
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Sales');

        // Add summary sheet
        const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const summaryData = [
          ['Sales Summary', ''],
          ['Period', period],
          ['Total Sales', salesData.length],
          ['Total Revenue', `LKR ${totalRevenue.toFixed(2)}`],
          ['Average Sale', `LKR ${(totalRevenue / (salesData.length || 1)).toFixed(2)}`],
          ['Generated On', new Date().toLocaleString()]
        ];
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        const fileName = `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Sales report exported as Excel!');
      } catch (error) {
        console.error('Error exporting sales to Excel:', error);
        toast.error('Failed to export sales as Excel');
      }
    }
  };

  /**
   * Export Analytics Data
   */
  static exportAnalytics = {
    toPDF: (analyticsData) => {
      try {
        const doc = new jsPDF();
        const startY = ExportService.addPDFHeader(doc, 'Farm Analytics Report', 'Performance and Analytics Overview');
        
        // Add analytics sections
        let currentY = startY + 10;
        
        // Revenue analytics
        if (analyticsData.revenue) {
          doc.setFontSize(ExportService.PDF_STYLES.fontSize.subtitle);
          doc.text('Revenue Analytics', 20, currentY);
          currentY += 10;
          
          const revenueData = [
            ['Period', 'Revenue', 'Growth'],
            ['This Month', `LKR ${analyticsData.revenue.thisMonth || 0}`, `${analyticsData.revenue.monthlyGrowth || 0}%`],
            ['Last Month', `LKR ${analyticsData.revenue.lastMonth || 0}`, ''],
            ['This Year', `LKR ${analyticsData.revenue.thisYear || 0}`, `${analyticsData.revenue.yearlyGrowth || 0}%`]
          ];
          
          doc.autoTable({
            head: [revenueData[0]],
            body: revenueData.slice(1),
            startY: currentY,
            theme: 'grid',
            headStyles: { fillColor: ExportService.PDF_STYLES.headerColor },
            fontSize: ExportService.PDF_STYLES.fontSize.body
          });
          
          currentY = doc.lastAutoTable.finalY + 20;
        }

        ExportService.addPDFFooter(doc);
        doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Analytics report exported as PDF!');
      } catch (error) {
        console.error('Error exporting analytics to PDF:', error);
        toast.error('Failed to export analytics as PDF');
      }
    },

    toExcel: (analyticsData) => {
      try {
        const wb = XLSX.utils.book_new();
        
        // Revenue sheet
        if (analyticsData.revenue) {
          const revenueData = [
            ['Revenue Analytics', ''],
            ['This Month', analyticsData.revenue.thisMonth || 0],
            ['Last Month', analyticsData.revenue.lastMonth || 0],
            ['Monthly Growth', `${analyticsData.revenue.monthlyGrowth || 0}%`],
            ['This Year', analyticsData.revenue.thisYear || 0],
            ['Yearly Growth', `${analyticsData.revenue.yearlyGrowth || 0}%`]
          ];
          
          const revenueWs = XLSX.utils.aoa_to_sheet(revenueData);
          XLSX.utils.book_append_sheet(wb, revenueWs, 'Revenue');
        }

        // Summary sheet
        const summaryData = [
          ['Analytics Summary', ''],
          ['Report Generated', new Date().toLocaleString()],
          ['Farm Name', ExportService.COMPANY_INFO.name]
        ];
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        const fileName = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Analytics report exported as Excel!');
      } catch (error) {
        console.error('Error exporting analytics to Excel:', error);
        toast.error('Failed to export analytics as Excel');
      }
    }
  };

  /**
   * Generic export function for any data
   */
  static exportGeneric = {
    toPDF: (data, title, columns) => {
      try {
        const doc = new jsPDF();
        const startY = ExportService.addPDFHeader(doc, title, `Total Records: ${data.length}`);
        
        const tableData = data.map(item => 
          columns.map(col => {
            const value = col.accessor ? col.accessor(item) : item[col.key];
            return col.format ? col.format(value) : (value || '').toString();
          })
        );

        doc.autoTable({
          head: [columns.map(col => col.header)],
          body: tableData,
          startY: startY,
          theme: 'grid',
          headStyles: { fillColor: ExportService.PDF_STYLES.headerColor },
          alternateRowStyles: { fillColor: ExportService.PDF_STYLES.alternateRowColor },
          fontSize: ExportService.PDF_STYLES.fontSize.body,
          margin: { top: 20, bottom: 30 }
        });

        ExportService.addPDFFooter(doc);
        doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success(`${title} exported as PDF!`);
      } catch (error) {
        console.error(`Error exporting ${title} to PDF:`, error);
        toast.error(`Failed to export ${title} as PDF`);
      }
    },

    toExcel: (data, title, columns) => {
      try {
        const excelData = data.map(item => {
          const row = {};
          columns.forEach(col => {
            const value = col.accessor ? col.accessor(item) : item[col.key];
            row[col.header] = col.format ? col.format(value) : value;
          });
          return row;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, title);

        const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success(`${title} exported as Excel!`);
      } catch (error) {
        console.error(`Error exporting ${title} to Excel:`, error);
        toast.error(`Failed to export ${title} as Excel`);
      }
    }
  };

  /**
   * Utility function to get stock status text
   */
  static getStockStatusText(item) {
    const current = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
    const minimum = item.type === 'product' ? (item.stock?.minimum || 5) : (item.minQuantity || 5);
    const maximum = item.type === 'product' ? (item.stock?.maximum || 100) : (item.maxQuantity || 100);
    
    if (item.type === 'supply') {
      const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
      const needsMaintenance = item.status === 'maintenance';
      
      if (needsMaintenance) return 'Maintenance Required';
      if (isExpired) return 'Expired';
    }
    
    if (current === 0) return 'Out of Stock';
    if (current <= minimum) return 'Low Stock';
    if (current > maximum) return 'Overstocked';
    return 'In Stock';
  }

  /**
   * Export button component helper
   */
  static createExportButtons(onPDFExport, onExcelExport, loading = false) {
    return {
      pdf: {
        onClick: onPDFExport,
        disabled: loading,
        className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center",
        children: ['📄', ' Export PDF']
      },
      excel: {
        onClick: onExcelExport,
        disabled: loading,
        className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center",
        children: ['📊', ' Export Excel']
      }
    };
  }
}

export default ExportService;
