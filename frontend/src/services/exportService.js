import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { drawFarmNexPdfHeader as drawFarmHeader, addFarmNexFooter } from '../utils/exportUtils.js';

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
    const pageWidth = (doc.internal?.pageSize?.getWidth ? doc.internal.pageSize.getWidth() : (doc.internal?.pageSize?.width || 210));

    // Branded header drawn inline (logo tile + FarmNex + centered title + contact lines)
    const styles = (ExportService && ExportService.PDF_STYLES) ? ExportService.PDF_STYLES : {};
    const primary = Array.isArray(styles.headerColor) ? styles.headerColor : [34, 197, 94]; // green
    const dark = Array.isArray(styles.textColor) ? styles.textColor : [31, 41, 55];
    const gray = [107, 114, 128];

    const paddingX = 15;
    const topY = 12;
    const tileSize = 18;

    // Logo tile (rounded if available)
    doc.setFillColor(209, 250, 229); // greenLight
    try {
      if (typeof doc.roundedRect === 'function') {
        doc.roundedRect(paddingX, topY, tileSize, tileSize, 3, 3, 'F');
      } else {
        doc.rect(paddingX, topY, tileSize, tileSize, 'F');
      }
    } catch {
      doc.rect(paddingX, topY, tileSize, tileSize, 'F');
    }

    // Brand text
    const brandX = paddingX + tileSize + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...primary);
    const brandBaselineY = topY + tileSize / 2 + 3;
    doc.text('FarmNex', brandX, brandBaselineY);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...primary);
    let titleY = topY + tileSize + 10;
    doc.text(reportTitle || 'Report', pageWidth / 2, titleY, { align: 'center' });

    // Optional subtitle
    if (reportSubtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(75, 85, 99); // darkMedium
      const subY = titleY + 6;
      doc.text(String(reportSubtitle), pageWidth / 2, subY, { align: 'center' });
      titleY = subY;
    }

    // Contact info
    const contactY = titleY + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text('No 8, Temple Road, Beralapanathra, Sri Lanka', pageWidth / 2, contactY, { align: 'center' });
    doc.text('Tel: 0742331740  •  Email: farmnex@gmail.com', pageWidth / 2, contactY + 5, { align: 'center' });

    // Date/time and total records area will be added by callers; draw divider
    const bottomY = contactY + 15;
    doc.setDrawColor(209, 213, 219); // border
    doc.setLineWidth(0.8);
    doc.line(paddingX, bottomY, pageWidth - paddingX, bottomY);

    return bottomY; // Y where content should start after some spacing
  }

  /**
   * Add PDF footer with page numbers
   */
  static addPDFFooter(doc) {
    try {
      if (typeof addFarmNexFooter === 'function') {
        addFarmNexFooter(doc);
        return;
      }
    } catch {}

    // Fallback minimal footer
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const styles = (ExportService && ExportService.PDF_STYLES) ? ExportService.PDF_STYLES : {};
    const textColor = Array.isArray(styles.textColor) ? styles.textColor : [31, 41, 55];
    const fontSize = styles.fontSize || { title: 20, subtitle: 14, header: 12, body: 10, small: 8 };
    doc.setFontSize(fontSize.small);
    doc.setTextColor(...textColor);
    const pageNumber = doc.internal.getNumberOfPages();
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
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
autoTable(doc, {
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

autoTable(doc, {
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

autoTable(doc, {
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
        const safeData = Array.isArray(salesData) ? salesData : [];
        const doc = new jsPDF();
        const totalRevenue = safeData.reduce((sum, sale) => sum + (Number(sale.totalAmount) || 0), 0);

        // Draw branded header like product reports; fallback to simple header
        const pageWidth = (doc.internal?.pageSize?.getWidth ? doc.internal.pageSize.getWidth() : (doc.internal?.pageSize?.width || 210));
        let headerBottomY;
        try {
          if (typeof drawFarmHeader === 'function') {
            headerBottomY = drawFarmHeader(doc, 'Sales Report', pageWidth, {
              align: 'center',
              titleFontSize: 26,
              tileSize: 18,
              subtitle: `Period: ${period} | Total Revenue: LKR ${totalRevenue.toFixed(2)}`
            });
          }
        } catch {}
        if (!Number.isFinite(headerBottomY)) {
          headerBottomY = ExportService.addPDFHeader(doc, 'Sales Report', `Period: ${period} | Total Revenue: LKR ${totalRevenue.toFixed(2)}`) - 8; // addPDFHeader already adds spacing
        }
        // Meta line below header
        const metaY = headerBottomY + 8;
        doc.setFontSize(9);
        doc.setTextColor(31,41,55);
        const now = new Date();
        doc.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 15, metaY);
        doc.text(`Total Records: ${safeData.length}`, pageWidth - 15, metaY, { align: 'right' });
        const startY = headerBottomY + 18;

        // Safe style fallbacks to prevent undefined property access
        const __styles = (ExportService && ExportService.PDF_STYLES) ? ExportService.PDF_STYLES : {};
        const __headColor = Array.isArray(__styles.headerColor) ? __styles.headerColor : [34, 197, 94];
        const __altRowColor = Array.isArray(__styles.alternateRowColor) ? __styles.alternateRowColor : [249, 250, 251];
        const __bodyFont = (__styles.fontSize && typeof __styles.fontSize.body === 'number') ? __styles.fontSize.body : 10;
        
        let tableData = [];
        try {
          tableData = safeData.map(sale => {
            const dateStr = (() => {
              try { return new Date(sale.createdAt || sale.date).toLocaleDateString(); } catch { return ''; }
            })();
            const itemsStr = (Array.isArray(sale.items) ? sale.items : [])
              .map(it => `${it?.name ?? 'Item'} (${it?.quantity ?? 0})`)
              .join(', ');
            return [
              sale?.customer?.name || 'Unknown Customer',
              dateStr,
              itemsStr,
              `LKR ${(Number(sale.totalAmount) || 0).toFixed(2)}`,
              sale?.paymentMethod || 'Unknown',
              sale?.status || 'Completed'
            ];
          });
        } catch (mapErr) {
          console.error('Table data build error:', mapErr);
          tableData = [];
        }

        if (typeof autoTable === 'function') {
          autoTable(doc, {
            head: [['Customer', 'Date', 'Items', 'Total', 'Payment', 'Status']],
            body: tableData,
            startY: startY,
            theme: 'grid',
            headStyles: { fillColor: __headColor },
            alternateRowStyles: { fillColor: __altRowColor },
            styles: { fontSize: __bodyFont },
            margin: { top: 20, bottom: 30 }
          });
        } else {
          // Fallback simple list if autotable is not registered
          let y = startY;
          doc.setFontSize(__bodyFont);
          tableData.forEach((row, idx) => {
            const line = `${idx + 1}. ${row[0]} | ${row[1]} | ${row[3]} | ${row[5]}`;
            doc.text(line, 20, y);
            y += 6;
            if (y > doc.internal.pageSize.height - 20) { doc.addPage(); y = 20; }
          });
        }

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
        const rows = salesData.map(sale => ({
          'Customer': sale.customer?.name || 'Unknown Customer',
          'Date': new Date(sale.createdAt || sale.date).toLocaleString(),
          'Items': (sale.items || []).map(item => `${item.name} (${item.quantity})`).join(', '),
          'Total': sale.totalAmount || 0,
          'Payment Method': sale.paymentMethod || 'Unknown',
          'Status': sale.status || 'Completed'
        }));

        const totalRevenue = salesData.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Sales');

        const summaryData = [
          ['Sales Summary', ''],
          ['Period', period],
          ['Orders', salesData.length],
          ['Total Revenue', totalRevenue],
          ['Generated On', new Date().toLocaleString()]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

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
   * Export Orders Data
   */
  static exportOrders = {
    toPDF: (orderData, period = 'All Time') => {
      try {
        const safeData = Array.isArray(orderData) ? orderData : [];
        const doc = new jsPDF();
        const totalRevenue = safeData.reduce((sum, order) => sum + ((Number(order['Total Amount']?.replace('$', '')) || 0)), 0);
        const totalOrders = safeData.length;

        const pageWidth = (doc.internal?.pageSize?.getWidth ? doc.internal.pageSize.getWidth() : (doc.internal?.pageSize?.width || 210));
        let headerBottomY;
        try {
          if (typeof drawFarmHeader === 'function') {
            headerBottomY = drawFarmHeader(doc, 'Orders Report', pageWidth, {
              align: 'center',
              titleFontSize: 26,
              tileSize: 18,
              subtitle: `Period: ${period} | Total Orders: ${totalOrders} | Total Revenue: $${totalRevenue.toFixed(2)}`
            });
          }
        } catch {}
        if (!Number.isFinite(headerBottomY)) {
          headerBottomY = ExportService.addPDFHeader(doc, 'Orders Report', `Period: ${period} | Total Orders: ${totalOrders} | Total Revenue: $${totalRevenue.toFixed(2)}`);
        }
        
        // Meta line below header
        const metaY = headerBottomY + 8;
        doc.setFontSize(9);
        doc.setTextColor(31,41,55);
        const now = new Date();
        doc.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 15, metaY);
        doc.text(`Total Records: ${safeData.length}`, pageWidth - 15, metaY, { align: 'right' });
        const startY = headerBottomY + 18;

        // Safe style fallbacks
        const __styles = (ExportService && ExportService.PDF_STYLES) ? ExportService.PDF_STYLES : {};
        const __headColor = Array.isArray(__styles.headerColor) ? __styles.headerColor : [34, 197, 94];
        const __altRowColor = Array.isArray(__styles.alternateRowColor) ? __styles.alternateRowColor : [249, 250, 251];
        const __bodyFont = (__styles.fontSize && typeof __styles.fontSize.body === 'number') ? __styles.fontSize.body : 10;
        
        let tableData = [];
        try {
          tableData = safeData.map(order => [
            order['Order ID'] || '',
            order['Customer Name'] || '',
            order['Total Amount'] || '$0.00',
            order['Status'] || 'Unknown',
            order['Payment Method'] || 'Unknown',
            order['Order Date'] || ''
          ]);
        } catch (mapErr) {
          console.error('Order table data build error:', mapErr);
          tableData = [];
        }

        if (typeof autoTable === 'function') {
          autoTable(doc, {
            head: [['Order ID', 'Customer', 'Amount', 'Status', 'Payment', 'Date']],
            body: tableData,
            startY: startY,
            theme: 'grid',
            headStyles: { fillColor: __headColor },
            alternateRowStyles: { fillColor: __altRowColor },
            styles: { fontSize: __bodyFont },
            margin: { top: 20, bottom: 30 }
          });
        } else {
          // Fallback simple list if autotable is not registered
          let y = startY;
          doc.setFontSize(__bodyFont);
          tableData.forEach((row, idx) => {
            const line = `${idx + 1}. ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]}`;
            doc.text(line, 20, y);
            y += 6;
            if (y > doc.internal.pageSize.height - 20) { doc.addPage(); y = 20; }
          });
        }

        ExportService.addPDFFooter(doc);
        doc.save(`orders-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Orders report exported as PDF!');
      } catch (error) {
        console.error('Error exporting orders to PDF:', error);
        toast.error('Failed to export orders as PDF');
      }
    },

    toExcel: (orderData, period = 'All Time') => {
      try {
        const rows = Array.isArray(orderData) ? orderData : [];
        const totalRevenue = rows.reduce((sum, order) => {
          const amount = order['Total Amount']?.replace('$', '') || '0';
          return sum + (parseFloat(amount) || 0);
        }, 0);
        const totalOrders = rows.length;

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');

        const summaryData = [
          ['Orders Summary', ''],
          ['Period', period],
          ['Total Orders', totalOrders],
          ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
          ['Average Order Value', totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : '$0.00'],
          ['Generated On', new Date().toLocaleString()]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        const fileName = `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success('Orders report exported as Excel!');
      } catch (error) {
        console.error('Error exporting orders to Excel:', error);
        toast.error('Failed to export orders as Excel');
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
          
autoTable(doc, {
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
