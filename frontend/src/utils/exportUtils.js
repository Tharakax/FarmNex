import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { faLeaf as faLeafIcon } from '@fortawesome/free-solid-svg-icons';

/**
 * Export utilities for PDF and Excel functionality with FarmNex branding
 */

// Test function removed - PDF generation should work normally


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
  greenLight: [209, 250, 229],    // Tailwind green-100
};

// Convert a FontAwesome icon definition to a PNG data URL using Canvas Path2D
// Works in browser runtimes; falls back gracefully if not supported
const renderFaIconToDataUrl = (faIconDef, size = 48, color = '#FFFFFF') => {
  try {
    if (typeof document === 'undefined') return null;
    const [iconW, iconH, , , svgPathData] = faIconDef.icon || [];
    if (!iconW || !iconH || !svgPathData) return null;

    const canvas = document.createElement('canvas');
    const scaleFactor = 2; // render hi-dpi then downscale into PDF for crispness
    canvas.width = size * scaleFactor;
    canvas.height = size * scaleFactor;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = color;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fit icon viewBox into the canvas with padding
    const padding = size * 0.15 * scaleFactor;
    const availableW = canvas.width - padding * 2;
    const availableH = canvas.height - padding * 2;
    const scale = Math.min(availableW / iconW, availableH / iconH);

    ctx.translate((canvas.width - iconW * scale) / 2, (canvas.height - iconH * scale) / 2);
    ctx.scale(scale, scale);

    // Support both string path and array of paths
    const drawPath = (pathStr) => {
      try {
        const p = new Path2D(pathStr);
        ctx.fill(p);
      } catch {
        // If Path2D with SVG string isn't supported, skip
      }
    };

    if (Array.isArray(svgPathData)) {
      svgPathData.forEach(drawPath);
    } else {
      drawPath(svgPathData);
    }

    return canvas.toDataURL('image/png');
  } catch (e) {
    return null;
  }
};

// Draw a header matching the web UI (leaf tile + FarmNex + title)
// Returns bottom Y position of the header area
export const drawFarmNexPdfHeader = (pdf, title, pageWidth, options = {}) => {
  try {
    console.log('Drawing PDF header:', { title, pageWidth, options });
  const paddingX = (options && options.paddingX) !== undefined ? options.paddingX : 15;
  const topY = (options && options.topY) !== undefined ? options.topY : 12;
  const tileSize = (options && options.tileSize) !== undefined ? options.tileSize : 16;
  const align = options.align || 'right'; // 'left' | 'center' | 'right'
  const titleSize = options.titleFontSize || 24; // larger, more prominent

  // Leaf tile (rounded square) with safe fallback if roundedRect is unavailable
  pdf.setFillColor(...BRAND_COLORS.greenLight);
  try {
    if (typeof pdf.roundedRect === 'function') {
      pdf.roundedRect(paddingX, topY, tileSize, tileSize, 3, 3, 'F');
    } else {
      pdf.rect(paddingX, topY, tileSize, tileSize, 'F');
    }
  } catch {
    pdf.rect(paddingX, topY, tileSize, tileSize, 'F');
  }

  // Try to render FontAwesome fa-leaf into the tile; fallback to vector glyph
  const iconDataUrl = renderFaIconToDataUrl(faLeafIcon, Math.round(tileSize * 1.2), '#16A34A');
  if (iconDataUrl) {
    const inset = 2; // padding inside the tile
    pdf.addImage(
      iconDataUrl,
      'PNG',
      paddingX + inset,
      topY + inset,
      tileSize - inset * 2,
      tileSize - inset * 2
    );
  } else {
    // Fallback: simple white leaf shape
    const cx = paddingX + tileSize / 2; // center x
    const cy = topY + tileSize / 2;     // center y
    pdf.setFillColor(...BRAND_COLORS.success); // green
    pdf.ellipse(cx, cy, tileSize * 0.28, tileSize * 0.18, 'F');
    // stem
    pdf.setDrawColor(...BRAND_COLORS.success);
    pdf.setLineWidth(1);
    pdf.line(cx - 2, cy + 3, cx + 3, cy - 3);
  }

  // FarmNex label - positioned at the exact center of the logo tile
  const brandX = paddingX + tileSize + 8;
  const brandFontSize = 20; // prominent system name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(brandFontSize);
  pdf.setTextColor(...BRAND_COLORS.primary);
  // Position at the exact center of the logo tile (accounting for text baseline)
  const tileCenterY = topY + (tileSize / 2);
  const textBaselineOffset = brandFontSize * 0.15; // even smaller offset for precise centering
  const brandBaselineY = tileCenterY + textBaselineOffset;
  pdf.text('FarmNex', brandX, brandBaselineY);

  // Title - placed below the brand row
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(titleSize);
  const titleColor = options.titleColor || BRAND_COLORS.primary;
  pdf.setTextColor(...titleColor);
  let titleY = topY + tileSize + 10; // below logo + brand name row
  if (align === 'center') {
    pdf.text(title || 'Report', pageWidth / 2, titleY, { align: 'center' });
  } else if (align === 'left') {
    pdf.text(title || 'Report', brandX, titleY, { align: 'left' });
  } else {
    pdf.text(title || 'Report', pageWidth - paddingX, titleY, { align: 'right' });
  }

  // Optional subtitle just below title
  if (options.subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize((titleSize || 24) - 12);
    pdf.setTextColor(...BRAND_COLORS.darkMedium);
    const subY = titleY + 6;
    if (align === 'center') {
      pdf.text(String(options.subtitle), pageWidth / 2, subY, { align: 'center' });
    } else if (align === 'left') {
      pdf.text(String(options.subtitle), brandX, subY, { align: 'left' });
    } else {
      pdf.text(String(options.subtitle), pageWidth - paddingX, subY, { align: 'right' });
    }
    titleY = subY; // push divider down a bit more
  }

  // Farm contact details below title/subtitle
  const contactY = titleY + 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...BRAND_COLORS.gray);
  
  const farmDetails = [
    'No 8, Temple Road, Beralapanathra, Sri Lanka',
    'Tel: 0742331740  •  Email: farmnex@gmail.com'
  ];
  
  farmDetails.forEach((detail, index) => {
    const detailY = contactY + (index * 5);
    if (align === 'center') {
      pdf.text(detail, pageWidth / 2, detailY, { align: 'center' });
    } else if (align === 'left') {
      pdf.text(detail, paddingX, detailY);
    } else {
      pdf.text(detail, pageWidth - paddingX, detailY, { align: 'right' });
    }
  });
  
  titleY = contactY + (farmDetails.length * 5); // Update titleY to account for contact details

  // Divider
  const bottomY = titleY + 10;
  pdf.setDrawColor(...BRAND_COLORS.border);
  pdf.setLineWidth(0.8);
  pdf.line(paddingX, bottomY, pageWidth - paddingX, bottomY);
  return bottomY;
  } catch (error) {
    console.error('Error in drawFarmNexPdfHeader:', error);
    // Return a safe default bottom Y position
    return (options.topY || 12) + 60;
  }
};

