import Product from '../models/product.js';
import Order from '../models/order.js';
import PDFReportGenerator from '../services/pdfReportGenerator.js';

/**
 * PDF Report Controller for FarmNex
 * Generates comprehensive product reports in PDF format
 * with professional styling, fa-leaf branding, and detailed analytics
 */

/**
 * Generate comprehensive product report PDF
 * @route GET /api/reports/product-pdf
 * @access Private (Admin/FarmStaff)
 */
export const generateProductReportPDF = async (req, res) => {
  try {
    // 🔒 CRITICAL SECURITY CHECK: Authentication required
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // 🔒 SECURITY CHECK: Admin or FarmStaff access only
    const allowedRoles = ['admin', 'Admin', 'superadmin', 'FarmStaff'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or FarmStaff privileges required for product reports.'
      });
    }

    console.log('Generating comprehensive product report PDF for user:', req.user.email);

    // Get query parameters
    const { 
      dateRange = '30', 
      category = 'all',
      includeOutOfStock = 'true',
      format = 'detailed' 
    } = req.query;

    // Collect comprehensive data for the report
    const reportData = await collectProductReportData(dateRange, category, includeOutOfStock === 'true');

    // Generate the PDF
    const pdfGenerator = new PDFReportGenerator();
    const pdfDoc = await pdfGenerator.generateProductReport(reportData);

    // Set response headers for PDF download
    const filename = `FarmNex_Product_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfDoc.length);

    // Pipe the PDF to the response
    pdfDoc.pipe(res);
    pdfDoc.end();

    console.log('PDF report generated successfully:', filename);

  } catch (error) {
    console.error('Error generating product report PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate product report PDF',
      error: error.message
    });
  }
};

/**
 * Collect comprehensive data for the product report
 */
async function collectProductReportData(dateRange, category, includeOutOfStock) {
  const daysAgo = parseInt(dateRange);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  // Build product query filter
  let productFilter = {};
  if (category !== 'all') {
    productFilter.category = category;
  }
  if (!includeOutOfStock) {
    productFilter['stock.current'] = { $gt: 0 };
  }

  // Fetch all products
  const products = await Product.find(productFilter).sort({ createdAt: -1 });

  // Get sales data for the period
  const salesData = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] }
      }
    },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.productId',
        productName: { $first: '$products.name' },
        totalSales: { $sum: '$products.quantity' },
        totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  // Create sales lookup map
  const salesMap = {};
  salesData.forEach(sale => {
    salesMap[sale._id] = sale;
  });

  // Calculate comprehensive metrics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => (p.stock?.current || 0) > 0).length;
  const lowStockProducts = products.filter(p => {
    const current = p.stock?.current || 0;
    const minimum = p.stock?.minimum || 10;
    return current > 0 && current < minimum;
  });
  const outOfStockProducts = products.filter(p => (p.stock?.current || 0) === 0);
  const overstockProducts = products.filter(p => {
    const current = p.stock?.current || 0;
    const maximum = p.stock?.maximum || 100;
    return current > maximum;
  });

  // Calculate total inventory value
  const totalValue = products.reduce((sum, product) => {
    const stock = product.stock?.current || 0;
    const price = product.price || 0;
    return sum + (stock * price);
  }, 0);

  // Get category breakdown
  const categoryBreakdown = {};
  products.forEach(product => {
    const category = product.category || 'Uncategorized';
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = {
        name: category,
        count: 0,
        value: 0,
        products: []
      };
    }
    categoryBreakdown[category].count += 1;
    categoryBreakdown[category].value += (product.stock?.current || 0) * (product.price || 0);
    categoryBreakdown[category].products.push(product);
  });

  const categories = Object.values(categoryBreakdown).sort((a, b) => b.value - a.value);

  // Prepare top performing products with growth calculation
  const topProducts = salesData.slice(0, 10).map(sale => ({
    name: sale.productName,
    sales: sale.totalSales,
    revenue: sale.totalRevenue,
    orders: sale.orderCount,
    growth: Math.round((Math.random() * 40) - 10) // Mock growth - replace with actual calculation
  }));

  // Enhanced product details with sales integration
  const enhancedProducts = products.map(product => {
    const salesInfo = salesMap[product._id];
    return {
      ...product.toObject(),
      salesData: salesInfo ? {
        totalSales: salesInfo.totalSales,
        totalRevenue: salesInfo.totalRevenue,
        orderCount: salesInfo.orderCount
      } : {
        totalSales: 0,
        totalRevenue: 0,
        orderCount: 0
      }
    };
  });

  // Generate intelligent recommendations
  const recommendations = generateRecommendations(products, salesData, {
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,
    overstockCount: overstockProducts.length
  });

  // Return comprehensive report data
  return {
    summary: {
      totalProducts,
      activeProducts,
      totalValue,
      lowStockItems: lowStockProducts.length,
      outOfStockItems: outOfStockProducts.length,
      reportPeriod: `${dateRange} days`,
      generatedAt: new Date().toISOString()
    },
    overview: {
      inStock: activeProducts,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      newProducts: products.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= startDate;
      }).length
    },
    inventory: {
      healthy: products.filter(p => {
        const current = p.stock?.current || 0;
        const minimum = p.stock?.minimum || 10;
        const maximum = p.stock?.maximum || 100;
        return current >= minimum && current <= maximum && current > 0;
      }).length,
      low: lowStockProducts.length,
      critical: outOfStockProducts.length,
      overstock: overstockProducts.length
    },
    salesPerformance: {
      topProducts,
      totalRevenue: salesData.reduce((sum, sale) => sum + sale.totalRevenue, 0),
      totalSales: salesData.reduce((sum, sale) => sum + sale.totalSales, 0),
      averageOrderValue: salesData.length > 0 ? 
        salesData.reduce((sum, sale) => sum + sale.totalRevenue, 0) / salesData.length : 0
    },
    products: enhancedProducts.slice(0, 15), // Top 15 products for detailed display
    categories,
    recommendations,
    metadata: {
      filters: {
        dateRange,
        category,
        includeOutOfStock
      },
      dataPoints: {
        totalProducts: products.length,
        salesRecords: salesData.length,
        categories: categories.length
      },
      generated: {
        timestamp: new Date().toISOString(),
        user: 'System', // Can be enhanced to include actual user info
        version: '1.0.0'
      }
    }
  };
}

/**
 * Generate intelligent recommendations based on data analysis
 */
function generateRecommendations(products, salesData, stockMetrics) {
  const recommendations = [];

  // Stock management recommendations
  if (stockMetrics.outOfStockCount > 0) {
    recommendations.push({
      type: 'critical',
      title: 'Critical Stock Alert',
      description: `${stockMetrics.outOfStockCount} products are out of stock. Immediate restocking required to prevent revenue loss.`,
      priority: 'high',
      actionItems: ['Review supplier lead times', 'Implement emergency procurement', 'Set up stock alerts']
    });
  }

  if (stockMetrics.lowStockCount > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Low Stock Warning',
      description: `${stockMetrics.lowStockCount} products are running low. Schedule reorders before stockouts occur.`,
      priority: 'medium',
      actionItems: ['Create purchase orders', 'Review minimum thresholds', 'Contact suppliers']
    });
  }

  // Sales performance recommendations
  if (salesData.length > 0) {
    const topPerformer = salesData[0];
    recommendations.push({
      type: 'opportunity',
      title: 'Top Performer Optimization',
      description: `${topPerformer.productName} is your top performer with $${topPerformer.totalRevenue.toLocaleString()} revenue. Consider expanding this product line.`,
      priority: 'medium',
      actionItems: ['Increase stock levels', 'Expand product variants', 'Feature in marketing']
    });
  }

  // Inventory efficiency recommendations
  if (stockMetrics.overstockCount > 0) {
    recommendations.push({
      type: 'efficiency',
      title: 'Inventory Optimization',
      description: `${stockMetrics.overstockCount} products are overstocked. Consider promotional strategies to improve inventory turnover.`,
      priority: 'low',
      actionItems: ['Create promotional campaigns', 'Review demand forecasting', 'Adjust maximum thresholds']
    });
  }

  // Seasonal planning recommendation
  recommendations.push({
    type: 'planning',
    title: 'Seasonal Planning',
    description: 'Analyze seasonal trends and adjust inventory levels accordingly. Prepare for upcoming seasonal demand changes.',
    priority: 'medium',
    actionItems: ['Review historical data', 'Plan seasonal campaigns', 'Adjust safety stock levels']
  });

  return recommendations;
}

/**
 * Get available report categories
 * @route GET /api/reports/categories
 * @access Private
 */
export const getReportCategories = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get unique categories from products
    const categories = await Product.distinct('category');
    
    res.status(200).json({
      success: true,
      data: {
        categories: categories.filter(cat => cat && cat.trim() !== ''),
        totalCategories: categories.length
      }
    });

  } catch (error) {
    console.error('Error fetching report categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report categories',
      error: error.message
    });
  }
};

/**
 * Get report generation status/history
 * @route GET /api/reports/status
 * @access Private (Admin only)
 */
export const getReportStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!['admin', 'Admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Mock report generation history (in production, store in database)
    const reportHistory = [
      {
        id: 1,
        type: 'Product Report',
        generatedAt: new Date(Date.now() - 86400000).toISOString(),
        user: 'admin@farmnex.com',
        status: 'completed',
        downloadCount: 5
      },
      {
        id: 2,
        type: 'Inventory Analysis',
        generatedAt: new Date(Date.now() - 172800000).toISOString(),
        user: 'farm@farmnex.com',
        status: 'completed',
        downloadCount: 2
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        totalReports: reportHistory.length,
        recentReports: reportHistory,
        supportedFormats: ['PDF'],
        systemStatus: 'operational'
      }
    });

  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report status',
      error: error.message
    });
  }
};