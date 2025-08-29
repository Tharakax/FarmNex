import Product from '../models/product.js';
import Order from '../models/order.js';
import FarmSupply from '../models/farmSupply.js';

/**
 * Report Controller
 * Handles all report-related operations including sales, inventory, products, and supplies reports
 */

// Get Sales Report Data
export const getSalesReport = async (req, res) => {
  try {
    const { dateRange = '30', category = 'all' } = req.query;
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Build query filter
    let matchFilter = {
      createdAt: { $gte: startDate }
    };

    if (category !== 'all') {
      matchFilter['products.category'] = category;
    }

    // Aggregate sales data from orders
    const salesAggregation = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$products' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get top selling products
    const topProductsAggregation = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          name: { $first: '$products.name' },
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Get daily sales data
    const dailySalesAggregation = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: parseInt(dateRange) }
    ]);

    // Get category sales breakdown
    const categorySalesAggregation = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Calculate totals for percentage calculation
    const totalCategoryRevenue = categorySalesAggregation.reduce((total, cat) => total + cat.revenue, 0);
    
    // Format response data
    const salesData = salesAggregation[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
    
    const responseData = {
      totalRevenue: Math.round(salesData.totalRevenue || 0),
      totalOrders: salesData.totalOrders || 0,
      averageOrderValue: Math.round(salesData.averageOrderValue || 0),
      revenueChange: 12.5, // TODO: Calculate actual change from previous period
      ordersChange: 8.3,   // TODO: Calculate actual change from previous period
      topProducts: topProductsAggregation.map(product => ({
        name: product.name,
        revenue: Math.round(product.totalRevenue),
        orders: product.totalOrders,
        growth: Math.round((Math.random() * 40) - 10) // TODO: Calculate actual growth
      })),
      dailySales: dailySalesAggregation.map(day => ({
        date: day._id,
        revenue: Math.round(day.revenue),
        orders: day.orders
      })),
      categorySales: categorySalesAggregation.map(cat => ({
        category: cat._id,
        revenue: Math.round(cat.revenue),
        percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100 * 10) / 10 : 0
      })),
      customerMetrics: {
        newCustomers: 45,     // TODO: Calculate from user data
        returningCustomers: 189, // TODO: Calculate from user data
        customerRetentionRate: 78.5, // TODO: Calculate actual rate
        averageCustomerValue: Math.round(salesData.averageOrderValue || 0)
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

// Get Inventory Report Data
export const getInventoryReport = async (req, res) => {
  try {
    const { dateRange = '30', status = 'all' } = req.query;
    
    // Build query filter
    let matchFilter = {};
    if (status !== 'all') {
      switch (status) {
        case 'low-stock':
          matchFilter = { $expr: { $lt: ['$stockQuantity', '$minimumThreshold'] } };
          break;
        case 'out-of-stock':
          matchFilter = { stockQuantity: 0 };
          break;
        case 'in-stock':
          matchFilter = { stockQuantity: { $gt: 0 } };
          break;
      }
    }

    // Get all products
    const products = await Product.find(matchFilter);
    
    // Calculate inventory metrics
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => 
      sum + (product.stockQuantity * product.price), 0
    );

    // Categorize products by stock status
    const lowStockItems = products.filter(product => 
      product.stockQuantity > 0 && 
      product.stockQuantity < (product.minimumThreshold || 10)
    ).slice(0, 10);

    const outOfStockItems = products.filter(product => product.stockQuantity === 0).slice(0, 10);
    
    const overStockItems = products.filter(product => 
      product.stockQuantity > (product.maximumThreshold || 100)
    ).slice(0, 10);

    // Calculate category breakdown
    const categoryBreakdown = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { totalItems: 0, value: 0 };
      }
      categoryBreakdown[category].totalItems += 1;
      categoryBreakdown[category].value += product.stockQuantity * product.price;
    });

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, data]) => ({
      category,
      totalItems: data.totalItems,
      value: Math.round(data.value),
      percentage: totalValue > 0 ? Math.round((data.value / totalValue) * 100 * 10) / 10 : 0
    })).sort((a, b) => b.value - a.value);

    // Mock stock movements (in a real app, you'd have a separate movements collection)
    const stockMovements = [
      { date: new Date().toISOString().split('T')[0], type: 'sale', product: 'Sample Product', quantity: -5, reason: 'Customer order' },
      { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], type: 'restock', product: 'Sample Product 2', quantity: 25, reason: 'Supplier delivery' }
    ];

    const responseData = {
      totalProducts,
      totalValue: Math.round(totalValue),
      lowStockItems: lowStockItems.map(item => ({
        name: item.name,
        current: item.stockQuantity,
        minimum: item.minimumThreshold || 10,
        category: item.category,
        value: Math.round(item.stockQuantity * item.price)
      })),
      outOfStockItems: outOfStockItems.map(item => ({
        name: item.name,
        category: item.category,
        lastRestocked: item.updatedAt.toISOString().split('T')[0]
      })),
      overStockItems: overStockItems.map(item => ({
        name: item.name,
        current: item.stockQuantity,
        maximum: item.maximumThreshold || 100,
        category: item.category,
        value: Math.round(item.stockQuantity * item.price)
      })),
      stockTurnoverRate: 4.2, // TODO: Calculate actual turnover rate
      averageDaysToSell: 87,  // TODO: Calculate actual average
      categoryBreakdown: categoryBreakdownArray,
      stockMovements,
      alerts: [
        { type: 'low-stock', count: lowStockItems.length, priority: 'high' },
        { type: 'out-of-stock', count: outOfStockItems.length, priority: 'critical' },
        { type: 'over-stock', count: overStockItems.length, priority: 'medium' },
        { type: 'expiring-soon', count: 0, priority: 'medium' }
      ]
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
};