// Draw a compact summary block; returns bottom Y
const drawSummaryBlock = (pdf, startY, pageWidth, summary) => {
  const marginX = 15;
  const width = pageWidth - marginX * 2;
  const title = (summary && summary.title) || 'Summary';
  const rawMetrics = (summary && summary.metrics) || {};
  const metrics = Array.isArray(rawMetrics)
    ? rawMetrics
    : Object.entries(rawMetrics).map(([label, value]) => ({ label, value }));
  const sections = (summary && summary.sections) || [];

  let y = startY;

  // Container with better height calculation
  const containerHeight = 28;
  pdf.setDrawColor(...BRAND_COLORS.border);
  pdf.setFillColor(...BRAND_COLORS.grayVeryLight);
  pdf.roundedRect(marginX, y, width, containerHeight, 3, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(...BRAND_COLORS.dark);
  pdf.text(title, marginX + 8, y + 18);

  y += containerHeight + 8; // Better spacing after title

  // Metrics in two columns with better spacing
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const colW = Math.floor(width / 2);
  let colX = marginX + 5; // Add some left padding
  let rowY = y;
  const rowH = 7; // Increased row height for better spacing
  const metricsToShow = metrics.slice(0, 6); // Limit to 6 metrics for better layout
  
  metricsToShow.forEach((m, idx) => {
    pdf.setTextColor(...BRAND_COLORS.darkMedium);
    pdf.text(String(m.label), colX, rowY);
    pdf.setTextColor(...BRAND_COLORS.dark);
    pdf.text(String(m.value), colX + colW - 10, rowY, { align: 'right' });
    rowY += rowH;
    if ((idx + 1) % 3 === 0) { // Move to second column after 3 items
      colX = marginX + colW + 5;
      rowY = y;
    }
  });

  // Calculate bottom Y after metrics
  const metricsBottomY = y + Math.ceil(metricsToShow.length / 2) * rowH;
  let bottomY = metricsBottomY + 8;

  // Contents section with better positioning
  if (sections.length > 0) {
    const listX = marginX + 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...BRAND_COLORS.dark);
    pdf.text('Contents', listX, bottomY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...BRAND_COLORS.darkMedium);
    bottomY += 8;
    
    sections.slice(0, 4).forEach((s, i) => { // Limit to 4 items for better layout
      pdf.setFillColor(...BRAND_COLORS.primary);
      pdf.circle(listX + 3, bottomY - 2, 1.5, 'F');
      pdf.setTextColor(...BRAND_COLORS.darkMedium);
      pdf.text(String(s), listX + 8, bottomY);
      bottomY += 6;
    });
  }

  // Add more spacing before divider
  bottomY += 5;
  
  // Light divider
  pdf.setDrawColor(...BRAND_COLORS.border);
  pdf.line(marginX, bottomY, marginX + width, bottomY);

  return bottomY + 5; // Add extra spacing after summary block
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
export const exportToPDF = async (data, title, columns, filename = 'export', section = 'default', options = {}) => {
  try {
    console.log('Starting colorful PDF export with data:', data?.length || 0, 'items');
    console.log('Export parameters:', { title, filename, section, options });
    
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to export');
    }
    
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      throw new Error('No columns defined for export');
    }

    // Create PDF instance - use landscape for tables with many columns
    const orientation = (columns.length >= 8) ? 'l' : 'p'; // Landscape if 8+ columns
    const pdf = new jsPDF(orientation, 'mm', 'a4');

    // Optional cover page
    if (options && options.cover) {
      drawCoverPage(pdf, {
        title: options.cover.title || title,
        subtitle: options.cover.subtitle,
        version: options.cover.version,
        dateText: options.cover.dateText || new Date().toLocaleString()
      });
      pdf.addPage();
    }
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    console.log('PDF instance created, dimensions:', pageWidth, 'x', pageHeight);
    
    // Get section-specific colors
    const sectionColors = SECTION_COLORS[section] || SECTION_COLORS.default;
    const sectionPrimary = sectionColors.primary;
    const sectionAccent = sectionColors.accent;
    const sectionTitle = sectionColors.title;
    
// Header matching UI
const themeColor = (options && options.titleColor) || BRAND_COLORS.primary; // Force green titles unless overridden
const headerBottomY = drawFarmNexPdfHeader(pdf, title, pageWidth, { align: 'center', titleFontSize: 26, tileSize: 18, subtitle: (options && options.subtitle), titleColor: themeColor });

    // Professional metadata below header
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_COLORS.dark);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date();
    const metaY = headerBottomY + 8;
    pdf.text(`Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, metaY);
    pdf.text(`Total Records: ${data.length}`, pageWidth - 15, metaY, { align: 'right' });

    // Optional summary block before table
    let tableStartY = (typeof headerBottomY !== 'undefined' ? headerBottomY + 18 : 95);
    if (options && options.summary) {
      const bottom = drawSummaryBlock(pdf, metaY + 8, pageWidth, options.summary);
      tableStartY = bottom + 10;
    }
    
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
        } else if (col.key === 'status') {
          // Status column gets full text without truncation for better visibility
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
        startY: (pdf.lastAutoTable?.finalY ? pdf.lastAutoTable.finalY : tableStartY),
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
          const isLandscape = pageWidth > pageHeight; // Detect landscape orientation
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
          // 8 columns - optimized for landscape orientation with generous Supplier width
          if (isLandscape) {
            // Landscape layout with much more space available (297mm vs 210mm)
            return {
              ...baseStyles,
              0: { ...baseStyles[0], cellWidth: 15 }, // ID - slightly smaller
              1: { ...baseStyles[1], cellWidth: 35 }, // Name
              2: { cellWidth: 22 }, // Category
              3: { cellWidth: 18, halign: 'center' }, // Quantity
              4: { cellWidth: 15, halign: 'center' }, // Unit
              5: { cellWidth: 22, fontStyle: 'bold', halign: 'right' }, // Cost per Unit
              6: { cellWidth: 22, fontStyle: 'bold', halign: 'right' }, // Total Cost
              7: { cellWidth: 50, fontStyle: 'bold' }, // Supplier - VERY WIDE for full names
            };
            } else {
              // Portrait fallback (shouldn't be used for 8+ columns now)
              return {
                ...baseStyles,
                0: { ...baseStyles[0], cellWidth: 12 }, // ID
                1: { ...baseStyles[1], cellWidth: 26 }, // Name
                2: { cellWidth: 16 }, // Category
                3: { cellWidth: 22, fontSize: 6 }, // Description
                4: { cellWidth: 18, fontStyle: 'bold', halign: 'right' }, // Price
                5: { cellWidth: 14, halign: 'center' }, // Stock
                6: { cellWidth: 10, halign: 'center' }, // Unit
                7: { cellWidth: 45, halign: 'center', fontStyle: 'bold' }, // Status
              };
            }
          } else {
            // 9+ columns - landscape optimized layout
            if (isLandscape) {
              // Landscape layout for 9+ columns with excellent Supplier width
              return {
                ...baseStyles,
                0: { ...baseStyles[0], cellWidth: 12 }, // ID
                1: { ...baseStyles[1], cellWidth: 30 }, // Name
                2: { cellWidth: 18 }, // Type/Category
                3: { cellWidth: 16, halign: 'center' }, // Quantity
                4: { cellWidth: 12, halign: 'center' }, // Unit
                5: { cellWidth: 20, fontStyle: 'bold', halign: 'right' }, // Cost per Unit
                6: { cellWidth: 20, fontStyle: 'bold', halign: 'right' }, // Total Cost
                7: { cellWidth: 45, fontStyle: 'bold' }, // Supplier - VERY WIDE for full names
                8: { cellWidth: 18, halign: 'center' }, // Status
              };
            } else {
              // Portrait fallback for 9+ columns
              return {
                ...baseStyles,
                0: { ...baseStyles[0], cellWidth: 12 }, // ID
                1: { ...baseStyles[1], cellWidth: 26 }, // Name
                2: { cellWidth: 16 }, // Category
                3: { cellWidth: 28, fontSize: 6 }, // Description
                4: { cellWidth: 18, fontStyle: 'bold', halign: 'right' }, // Price
                5: { cellWidth: 14, halign: 'center' }, // Stock
                6: { cellWidth: 10, halign: 'center' }, // Unit
                7: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }, // Status
                8: { cellWidth: 24, fontSize: 7 }, // Date/Revenue/Rating
              };
            }
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
      let yPosition = (typeof headerBottomY !== 'undefined' ? headerBottomY + 20 : 95);
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
          } else if (columns.length === 8) {
            // Tighter spacing for 8 columns with proper Supplier column width
            if (headerLower.includes('id')) return 15;
            if (headerLower.includes('name')) return 35;
            if (headerLower.includes('type') || headerLower.includes('category')) return 22;
            if (headerLower.includes('quantity')) return 18;
            if (headerLower.includes('unit')) return 15;
            if (headerLower.includes('cost') || headerLower.includes('price')) return 22;
            if (headerLower.includes('supplier')) return 50; // MUCH LARGER WIDTH for full supplier names
            if (headerLower.includes('status')) return 20;
            return Math.max(18, availableWidth / totalCols);
        } else {
          // Very tight spacing for 9+ columns with wide supplier column
          if (headerLower.includes('id')) return 12;
          if (headerLower.includes('name')) return 30;
          if (headerLower.includes('type') || headerLower.includes('category')) return 18;
          if (headerLower.includes('quantity')) return 16;
          if (headerLower.includes('unit')) return 12;
          if (headerLower.includes('cost') || headerLower.includes('price')) return 20;
          if (headerLower.includes('supplier')) return 45; // MUCH LARGER WIDTH for full supplier names
          if (headerLower.includes('status')) return 18;
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
    
    // Professional summary section (positioned safely above footer)
    if (data.length > 0) {
      const finalY = pdf.lastAutoTable?.finalY || 200;
      const boxHeight = 25;
      const bottomMargin = 40; // keep clear of footer
      const gap = 10; // space after table
      let yTop = finalY + gap;
      
      // If not enough space on this page, move summary to the next page
      if (yTop + boxHeight > pageHeight - bottomMargin) {
        pdf.addPage();
        yTop = 40; // nice top margin on new page
      }
      
      // Clean summary border
      pdf.setDrawColor(...BRAND_COLORS.border);
      pdf.setLineWidth(1);
      pdf.rect(15, yTop, pageWidth - 30, boxHeight, 'S');
      
      // Summary title
      pdf.setFontSize(12);
      pdf.setTextColor(...BRAND_COLORS.dark);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORT SUMMARY', pageWidth / 2, yTop + 11, { align: 'center' });
      
      // Summary content
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total records: ${data.length} | Generated by FarmNex System`, pageWidth / 2, yTop + 19, { align: 'center' });
    }
    
    // Optional charts page appended
    if (options && options.charts) {
      try {
        pdf.addPage();
        const headerBottomY = drawFarmNexPdfHeader(pdf, 'Analytics Snapshots', pageWidth);
        const barSeries = (options.charts.bar || options.charts.pie || []).map(c => ({
          label: c.name || c.label,
          value: c.value || c.amount || 0,
          color: c.color
        }));
        const pieSeries = (options.charts.pie || options.charts.bar || []).map(c => ({
          label: c.name || c.label,
          value: c.value || c.amount || 0,
          color: c.color
        }));
        const barUrl = await renderBarChartToDataUrl(barSeries, 800, 320, {
          title: 'Products by Category',
          yLabel: 'Count',
          xLabel: 'Categories'
        });
const pieUrl = await renderDonutChartToDataUrl(pieSeries, 340, {
          title: 'Product Distribution',
          showLegend: false
        });
        const margin = 15;
        const colGap = 10;
        const topY = headerBottomY + 8;
        const footerReserve = 20;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = Math.max(60, pageHeight - topY - footerReserve);
        const leftWidth = Math.floor((availableWidth - colGap) * 0.58);
        const rightWidth = availableWidth - colGap - leftWidth;
        let usedHeight = 0;
        let barHeight = 0;
        if (barUrl) {
          const barAspect = 320 / 800;
          barHeight = Math.min(availableHeight * 0.9, leftWidth * barAspect);
          pdf.addImage(barUrl, 'PNG', margin, topY, leftWidth, barHeight);
          usedHeight = Math.max(usedHeight, barHeight);
        }
        if (pieUrl) {
          const size = Math.min(rightWidth, availableHeight * 0.7, 120);
          const x = margin + leftWidth + colGap + (rightWidth - size) / 2;
          const y = topY + Math.max(0, (usedHeight - size) / 2);
          pdf.addImage(pieUrl, 'PNG', x, y, size, size);
          usedHeight = Math.max(usedHeight, size);
        }
        // Legend below charts
        const legendTop = topY + usedHeight + 6;
        const legendBottomLimit = pageHeight - footerReserve - 6;
        const itemHeight = 6;
        const colWidth = Math.floor(availableWidth / 3);
        pdf.setFontSize(9);
        pdf.setTextColor(...BRAND_COLORS.dark);
        let legendY = Math.min(legendTop, legendBottomLimit - itemHeight);
        let legendX = margin;
        (pieSeries.slice(0, 9)).forEach((s, idx) => {
          if (legendY > legendBottomLimit) return;
          const color = s.color || ['#10B981','#F59E0B','#8B5CF6','#EF4444','#6B7280','#22C55E','#06B6D4','#A3A3A3','#22D3EE'][idx % 9];
          const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
          pdf.setFillColor(r,g,b);
          pdf.rect(legendX, legendY - 3, 4, 4, 'F');
          pdf.setTextColor(...BRAND_COLORS.dark);
          pdf.text(`${s.label} (${s.value}%)`, legendX + 8, legendY);
          legendX += colWidth;
          if (legendX > margin + availableWidth - colWidth + 1) {
            legendX = margin;
            legendY += itemHeight;
          }
        });
      } catch (e) {
        console.warn('Charts page generation (exportToPDF) failed:', e);
      }
    }

    // Apply optional watermark on all inner pages
    if (options && options.watermark) {
      applyWatermark(pdf, typeof options.watermark === 'string' ? options.watermark : 'FarmNex Confidential', (options.cover ? 2 : 1));
    }

    // Add branded footer and page numbers after all content is drawn
    addFarmNexFooter(pdf);

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
    
    // Set column widths with specific widths for different column types
    const columnWidths = columns.map(col => {
      const header = (col.header || '').toLowerCase();
      if (header.includes('id')) return { width: 12 };
      if (header.includes('name')) return { width: 25 };
      if (header.includes('supplier')) return { width: 30 }; // Much wider for supplier names
      if (header.includes('type') || header.includes('category')) return { width: 18 };
      if (header.includes('description')) return { width: 40 };
      if (header.includes('cost') || header.includes('price')) return { width: 15 };
      if (header.includes('quantity')) return { width: 12 };
      if (header.includes('unit')) return { width: 10 };
      if (header.includes('status')) return { width: 15 };
      if (header.includes('date')) return { width: 12 };
      return { width: 15 }; // Default width
    });
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
 * Detailed column set for inventory analysis (products + supplies)
 */
