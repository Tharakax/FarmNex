import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Professional PDF Report Generator for FarmNex
 * Features:
 * - Professional green farm theme
 * - FontAwesome fa-leaf icons (via Unicode)
 * - Comprehensive product data
 * - Beautiful charts and tables
 * - Professional headers and footers
 */

// Color scheme - Professional green farm theme
const COLORS = {
  primary: '#059669',      // Emerald-600
  secondary: '#10b981',    // Emerald-500  
  accent: '#34d399',       // Emerald-400
  dark: '#064e3b',         // Emerald-900
  light: '#ecfdf5',        // Emerald-50
  text: '#374151',         // Gray-700
  textLight: '#6b7280',    // Gray-500
  white: '#ffffff',
  danger: '#dc2626',       // Red-600
  warning: '#f59e0b',      // Amber-500
  success: '#059669'       // Emerald-600
};

// Unicode symbols for professional icons (FontAwesome-style)
const ICONS = {
  leaf: '🌿',             // Leaf symbol for FarmNex branding
  chart: '📊',            // Chart symbol
  product: '📦',          // Product symbol
  stats: '📈',            // Statistics symbol
  inventory: '🏭',        // Inventory symbol
  sales: '💰',           // Sales symbol
  warning: '⚠️',          // Warning symbol
  check: '✅',            // Check symbol
  trend: '📊',            // Trend symbol
  calendar: '📅'          // Calendar symbol
};

class PDFReportGenerator {
  constructor() {
    this.doc = null;
    this.pageWidth = 612;   // Letter size
    this.pageHeight = 792;
    this.margin = 50;
    this.contentWidth = this.pageWidth - (2 * this.margin);
    this.currentY = this.margin;
  }

  /**
   * Generate comprehensive product report
   */
  async generateProductReport(reportData) {
    this.doc = new PDFDocument({
      size: 'LETTER',
      margin: this.margin,
      info: {
        Title: 'FarmNex Product Report',
        Author: 'FarmNex Agricultural Management System',
        Subject: 'Comprehensive Product Analysis & Inventory Report',
        Keywords: 'FarmNex, Agriculture, Products, Inventory, Report'
      }
    });

    // Start generating the report
    this.addHeader();
    this.addReportTitle();
    this.addExecutiveSummary(reportData.summary);
    this.addProductOverview(reportData.overview);
    this.addInventoryAnalysis(reportData.inventory);
    this.addSalesPerformance(reportData.salesPerformance);
    this.addProductDetails(reportData.products);
    this.addCategoryBreakdown(reportData.categories);
    this.addRecommendations(reportData.recommendations);
    this.addFooter();

    return this.doc;
  }

  /**
   * Add professional header with FarmNex branding
   */
  addHeader() {
    const headerHeight = 80;
    
    // Background gradient effect for header
    this.doc.rect(0, 0, this.pageWidth, headerHeight)
      .fillAndStroke(COLORS.primary, COLORS.primary);

    // FarmNex logo and branding
    this.doc.fillColor(COLORS.white)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text(`${ICONS.leaf} FarmNex`, this.margin, 25);

    this.doc.fontSize(12)
      .font('Helvetica')
      .text('Agricultural Management System', this.margin, 55);

    // Report date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    this.doc.fontSize(10)
      .text(`Generated: ${dateStr} at ${timeStr}`, this.pageWidth - 200, 35, {
        width: 150,
        align: 'right'
      });

    this.currentY = headerHeight + 20;
  }

  /**
   * Add report title section
   */
  addReportTitle() {
    this.doc.fillColor(COLORS.dark)
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('COMPREHENSIVE PRODUCT REPORT', this.margin, this.currentY, {
        align: 'center',
        width: this.contentWidth
      });

    this.currentY += 40;

    // Add decorative line
    this.doc.strokeColor(COLORS.primary)
      .lineWidth(3)
      .moveTo(this.margin + 100, this.currentY)
      .lineTo(this.pageWidth - this.margin - 100, this.currentY)
      .stroke();

    this.currentY += 30;
  }

  /**
   * Add executive summary section
   */
  addExecutiveSummary(summary) {
    this.addSectionHeader('Executive Summary', ICONS.chart);

    // Summary cards in a row
    const cardWidth = (this.contentWidth - 40) / 3;
    let startX = this.margin;

    const summaryCards = [
      { 
        title: 'Total Products', 
        value: summary.totalProducts || '0', 
        change: '+12%',
        color: COLORS.primary 
      },
      { 
        title: 'Total Value', 
        value: `$${(summary.totalValue || 0).toLocaleString()}`, 
        change: '+8.5%',
        color: COLORS.success 
      },
      { 
        title: 'Active Products', 
        value: summary.activeProducts || '0', 
        change: '+5%',
        color: COLORS.secondary 
      }
    ];

    summaryCards.forEach((card, index) => {
      const x = startX + (index * (cardWidth + 20));
      this.drawSummaryCard(x, this.currentY, cardWidth, 80, card);
    });

    this.currentY += 110;
  }

