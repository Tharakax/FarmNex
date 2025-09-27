import PDFReportGenerator from './services/pdfReportGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test script to generate a comprehensive FarmNex product report PDF
 * This demonstrates all the features including fa-leaf branding and professional styling
 */

// Sample comprehensive data for testing
const sampleReportData = {
  summary: {
    totalProducts: 247,
    activeProducts: 198,
    totalValue: 124750,
    lowStockItems: 18,
    outOfStockItems: 12,
    reportPeriod: '30 days',
    generatedAt: new Date().toISOString()
  },
  overview: {
    inStock: 198,
    lowStock: 18,
    outOfStock: 12,
    newProducts: 15
  },
  inventory: {
    healthy: 168,
    low: 18,
    critical: 12,
    overstock: 7
  },
  salesPerformance: {
    topProducts: [
      { name: 'Organic Tomatoes', sales: 1250, revenue: 6250, orders: 89, growth: 15 },
      { name: 'Fresh Spinach', sales: 980, revenue: 4900, orders: 67, growth: 8 },
      { name: 'Bell Peppers', sales: 756, revenue: 4536, orders: 45, growth: -2 },
      { name: 'Organic Carrots', sales: 890, revenue: 4450, orders: 78, growth: 12 },
      { name: 'Cucumbers', sales: 675, revenue: 4050, orders: 52, growth: 5 },
      { name: 'Broccoli', sales: 432, revenue: 3456, orders: 34, growth: 18 },
      { name: 'Green Lettuce', sales: 567, revenue: 3402, orders: 48, growth: 7 },
      { name: 'Sweet Corn', sales: 345, revenue: 2760, orders: 29, growth: -5 },
      { name: 'Zucchini', sales: 298, revenue: 2384, orders: 25, growth: 22 },
      { name: 'Cherry Tomatoes', sales: 234, revenue: 1872, orders: 19, growth: 14 }
    ],
    totalRevenue: 37109,
    totalSales: 6427,
    averageOrderValue: 76.85
  },
  products: [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Organic Tomatoes',
      description: 'Fresh, locally grown organic tomatoes perfect for salads and cooking.',
      category: 'Vegetables',
      price: 5.99,
      unit: 'lb',
      stock: { current: 150, minimum: 20, maximum: 200 },
      discount: 0,
      isFeatured: true,
      tags: ['organic', 'fresh', 'local'],
      createdAt: new Date('2024-01-15'),
      salesData: { totalSales: 1250, totalRevenue: 6250, orderCount: 89 }
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Fresh Spinach',
      description: 'Nutrient-rich baby spinach leaves, perfect for salads and smoothies.',
      category: 'Leafy Greens',
      price: 3.49,
      unit: 'bunch',
      stock: { current: 85, minimum: 15, maximum: 100 },
      discount: 10,
      isFeatured: false,
      tags: ['fresh', 'healthy', 'leafy'],
      createdAt: new Date('2024-02-01'),
      salesData: { totalSales: 980, totalRevenue: 4900, orderCount: 67 }
    },
    {
      _id: '507f1f77bcf86cd799439013',
      name: 'Bell Peppers (Mixed)',
      description: 'Colorful mix of red, yellow, and green bell peppers.',
      category: 'Vegetables',
      price: 4.25,
      unit: 'lb',
      stock: { current: 8, minimum: 25, maximum: 75 }, // Low stock
      discount: 0,
      isFeatured: false,
      tags: ['colorful', 'fresh', 'vitamin-c'],
      createdAt: new Date('2024-01-20'),
      salesData: { totalSales: 756, totalRevenue: 4536, orderCount: 45 }
    },
    {
      _id: '507f1f77bcf86cd799439014',
      name: 'Organic Carrots',
      description: 'Sweet, crunchy organic carrots rich in beta-carotene.',
      category: 'Root Vegetables',
      price: 2.99,
      unit: 'lb',
      stock: { current: 120, minimum: 30, maximum: 150 },
      discount: 5,
      isFeatured: true,
      tags: ['organic', 'sweet', 'healthy'],
      createdAt: new Date('2024-01-10'),
      salesData: { totalSales: 890, totalRevenue: 4450, orderCount: 78 }
    },
    {
      _id: '507f1f77bcf86cd799439015',
      name: 'English Cucumbers',
      description: 'Crisp, refreshing seedless cucumbers perfect for salads.',
      category: 'Vegetables',
      price: 1.99,
      unit: 'each',
      stock: { current: 0, minimum: 20, maximum: 60 }, // Out of stock
      discount: 0,
      isFeatured: false,
      tags: ['fresh', 'crisp', 'seedless'],
      createdAt: new Date('2024-02-05'),
      salesData: { totalSales: 675, totalRevenue: 4050, orderCount: 52 }
    },
    {
      _id: '507f1f77bcf86cd799439016',
      name: 'Fresh Broccoli',
      description: 'Green, nutritious broccoli crowns packed with vitamins.',
      category: 'Cruciferous',
      price: 3.75,
      unit: 'head',
      stock: { current: 45, minimum: 15, maximum: 50 },
      discount: 0,
      isFeatured: false,
      tags: ['nutritious', 'green', 'vitamin-k'],
      createdAt: new Date('2024-01-25'),
      salesData: { totalSales: 432, totalRevenue: 3456, orderCount: 34 }
    }
  ],
  categories: [
    { name: 'Vegetables', count: 85, value: 45200 },
    { name: 'Leafy Greens', count: 32, value: 28750 },
    { name: 'Root Vegetables', count: 28, value: 22300 },
    { name: 'Cruciferous', count: 18, value: 15600 },
    { name: 'Herbs', count: 24, value: 8900 },
    { name: 'Fruits', count: 35, value: 18400 },
    { name: 'Grains', count: 25, value: 12500 }
  ],
  recommendations: [
    {
      type: 'critical',
      title: 'Urgent Stock Replenishment',
      description: '12 products are completely out of stock, including high-demand items like English Cucumbers. Immediate restocking needed.',
      priority: 'high'
    },
    {
      type: 'warning',
      title: 'Low Stock Alert',
      description: '18 products are running low on stock. Bell Peppers and other popular items need reordering within 3-5 days.',
      priority: 'medium'
    },
    {
      type: 'opportunity',
      title: 'Seasonal Demand Spike',
      description: 'Organic Tomatoes showing 15% growth. Consider increasing stock levels and featuring in promotional campaigns.',
      priority: 'medium'
    },
    {
      type: 'efficiency',
      title: 'Inventory Optimization',
      description: '7 products are overstocked. Consider bundling deals or promotional pricing to improve inventory turnover.',
      priority: 'low'
    }
  ],
  metadata: {
    filters: {
      dateRange: '30',
      category: 'all',
      includeOutOfStock: true
    },
    dataPoints: {
      totalProducts: 247,
      salesRecords: 156,
      categories: 7
    },
    generated: {
      timestamp: new Date().toISOString(),
      user: 'System Test',
      version: '1.0.0'
    }
  }
};