export const getInventoryDetailedColumns = () => [
  { header: 'Item Name', key: 'productName' },
  { header: 'Type', key: 'type' },
  { header: 'Category', key: 'category' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit', key: 'unit' },
  { header: 'Min', key: 'min' },
  { header: 'Max', key: 'max' },
  { header: 'Unit Price', key: 'pricePerUnit' },
  { header: 'Total Value', key: 'totalValue' },
  { header: 'Status', key: 'status' },
  { header: 'Supplier', key: 'supplier' },
  { header: 'Location', key: 'location' },
  { header: 'Purchase Date', key: 'purchaseDate' },
  { header: 'Expiry Date', key: 'expiryDate' },
  { header: 'Last Updated', key: 'lastUpdated' }
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
export const loadImageAsBase64 = (imageUrl, maxWidth = 800, maxHeight = 600) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate aspect ratio and fit within max dimensions
        let { width, height } = img;
        const aspectRatio = width / height;
        
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        // Set canvas size to calculated dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Clear canvas with white background to handle transparent images
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw image to canvas with proper scaling
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with higher quality
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        resolve(base64);
      } catch (error) {
        console.error('Error processing image:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', imageUrl, error);
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error(`Image load timeout: ${imageUrl}`));
    }, 10000); // 10 second timeout
    
    img.onload = (originalOnLoad => () => {
      clearTimeout(timeout);
      originalOnLoad();
    })(img.onload);
    
    img.onerror = (originalOnError => (error) => {
      clearTimeout(timeout);
      originalOnError(error);
    })(img.onerror);
    
    img.src = imageUrl;
  });
};