  /**
   * Draw individual summary card
   */
  drawSummaryCard(x, y, width, height, data) {
    // Card background
    this.doc.rect(x, y, width, height)
      .fillAndStroke(COLORS.light, COLORS.primary);

    // Card content
    this.doc.fillColor(data.color)
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(data.value, x + 15, y + 15, { width: width - 30, align: 'center' });

    this.doc.fillColor(COLORS.text)
      .fontSize(12)
      .font('Helvetica')
      .text(data.title, x + 15, y + 45, { width: width - 30, align: 'center' });

    this.doc.fillColor(COLORS.success)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(data.change, x + 15, y + 62, { width: width - 30, align: 'center' });
  }

  /**
   * Add product overview section
   */
  addProductOverview(overview) {
    this.checkPageBreak(200);
    this.addSectionHeader('Product Overview', ICONS.product);

    // Create overview metrics
    const metrics = [
      { label: 'Products in Stock', value: overview.inStock || 0, icon: ICONS.check },
      { label: 'Low Stock Items', value: overview.lowStock || 0, icon: ICONS.warning },
      { label: 'Out of Stock', value: overview.outOfStock || 0, icon: ICONS.danger },
      { label: 'New This Month', value: overview.newProducts || 0, icon: ICONS.trend }
    ];

    let startY = this.currentY;
    metrics.forEach((metric, index) => {
      const x = this.margin + ((index % 2) * (this.contentWidth / 2));
      const y = startY + (Math.floor(index / 2) * 40);

      this.doc.fillColor(COLORS.text)
        .fontSize(14)
        .font('Helvetica')
        .text(`${metric.icon} ${metric.label}: `, x, y);

      this.doc.fillColor(COLORS.primary)
        .font('Helvetica-Bold')
        .text(metric.value.toString(), x + 150, y);
    });

    this.currentY = startY + 100;
  }

  /**
   * Add inventory analysis section
   */
  addInventoryAnalysis(inventory) {
    this.checkPageBreak(250);
    this.addSectionHeader('Inventory Analysis', ICONS.inventory);

    // Inventory status chart (text-based)
    const statusData = [
      { status: 'Healthy Stock', count: inventory.healthy || 0, color: COLORS.success },
      { status: 'Low Stock', count: inventory.low || 0, color: COLORS.warning },
      { status: 'Critical Stock', count: inventory.critical || 0, color: COLORS.danger },
      { status: 'Overstock', count: inventory.overstock || 0, color: COLORS.textLight }
    ];

    const total = statusData.reduce((sum, item) => sum + item.count, 0);

    statusData.forEach((item, index) => {
      const y = this.currentY + (index * 30);
      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
      const barWidth = (this.contentWidth * 0.6) * (percentage / 100);

      // Status label
      this.doc.fillColor(COLORS.text)
        .fontSize(12)
        .font('Helvetica')
        .text(item.status, this.margin, y);

      // Progress bar background
      this.doc.rect(this.margin + 120, y + 2, this.contentWidth * 0.6, 16)
        .fillAndStroke(COLORS.light, COLORS.textLight);

      // Progress bar fill
      if (barWidth > 0) {
        this.doc.rect(this.margin + 120, y + 2, barWidth, 16)
          .fillAndStroke(item.color, item.color);
      }

      // Count and percentage
      this.doc.fillColor(COLORS.text)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`${item.count} (${percentage}%)`, this.margin + 120 + this.contentWidth * 0.6 + 10, y + 5);
    });