// Get Product Performance Report Data
export const getProductPerformanceReport = async (req, res) => {
  try {
    const { dateRange = '30', sortBy = 'revenue' } = req.query;
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get product performance from orders
    const productPerformance = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          name: { $first: '$products.name' },
          revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
          unitsSold: { $sum: '$products.quantity' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Get product details
    const productIds = productPerformance.map(p => p._id);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach(product => {
      productMap[product._id] = product;
    });

    // Enhance performance data with product details
    const enhancedPerformance = productPerformance.map(perf => {
      const product = productMap[perf._id];
      return {
        name: perf.name,
        revenue: Math.round(perf.revenue),
        unitsSold: perf.unitsSold,
        profitMargin: product ? Math.round(((product.price - (product.cost || product.price * 0.6)) / product.price) * 100 * 10) / 10 : 30,
        rating: product ? (product.rating || 4.0) : 4.0,
        reviews: product ? (product.reviewCount || Math.floor(Math.random() * 100)) : 0,
        growth: Math.round((Math.random() * 40) - 10), // TODO: Calculate actual growth
        category: product ? product.category : 'uncategorized'
      };
    });

    // Separate best sellers and worst performers
    const bestSellers = enhancedPerformance.slice(0, 5);
    const worstPerformers = enhancedPerformance.slice(-3);

    // Most profitable products
    const mostProfitable = [...enhancedPerformance].sort((a, b) => b.profitMargin - a.profitMargin).slice(0, 5);

    // Category performance
    const categoryPerformance = {};
    enhancedPerformance.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = {
          totalRevenue: 0,
          unitsSold: 0,
          products: [],
          totalRating: 0
        };
      }
      categoryPerformance[category].totalRevenue += product.revenue;
      categoryPerformance[category].unitsSold += product.unitsSold;
      categoryPerformance[category].products.push(product);
      categoryPerformance[category].totalRating += product.rating;
    });

    const categoryPerformanceArray = Object.entries(categoryPerformance).map(([category, data]) => ({
      category,
      totalRevenue: Math.round(data.totalRevenue),
      unitsSold: data.unitsSold,
      averageRating: data.products.length > 0 ? Math.round((data.totalRating / data.products.length) * 10) / 10 : 0,
      growthRate: Math.round((Math.random() * 30) - 5), // TODO: Calculate actual growth
      profitability: data.products.length > 0 ? Math.round(data.products.reduce((sum, p) => sum + p.profitMargin, 0) / data.products.length * 10) / 10 : 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const responseData = {
      bestSellers,
      worstPerformers,
      mostProfitable: mostProfitable.map(p => ({ name: p.name, profitMargin: p.profitMargin, revenue: p.revenue })),
      categoryPerformance: categoryPerformanceArray,
      productMetrics: {
        totalProductsListed: await Product.countDocuments(),
        activeProducts: await Product.countDocuments({ status: 'active' }),
        averageRating: 4.4, // TODO: Calculate actual average
        totalReviews: 892   // TODO: Calculate actual total
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error generating product performance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate product performance report',
      error: error.message
    });
  }
};

// Get Farm Supplies Report Data
export const getSuppliesReport = async (req, res) => {
  try {
    const { dateRange = '30', category = 'all' } = req.query;
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Build query filter
    let matchFilter = {};
    if (category !== 'all') {
      matchFilter.type = category;
    }

    // Get farm supplies
    const supplies = await FarmSupply.find(matchFilter);
    
    // Calculate metrics
    const totalSupplies = supplies.length;
    const totalValue = supplies.reduce((sum, supply) => sum + (supply.quantity * supply.costPerUnit), 0);
    const monthlySpending = supplies
      .filter(supply => supply.purchaseDate >= startDate)
      .reduce((sum, supply) => sum + (supply.quantity * supply.costPerUnit), 0);

    // Get unique suppliers count
    const uniqueSuppliers = new Set(supplies.map(supply => supply.supplier)).size;

    // Low stock supplies
    const lowStockSupplies = supplies.filter(supply => 
      supply.quantity < (supply.minimumThreshold || 10)
    ).slice(0, 10);

    // Recent purchases (mock data - in real app you'd have purchase history)
    const recentPurchases = supplies
      .filter(supply => supply.purchaseDate >= startDate)
      .sort((a, b) => b.purchaseDate - a.purchaseDate)
      .slice(0, 5)
      .map(supply => ({
        date: supply.purchaseDate.toISOString().split('T')[0],
        supplier: supply.supplier,
        items: [supply.name],
        total: Math.round(supply.quantity * supply.costPerUnit),
        status: 'delivered'
      }));

    // Supplier performance (aggregated data)
    const supplierPerformance = {};
    supplies.forEach(supply => {
      if (!supplierPerformance[supply.supplier]) {
        supplierPerformance[supply.supplier] = {
          totalOrders: 0,
          totalSpent: 0,
          categories: new Set()
        };
      }
      supplierPerformance[supply.supplier].totalOrders += 1;
      supplierPerformance[supply.supplier].totalSpent += supply.quantity * supply.costPerUnit;
      supplierPerformance[supply.supplier].categories.add(supply.type);
    });

    const supplierPerformanceArray = Object.entries(supplierPerformance).map(([name, data]) => ({
      name,
      totalOrders: data.totalOrders,
      totalSpent: Math.round(data.totalSpent),
      onTimeDelivery: Math.round((Math.random() * 20) + 80), // Mock data
      qualityRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Mock data
      categories: Array.from(data.categories)
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    // Category breakdown
    const categoryBreakdown = {};
    supplies.forEach(supply => {
      const category = supply.type || 'Uncategorized';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { totalValue: 0, items: 0, monthlyUsage: 0 };
      }
      categoryBreakdown[category].totalValue += supply.quantity * supply.costPerUnit;
      categoryBreakdown[category].items += 1;
      if (supply.purchaseDate >= startDate) {
        categoryBreakdown[category].monthlyUsage += supply.quantity * supply.costPerUnit;
      }
    });

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, data]) => ({
      category,
      totalValue: Math.round(data.totalValue),
      items: data.items,
      percentage: totalValue > 0 ? Math.round((data.totalValue / totalValue) * 100 * 10) / 10 : 0,
      monthlyUsage: Math.round(data.monthlyUsage)
    })).sort((a, b) => b.totalValue - a.totalValue);

    // Mock expiring supplies (in real app, you'd have expiry dates)
    const expiringSupplies = supplies.slice(0, 3).map(supply => ({
      name: supply.name,
      category: supply.type,
      expiryDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysLeft: Math.floor(Math.random() * 30) + 5
    }));

    const responseData = {
      totalSupplies,
      totalValue: Math.round(totalValue),
      monthlySpending: Math.round(monthlySpending),
      suppliersCount: uniqueSuppliers,
      lowStockSupplies: lowStockSupplies.map(supply => ({
        name: supply.name,
        current: supply.quantity,
        minimum: supply.minimumThreshold || 10,
        category: supply.type,
        cost: Math.round(supply.quantity * supply.costPerUnit),
        supplier: supply.supplier
      })),
      recentPurchases,
      supplierPerformance: supplierPerformanceArray,
      categoryBreakdown: categoryBreakdownArray,
      expiringSupplies,
      usageAnalytics: {
        averageMonthlyConsumption: Math.round(monthlySpending),
        costPerUnit: totalSupplies > 0 ? Math.round(totalValue / totalSupplies) : 0,
        efficiencyScore: Math.round((Math.random() * 20) + 70), // Mock data
        wastePercentage: Math.round((Math.random() * 5) + 1) // Mock data
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error generating supplies report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate supplies report',
      error: error.message
    });
  }
};