/**
 * Export products data to PDF as a compact table
 * @param {Array} data - Array of product objects
 * @param {string} title - Title for the PDF document
 * @param {Array} columns - Array of column definitions (not used in this version)
 * @param {string} filename - Filename without extension
 * @param {string} section - Section type for color theming
 */
export const exportProductsToCompactPDF = async (data, title, columns, filename = 'products_export', section = 'products', options = {}) => {
  try {
    console.log('Starting compact PDF table export...');
    
    // Validate input data
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to export');
    }
    
    // Create PDF instance in portrait mode for better table fitting
    const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait orientation
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    console.log('PDF instance created (portrait), dimensions:', pageWidth, 'x', pageHeight);
    
    // Get section colors
    const sectionColors = SECTION_COLORS[section] || SECTION_COLORS.default;
    const sectionPrimary = sectionColors.primary;
    
    // Header matching UI
const themeColor2 = (options && options.titleColor) || BRAND_COLORS.primary; // Force green titles unless overridden
const headerBottomY = drawFarmNexPdfHeader(pdf, title || 'Products Report', pageWidth, { align: 'center', titleFontSize: 26, tileSize: 18, subtitle: (options && options.subtitle), titleColor: themeColor2 });

    // Metadata
    pdf.setFontSize(8);
    pdf.setTextColor(...BRAND_COLORS.dark);
    const currentDate = new Date();
    const metaY = headerBottomY + 6;
    pdf.text(`Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, metaY);
    pdf.text(`Total Records: ${data.length}`, pageWidth - 15, metaY, { align: 'right' });
    
    // Prepare table data with compact columns
    const tableColumns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Product Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Stock Qty', dataKey: 'stockQuantity' },
      { header: 'Unit', dataKey: 'unit' },
      { header: 'Status', dataKey: 'status' }
    ];
    
    const tableData = data.map(product => {
      // Truncate long descriptions
      let description = product.description || '';
      if (description.length > 50) {
        description = description.substring(0, 47) + '...';
      }
      
      // Format price
      let price = '';
      if (product.price) {
        price = typeof product.price === 'string' ? product.price : `LKR ${product.price}`;
      }
      
      return {
        id: product.id || '...N/A',
        name: product.name || 'Unknown',
        category: (product.category || 'uncategorized').replace('-', ' '),
        description: description,
        price: price,
        stockQuantity: product.stockQuantity || 0,
        unit: product.unit || 'units',
        status: product.status || 'Unknown'
      };
    });
    
    // Add table using autoTable
    pdf.autoTable({
      head: [tableColumns.map(col => col.header)],
      body: tableData.map(row => tableColumns.map(col => row[col.dataKey] || '')),
      startY: headerBottomY + 16,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [51, 51, 51]
      },
      headStyles: {
        fillColor: sectionPrimary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 25 }, // Product Name
        2: { cellWidth: 20 }, // Category
        3: { cellWidth: 45 }, // Description
        4: { cellWidth: 25 }, // Price
        5: { cellWidth: 15 }, // Stock Qty
        6: { cellWidth: 15 }, // Unit
        7: { cellWidth: 20 }  // Status
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { left: 10, right: 10 },
      didDrawPage: function(data) {
        // Add footer to each page with contact details
        const pageNumber = pdf.internal.getNumberOfPages();
        pdf.setFontSize(7);
        pdf.setTextColor(...BRAND_COLORS.gray);
        pdf.text('FarmNex Farm Management System • No 8, Temple Road, Beralapanathra, Sri Lanka', 15, pageHeight - 14);
        pdf.text('Tel: 0742331740 • Email: farmnex@gmail.com', 15, pageHeight - 8);
        pdf.text(`Page ${data.pageNumber}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
      }
    });
    
    console.log('Compact PDF table generated successfully');
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return true;
    
  } catch (error) {
    console.error('Error exporting compact PDF table:', error);
    throw new Error(`Compact PDF Export Failed: ${error.message || 'Unknown error occurred'}`);
  }
};