    this.currentY += (statusData.length * 30) + 30;
  }

  /**
   * Add sales performance section
   */
  addSalesPerformance(salesPerformance) {
    this.checkPageBreak(300);
    this.addSectionHeader('Sales Performance', ICONS.sales);

    // Top performing products table
    this.doc.fillColor(COLORS.text)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Top Performing Products', this.margin, this.currentY);

    this.currentY += 25;

    // Table headers
    const tableHeaders = ['Product Name', 'Sales', 'Revenue', 'Growth'];
    const colWidths = [200, 80, 100, 80];
    let startX = this.margin;

    // Header row
    this.doc.rect(startX, this.currentY, this.contentWidth, 25)
      .fillAndStroke(COLORS.primary, COLORS.primary);

    tableHeaders.forEach((header, index) => {
      const x = startX + colWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
      this.doc.fillColor(COLORS.white)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(header, x + 5, this.currentY + 8, { width: colWidths[index] - 10, align: 'left' });
    });

    this.currentY += 25;

    // Table data rows
    const topProducts = salesPerformance.topProducts || [];
    topProducts.slice(0, 10).forEach((product, index) => {
      const rowY = this.currentY + (index * 25);
      
      // Alternate row colors
      const bgColor = index % 2 === 0 ? COLORS.white : COLORS.light;
      this.doc.rect(startX, rowY, this.contentWidth, 25)
        .fillAndStroke(bgColor, COLORS.textLight);

      const rowData = [
        product.name || 'N/A',
        (product.sales || 0).toString(),
        `$${(product.revenue || 0).toLocaleString()}`,
        `${product.growth > 0 ? '+' : ''}${product.growth || 0}%`
      ];

      rowData.forEach((data, colIndex) => {
        const x = startX + colWidths.slice(0, colIndex).reduce((sum, w) => sum + w, 0);
        const textColor = colIndex === 3 ? 
          (product.growth >= 0 ? COLORS.success : COLORS.danger) : 
          COLORS.text;

        this.doc.fillColor(textColor)
          .fontSize(10)
          .font('Helvetica')
          .text(data, x + 5, rowY + 8, { width: colWidths[colIndex] - 10, align: 'left' });
      });
    });

    this.currentY += (Math.min(topProducts.length, 10) * 25) + 30;
  }

  /**
   * Add detailed product information
   */
  addProductDetails(products) {
    this.checkPageBreak(200);
    this.addSectionHeader('Product Details', ICONS.product);

    if (!products || products.length === 0) {
      this.doc.fillColor(COLORS.textLight)
        .fontSize(12)
        .font('Helvetica-Oblique')
        .text('No product details available.', this.margin, this.currentY);
      this.currentY += 40;
      return;
    }

    products.slice(0, 8).forEach((product, index) => {
      this.checkPageBreak(120);
      
      // Product card
      const cardHeight = 100;
      this.doc.rect(this.margin, this.currentY, this.contentWidth, cardHeight)
        .fillAndStroke(COLORS.light, COLORS.primary);

      // Product name and category
      this.doc.fillColor(COLORS.dark)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(product.name || 'Unknown Product', this.margin + 15, this.currentY + 15);

      this.doc.fillColor(COLORS.textLight)
        .fontSize(10)
        .font('Helvetica')
        .text(`Category: ${product.category || 'Uncategorized'}`, this.margin + 15, this.currentY + 35);

      // Stock status
      const stockStatus = this.getStockStatus(product.stock);
      this.doc.fillColor(stockStatus.color)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Stock: ${product.stock?.current || 0} ${product.unit || 'units'}`, this.margin + 15, this.currentY + 50);

      this.doc.fillColor(COLORS.textLight)
        .fontSize(9)
        .text(stockStatus.label, this.margin + 15, this.currentY + 65);

      // Price and value
      this.doc.fillColor(COLORS.primary)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`$${(product.price || 0).toFixed(2)}`, this.pageWidth - this.margin - 100, this.currentY + 15);

      this.doc.fillColor(COLORS.textLight)
        .fontSize(10)
        .font('Helvetica')
        .text(`Total Value: $${((product.stock?.current || 0) * (product.price || 0)).toFixed(2)}`, 
               this.pageWidth - this.margin - 120, this.currentY + 40);

      this.currentY += cardHeight + 15;
    });
  }

  /**
   * Add category breakdown section
   */
  addCategoryBreakdown(categories) {
    this.checkPageBreak(250);
    this.addSectionHeader('Category Analysis', ICONS.chart);

    if (!categories || categories.length === 0) {
      this.doc.fillColor(COLORS.textLight)
        .fontSize(12)
        .font('Helvetica-Oblique')
        .text('No category data available.', this.margin, this.currentY);
      this.currentY += 40;
      return;
    }

    // Category performance chart
    const totalValue = categories.reduce((sum, cat) => sum + (cat.value || 0), 0);

    categories.slice(0, 6).forEach((category, index) => {
      const y = this.currentY + (index * 35);
      const percentage = totalValue > 0 ? (category.value || 0) / totalValue * 100 : 0;
      const barWidth = (this.contentWidth * 0.5) * (percentage / 100);

      // Category name
      this.doc.fillColor(COLORS.text)
        .fontSize(12)
        .font('Helvetica')
        .text(category.name || 'Unknown', this.margin, y);

      // Progress bar
      this.doc.rect(this.margin + 150, y + 2, this.contentWidth * 0.5, 18)
        .fillAndStroke(COLORS.light, COLORS.textLight);

      if (barWidth > 0) {
        this.doc.rect(this.margin + 150, y + 2, barWidth, 18)
          .fillAndStroke(COLORS.primary, COLORS.primary);
      }

      // Value and percentage
      this.doc.fillColor(COLORS.text)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`$${(category.value || 0).toLocaleString()} (${percentage.toFixed(1)}%)`, 
               this.margin + 150 + this.contentWidth * 0.5 + 10, y + 5);
    });

    this.currentY += (Math.min(categories.length, 6) * 35) + 30;
  }

  /**
   * Add recommendations section
   */
  addRecommendations(recommendations) {
    this.checkPageBreak(200);
    this.addSectionHeader('Recommendations & Insights', ICONS.trend);

    const defaultRecommendations = [
      {
        type: 'stock',
        title: 'Stock Management',
        description: 'Monitor low stock items and implement automated reordering for critical products.',
        priority: 'high'
      },
      {
        type: 'sales',
        title: 'Sales Optimization',
        description: 'Focus marketing efforts on top-performing categories to maximize revenue.',
        priority: 'medium'
      },
      {
        type: 'inventory',
        title: 'Inventory Efficiency',
        description: 'Review overstocked items and consider promotional strategies to move inventory.',
        priority: 'medium'
      },
      {
        type: 'seasonal',
        title: 'Seasonal Planning',
        description: 'Analyze seasonal trends to better forecast demand and optimize stock levels.',
        priority: 'low'
      }
    ];

    const recs = recommendations && recommendations.length > 0 ? recommendations : defaultRecommendations;

    recs.forEach((rec, index) => {
      const priority = rec.priority || 'medium';
      const priorityColor = priority === 'high' ? COLORS.danger : 
                           priority === 'medium' ? COLORS.warning : COLORS.textLight;

      // Recommendation box
      this.doc.rect(this.margin, this.currentY, this.contentWidth, 50)
        .fillAndStroke(COLORS.light, priorityColor);

      // Priority indicator
      this.doc.rect(this.margin, this.currentY, 5, 50)
        .fillAndStroke(priorityColor, priorityColor);

      // Content
      this.doc.fillColor(COLORS.dark)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(rec.title || 'Recommendation', this.margin + 15, this.currentY + 10);

      this.doc.fillColor(COLORS.text)
        .fontSize(10)
        .font('Helvetica')
        .text(rec.description || 'No description available', this.margin + 15, this.currentY + 28, {
          width: this.contentWidth - 30
        });

      // Priority badge
      this.doc.fillColor(priorityColor)
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(priority.toUpperCase(), this.pageWidth - this.margin - 60, this.currentY + 10);

      this.currentY += 60;
    });
  }

  /**
   * Add section header with icon
   */
  addSectionHeader(title, icon) {
    this.doc.fillColor(COLORS.primary)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(`${icon} ${title}`, this.margin, this.currentY);

    this.currentY += 25;

    // Underline
    this.doc.strokeColor(COLORS.primary)
      .lineWidth(2)
      .moveTo(this.margin, this.currentY)
      .lineTo(this.margin + 300, this.currentY)
      .stroke();

    this.currentY += 15;
  }

  /**
   * Get stock status with color coding
   */
  getStockStatus(stock) {
    const current = stock?.current || 0;
    const minimum = stock?.minimum || 10;
    const maximum = stock?.maximum || 100;

    if (current === 0) {
      return { label: 'Out of Stock', color: COLORS.danger };
    } else if (current < minimum) {
      return { label: 'Low Stock - Reorder Soon', color: COLORS.warning };
    } else if (current > maximum) {
      return { label: 'Overstock', color: COLORS.textLight };
    } else {
      return { label: 'Healthy Stock Level', color: COLORS.success };
    }
  }

  /**
   * Check if we need a page break
   */
  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin - 60) {
      this.doc.addPage();
      this.addHeader();
      this.currentY = 100; // Start below header
    }
  }

  /**
   * Add professional footer
   */
  addFooter() {
    const footerY = this.pageHeight - 50;
    
    // Footer line
    this.doc.strokeColor(COLORS.primary)
      .lineWidth(1)
      .moveTo(this.margin, footerY)
      .lineTo(this.pageWidth - this.margin, footerY)
      .stroke();

    // Footer content
    this.doc.fillColor(COLORS.textLight)
      .fontSize(9)
      .font('Helvetica')
      .text(`${ICONS.leaf} FarmNex Agricultural Management System`, this.margin, footerY + 10);

    this.doc.text('Professional Farm Management Solutions', this.pageWidth - this.margin - 200, footerY + 10, {
      width: 180,
      align: 'right'
    });

    // Confidentiality notice
    this.doc.fontSize(8)
      .text('This report contains confidential business information. Unauthorized distribution is prohibited.', 
            this.margin, footerY + 25, {
              width: this.contentWidth,
              align: 'center'
            });
  }
}

export default PDFReportGenerator;