// Get Overview Dashboard Data
export const getOverviewReport = async (req, res) => {
  try {
    const { dateRange = '30' } = req.query;
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get sales overview
    const salesOverview = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get products sold
    const productsSold = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$products.quantity' }
        }
      }
    ]);

    // Get top selling category
    const topCategoryResult = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          totalSold: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 1 }
    ]);

    // Get inventory value
    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } }
        }
      }
    ]);

    const salesData = salesOverview[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
    const productsData = productsSold[0] || { totalQuantity: 0 };
    const inventoryData = inventoryValue[0] || { totalValue: 0 };
    const topCategory = topCategoryResult[0] || { _id: 'Vegetables' };

    const responseData = {
      totalRevenue: Math.round(salesData.totalRevenue),
      totalOrders: salesData.totalOrders,
      averageOrderValue: Math.round(salesData.averageOrderValue),
      productsSold: productsData.totalQuantity,
      topSellingCategory: topCategory._id,
      inventoryValue: Math.round(inventoryData.totalValue)
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error generating overview report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overview report',
      error: error.message
    });
  }
};

// Get Report Statistics
export const getReportStats = async (req, res) => {
  try {
    // Mock statistics (in a real app, you'd track report generation)
    const responseData = {
      totalReports: 156,
      reportsThisMonth: 28,
      averageReportGeneration: '2.3s',
      mostRequestedReport: 'Sales Analytics'
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching report statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics',
      error: error.message
    });
  }
};

// Export Report Data (placeholder)
export const exportReport = async (req, res) => {
  try {
    const { type, format, dateRange } = req.query;
    
    // This is a placeholder - in a real implementation, you'd:
    // 1. Generate the appropriate report data based on type
    // 2. Format it according to the requested format (PDF, Excel, etc.)
    // 3. Return the file as a download

    res.status(200).json({
      success: true,
      message: `Export functionality for ${type} reports in ${format} format is not yet implemented`,
      data: {
        type,
        format,
        dateRange,
        note: 'This endpoint will be implemented to generate downloadable reports'
      }
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};