// Helpers to render simple charts to images (browser only)
const renderBarChartToDataUrl = async (series, width = 800, height = 320, options = {}) => {
  try {
    if (typeof document === 'undefined') return null;
    const scale = options.scale || (typeof window !== 'undefined' && window.devicePixelRatio ? Math.max(2, window.devicePixelRatio * 1.5) : 2);

    // Typography options with larger defaults for better legibility
    const fonts = {
      title: options.titleFontSize || 28,
      ticks: options.tickFontSize || 16,
      labels: options.labelFontSize || 18,
      values: options.valueFontSize || 18,
    };

    const maxBarWidth = options.maxBarWidth || 200;
    const minBarWidth = options.minBarWidth || 40;

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;

    const title = options.title || 'Products by Category';
    const xLabel = options.xLabel || '';
    const yLabel = options.yLabel || 'Count';

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${fonts.title}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, width / 2, 10);

    // Plot area with more bottom room for 2-line labels
    const margin = { top: 40, right: 24, bottom: 84, left: 64 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    const x0 = margin.left, y0 = height - margin.bottom;

    // Gridlines + Y ticks
    const maxV = Math.max(1, ...series.map(s => s.value));
    const ticks = Math.max(3, Math.min(7, maxV));
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let t = 0; t <= ticks; t++) {
      const y = y0 - (plotH * t / ticks);
      const yPix = Math.round(y) + 0.5; // crisper horizontal lines
      ctx.beginPath();
      ctx.moveTo(x0, yPix);
      ctx.lineTo(x0 + plotW, yPix);
      ctx.stroke();

      // tick label
      ctx.fillStyle = '#4b5563';
      ctx.font = `${fonts.ticks}px sans-serif`;
      ctx.textAlign = 'right';
      const val = Math.round(maxV * t / ticks);
      ctx.fillText(String(val), x0 - 8, y - fonts.ticks / 2 + 4);
    }

    // Axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0, Math.round(y0)+0.5); ctx.lineTo(x0 + plotW, Math.round(y0)+0.5); // X axis
    ctx.moveTo(Math.round(x0)+0.5, y0); ctx.lineTo(Math.round(x0)+0.5, y0 - plotH); // Y axis
    ctx.stroke();

    // Bars: wider and centered when there are few categories
    const roughBar = plotW / Math.max(1, series.length * 1.2);
    const barW = Math.max(minBarWidth, Math.min(maxBarWidth, roughBar));
    const gap = Math.max(20, barW * 0.45);
    const totalBarsWidth = series.length * barW + (series.length - 1) * gap;
    let x = x0 + Math.max(0, (plotW - totalBarsWidth) / 2);

    series.forEach((s, i) => {
      const h = (s.value / maxV) * (plotH - 10);
      const y = y0 - h;
      const color = s.color || ['#10B981','#22C55E','#06B6D4','#F59E0B','#8B5CF6','#EF4444'][i % 6];
      // bar
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x)+0.5, y, Math.round(barW), h);

      // value label above bar
      ctx.fillStyle = '#111827';
      ctx.font = `bold ${fonts.values}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(s.value), x + barW/2, y - 6);

      // category label (horizontal; wrap to 2 lines if needed)
      ctx.fillStyle = '#374151';
      ctx.font = `${fonts.labels}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const xMid = x + barW/2;
      const maxW = Math.max(barW + 20, 80);
      const label = String(s.label || '');

      const words = label.split(/\s+/);
      let line1 = '';
      let line2 = '';
      for (const w of words) {
        const test = line1 ? line1 + ' ' + w : w;
        if (ctx.measureText(test).width <= maxW) {
          line1 = test;
        } else if (!line2) {
          line2 = w;
        } else {
          let candidate = line2 + ' ' + w;
          if (ctx.measureText(candidate).width <= maxW) {
            line2 = candidate;
          } else {
            // truncate last word
            while (ctx.measureText(candidate + '…').width > maxW && candidate.length > 0) {
              candidate = candidate.slice(0, -1);
            }
            line2 = candidate + '…';
            break;
          }
        }
      }
      if (!line1) line1 = label.length > 12 ? label.slice(0, 12) + '…' : label;
      if (line1 && !line2) {
        ctx.fillText(line1, xMid, y0 + 12);
      } else {
        ctx.fillText(line1, xMid, y0 + 6);
        ctx.fillText(line2, xMid, y0 + 24);
      }

      x += barW + gap;
    });

    // Axis labels
    if (xLabel) {
      ctx.fillStyle = '#6b7280';
      ctx.font = `${fonts.ticks}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(xLabel, x0 + plotW / 2, height - 10);
    }
    if (yLabel) {
      ctx.save();
      ctx.translate(18, margin.top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#6b7280';
      ctx.font = `${fonts.ticks}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }

    return canvas.toDataURL('image/png');
  } catch { return null; }
};