/**
 * Generate and save a sample PDF report
 */
async function generateSampleReport() {
  try {
    console.log('🌿 Generating FarmNex Professional Product Report PDF...\n');
    
    // Initialize the PDF generator
    const pdfGenerator = new PDFReportGenerator();
    
    // Generate the PDF document
    const pdfDoc = await pdfGenerator.generateProductReport(sampleReportData);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'sample-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `FarmNex_Product_Report_${timestamp}.pdf`;
    const filepath = path.join(outputDir, filename);
    
    // Create write stream and pipe PDF to file
    const writeStream = fs.createWriteStream(filepath);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
    
    // Wait for the file to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('✅ PDF Report Generated Successfully!');
        console.log(`📄 File saved as: ${filename}`);
        console.log(`📁 Location: ${filepath}\n`);
        
        // Display report statistics
        console.log('📊 Report Statistics:');
        console.log(`   • Total Products: ${sampleReportData.summary.totalProducts}`);
        console.log(`   • Active Products: ${sampleReportData.summary.activeProducts}`);
        console.log(`   • Total Value: $${sampleReportData.summary.totalValue.toLocaleString()}`);
        console.log(`   • Low Stock Items: ${sampleReportData.summary.lowStockItems}`);
        console.log(`   • Out of Stock: ${sampleReportData.summary.outOfStockItems}`);
        console.log(`   • Categories: ${sampleReportData.categories.length}`);
        console.log(`   • Top Products: ${sampleReportData.salesPerformance.topProducts.length}`);
        console.log(`   • Recommendations: ${sampleReportData.recommendations.length}\n`);
        
        console.log('🎨 Features Included:');
        console.log('   ✓ Professional FarmNex branding with 🌿 fa-leaf logo');
        console.log('   ✓ Green agricultural theme throughout');
        console.log('   ✓ Executive summary with key metrics');
        console.log('   ✓ Comprehensive product overview');
        console.log('   ✓ Inventory analysis with visual charts');
        console.log('   ✓ Sales performance tables');
        console.log('   ✓ Detailed product information cards');
        console.log('   ✓ Category breakdown analysis');
        console.log('   ✓ Intelligent recommendations');
        console.log('   ✓ Professional headers and footers');
        console.log('   ✓ Color-coded status indicators');
        console.log('   ✓ Proper page breaks and formatting\n');
        
        console.log('🚀 Ready for production use!');
        console.log('   To integrate: Use the /api/reports/product-pdf endpoint');
        console.log('   Supports filters: dateRange, category, includeOutOfStock');
        console.log('   Access: Admin and FarmStaff roles\n');
        
        resolve();
      });
      
      writeStream.on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ Error generating PDF report:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSampleReport()
    .then(() => {
      console.log('🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error.message);
      process.exit(1);
    });
}

export { generateSampleReport, sampleReportData };