const renderDonutChartToDataUrl = async (series, size = 340, options = {}) => {
  try {
    if (typeof document === 'undefined') return null;
    const scale = options.scale || (typeof window !== 'undefined' && window.devicePixelRatio ? Math.max(2, window.devicePixelRatio * 1.5) : 2);
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(size * scale); canvas.height = Math.floor(size * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;

    const fonts = {
      title: options.titleFontSize || 28,
      percent: options.percentFontSize || 20,
      legend: options.legendFontSize || 14,
      center: options.centerFontSize || 18,
    };

    // Show in-canvas legend by default unless explicitly disabled
    const showLegend = options.showLegend !== false;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,size,size);

    const title = options.title || 'Products Distribution';
    // Title
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${fonts.title}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, size/2, 8);

    // Slightly smaller ring radius and lower center to add top clearance under the title
    const cx = size/2, cy = size/2 + 14, r = size/2 - 34, inner = r * 0.62;
    const total = series.reduce((a,b)=>a+(b.value||0),0) || 1;
    let start = -Math.PI/2;

    const colors = ['#10B981','#F59E0B','#8B5CF6','#EF4444','#6B7280','#22C55E','#06B6D4','#14B8A6'];
    series.forEach((s, i) => {
      const frac = Math.max(0, s.value || 0) / total;
      const end = start + frac * Math.PI * 2;
      const color = s.color || colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // percentage label: ALWAYS inside the ring
      const mid = (start + end) / 2;
      const pct = Math.round(frac * 100);
      // Dynamic font sizing so tiny slices still fit
      const base = fonts.percent;
      const scaled = Math.max(10, Math.min(base, Math.round(base * (0.65 + Math.sqrt(frac) * 0.6))));
      ctx.font = `bold ${scaled}px sans-serif`;

      // place between inner and outer radii for good clearance
      const labelR = inner + (r - inner) * 0.55;
      const rx = cx + Math.cos(mid) * labelR;
      const ry = cy + Math.sin(mid) * labelR;

      // outline + fill for contrast
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.strokeText(`${pct}%`, rx, ry);
      ctx.fillStyle = '#111827';
      ctx.fillText(`${pct}%`, rx, ry);

      start = end;
    });

    // cut inner hole
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI*2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Center text (total)
    ctx.fillStyle = '#374151';
    ctx.font = `bold ${fonts.center}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Total: ${total}`, cx, cy);

// Legend (optional)
    if (showLegend) {
      const legendX = 10, legendY = size - 12 - Math.min(series.length, 6) * 18;
      ctx.font = `${fonts.legend}px sans-serif`;
      series.slice(0, 8).forEach((s, i) => {
        const color = s.color || colors[i % colors.length];
        const y = legendY + i * 18;
        ctx.fillStyle = color;
        ctx.fillRect(legendX, y - 10, 12, 12);
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText(`${s.label} (${s.value})`, legendX + 16, y);
      });
    }

    return canvas.toDataURL('image/png');
  } catch { return null; }
};

// Add branded FarmNex footer with page numbers on all pages
export const addFarmNexFooter = (pdf) => {
  const pageCount = pdf.internal.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Footer border
    pdf.setDrawColor(...BRAND_COLORS.border);
    pdf.setLineWidth(0.5);
    pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

    // Page numbering and footer
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_COLORS.gray);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Company info with contact details
    pdf.setFontSize(7);
    pdf.text('FarmNex Farm Management System • No 8, Temple Road, Beralapanathra, Sri Lanka', 15, pageHeight - 12);
    pdf.text('Tel: 0742331740 • Email: farmnex@gmail.com', 15, pageHeight - 6);
    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated: ${timestamp}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
  }
};

// Draw a simple cover page
const drawCoverPage = (pdf, opts = {}) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  // Header-like brand at top
  drawFarmNexPdfHeader(pdf, opts.title || 'Report', pageWidth, { align: 'center', titleFontSize: 28, subtitle: opts.subtitle });
  // Center block
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(...BRAND_COLORS.dark);
  pdf.text(opts.title || 'Report', pageWidth / 2, pageHeight * 0.48, { align: 'center' });
  if (opts.subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(...BRAND_COLORS.darkMedium);
    pdf.text(String(opts.subtitle), pageWidth / 2, pageHeight * 0.48 + 10, { align: 'center' });
  }
  // Meta at bottom center
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...BRAND_COLORS.gray);
  const meta = `${opts.dateText || new Date().toLocaleString()}${opts.version ? ' • v' + opts.version : ''}`;
  pdf.text(meta, pageWidth / 2, pageHeight - 20, { align: 'center' });
};

// Apply watermark text from a given start page
const applyWatermark = (pdf, text = 'FarmNex Confidential', startPage = 1) => {
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = startPage; i <= pageCount; i++) {
    pdf.setPage(i);
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(36);
    pdf.setTextColor(200, 200, 200);
    // Diagonal across the page
    pdf.text(text, w / 2, h / 2, { align: 'center', angle: 45 });
  }
};

/**
 * Export products data to PDF with embedded images
 * @param {Array} data - Array of product objects with image URLs
 * @param {string} title - Title for the PDF document
 * @param {Array} columns - Array of column definitions
 * @param {string} filename - Filename without extension
 * @param {string} section - Section type for color theming
 */
export const exportProductsToPDFWithImages = async (data, title, columns, filename = 'products_export', section = 'products', options = {}) => {
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
    
    // Header matching UI
const themeColor3 = (options && options.titleColor) || BRAND_COLORS.primary; // Force green titles unless overridden
const headerBottomY = drawFarmNexPdfHeader(pdf, title || 'Products Report with Images', pageWidth, { align: 'center', titleFontSize: 26, tileSize: 18, subtitle: (options && options.subtitle), titleColor: themeColor3 });

    // Metadata
    pdf.setFontSize(9);
    pdf.setTextColor(...BRAND_COLORS.dark);
    const currentDate = new Date();
    const metaY = headerBottomY + 8;
    pdf.text(`Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, metaY);
    pdf.text(`Total Records: ${data.length}`, pageWidth - 15, metaY, { align: 'right' });

    // Optional summary block
    let yPosition = headerBottomY + 20;
    if (options && options.summary) {
      const bottom = drawSummaryBlock(pdf, metaY + 8, pageWidth, options.summary);
      yPosition = bottom + 10;
    }
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
      
  // Product container background (fallback if roundedRect unavailable)
      pdf.setFillColor(248, 249, 250);
      try {
        if (typeof pdf.roundedRect === 'function') {
          pdf.roundedRect(leftMargin, yPosition, contentWidth, itemHeight, 3, 3, 'F');
        } else {
          pdf.rect(leftMargin, yPosition, contentWidth, itemHeight, 'F');
        }
      } catch {
        pdf.rect(leftMargin, yPosition, contentWidth, itemHeight, 'F');
      }
      
      // Product container border
      pdf.setDrawColor(...BRAND_COLORS.border);
      pdf.setLineWidth(0.5);
      try {
        if (typeof pdf.roundedRect === 'function') {
          pdf.roundedRect(leftMargin, yPosition, contentWidth, itemHeight, 3, 3, 'S');
        } else {
          pdf.rect(leftMargin, yPosition, contentWidth, itemHeight, 'S');
        }
      } catch {
        pdf.rect(leftMargin, yPosition, contentWidth, itemHeight, 'S');
      }
      
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
        pdf.text(`Revenue: LKR ${product.revenue.toLocaleString()}`, infoStartX + 80, yPosition + 35);
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
    
    // Optional charts page
    if (options && options.charts) {
      try {
        pdf.addPage();
        const headerBottomY = drawFarmNexPdfHeader(pdf, 'Analytics Snapshots', pageWidth);

        // Prepare chart images from data
        const barSeries = (options.charts.bar || options.charts.pie || []).map((c) => ({
          label: c.name || c.label,
          value: c.value || c.amount || 0,
          color: c.color
        }));
        const pieSeries = (options.charts.pie || options.charts.bar || []).map((c) => ({
          label: c.name || c.label,
          value: c.value || c.amount || 0,
          color: c.color
        }));

        const barUrl = await renderBarChartToDataUrl(barSeries, 800, 320, {
          title: 'Products by Category',
          yLabel: 'Count',
          xLabel: 'Categories'
        });
const pieUrl = await renderDonutChartToDataUrl(pieSeries, 340, {
          title: 'Product Distribution',
          showLegend: false
        });

        const margin = 15;
        const colGap = 10;
        const topY = headerBottomY + 8;
        const footerReserve = 20;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = Math.max(60, pageHeight - topY - footerReserve);
        const leftWidth = Math.floor((availableWidth - colGap) * 0.58);
        const rightWidth = availableWidth - colGap - leftWidth;

        // Bar chart on the left
        let usedHeight = 0;
        let barHeight = 0;
        if (barUrl) {
          const barAspect = 320 / 800; // h/w
          barHeight = Math.min(availableHeight * 0.9, leftWidth * barAspect);
          pdf.addImage(barUrl, 'PNG', margin, topY, leftWidth, barHeight);
          usedHeight = Math.max(usedHeight, barHeight);
        }

        // Pie chart on the right
        let pieSize = 0;
        if (pieUrl) {
          pieSize = Math.min(rightWidth, availableHeight * 0.7, 120);
          const x = margin + leftWidth + colGap + (rightWidth - pieSize) / 2;
          const y = topY + Math.max(0, (usedHeight - pieSize) / 2);
          pdf.addImage(pieUrl, 'PNG', x, y, pieSize, pieSize);
          usedHeight = Math.max(usedHeight, pieSize);
        }

        // Legend below charts, within page bounds
        const legendTop = topY + usedHeight + 6;
        const legendBottomLimit = pageHeight - footerReserve - 6;
        const itemHeight = 6;
        const colWidth = Math.floor(availableWidth / 3);
        pdf.setFontSize(9);
        pdf.setTextColor(...BRAND_COLORS.dark);
        let legendY = Math.min(legendTop, legendBottomLimit - itemHeight);
        let legendX = margin;
        (pieSeries.slice(0, 9)).forEach((s, idx) => {
          if (legendY > legendBottomLimit) return; // stop if no space
          const color = s.color || ['#10B981','#F59E0B','#8B5CF6','#EF4444','#6B7280','#22C55E','#06B6D4','#A3A3A3','#22D3EE'][idx % 9];
          const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
          pdf.setFillColor(r,g,b);
          pdf.rect(legendX, legendY - 3, 4, 4, 'F');
          pdf.setTextColor(...BRAND_COLORS.dark);
          pdf.text(`${s.label} (${s.value}%)`, legendX + 8, legendY);
          // Next column
          legendX += colWidth;
          if (legendX > margin + availableWidth - colWidth + 1) {
            legendX = margin;
            legendY += itemHeight;
          }
        });
      } catch (e) {
        console.warn('Charts page generation failed:', e);
      }
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
      
      // Footer info with contact details
      pdf.setFontSize(7);
      pdf.text('FarmNex Farm Management System • No 8, Temple Road, Beralapanathra, Sri Lanka', 15, pageHeight - 12);
      pdf.text('Tel: 0742331740 • Email: farmnex@gmail.com', 15, pageHeight - 6);
      const timestamp = new Date().toLocaleString();
      pdf.text(`Generated: ${timestamp}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
    }
    
    // Apply optional watermark
    if (options && options.watermark) {
      applyWatermark(pdf, typeof options.watermark === 'string' ? options.watermark : 'FarmNex Confidential', (options.cover ? 2 : 1));
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
  exportProductsToCompactPDF,
  formatCurrency,
  formatDate,
  getInventoryColumns,
  getInventoryDetailedColumns,
  getSuppliesColumns,
  getProductsColumns,
  getSalesColumns,
  processDataForExport,
  drawFarmNexPdfHeader,
  addFarmNexFooter,
  drawSummaryBlock,
  drawCoverPage,
  applyWatermark,
  renderBarChartToDataUrl,
  renderDonutChartToDataUrl
};

export { drawSummaryBlock, drawCoverPage, applyWatermark, renderBarChartToDataUrl, renderDonutChartToDataUrl };
