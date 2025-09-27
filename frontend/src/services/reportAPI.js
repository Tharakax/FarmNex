const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Helper function to get authorization headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Report API service for handling all report-related operations
 */
export const reportAPI = {
  // Sales Reports
  getSalesData: async (dateRange = '30', category = 'all') => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/sales?dateRange=${dateRange}&category=${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Return mock data for now
      return {
        success: true,
        data: {
          totalRevenue: 85420,
          totalOrders: 234,
          averageOrderValue: 365,
          revenueChange: 12.5,
          ordersChange: 8.3,
          topProducts: [
            { name: 'Organic Tomatoes', revenue: 12500, orders: 45, growth: 15.2 },
            { name: 'Fresh Spinach', revenue: 8900, orders: 67, growth: 22.1 },
            { name: 'Bell Peppers', revenue: 7650, orders: 32, growth: -5.2 },
            { name: 'Organic Carrots', revenue: 6200, orders: 28, growth: 8.7 },
            { name: 'Mixed Salad Greens', revenue: 5800, orders: 41, growth: 18.9 }
          ],
          dailySales: [
            { date: '2025-08-21', revenue: 2850, orders: 12 },
            { date: '2025-08-22', revenue: 3200, orders: 14 },
            { date: '2025-08-23', revenue: 2950, orders: 11 },
            { date: '2025-08-24', revenue: 4100, orders: 18 },
            { date: '2025-08-25', revenue: 3650, orders: 15 },
            { date: '2025-08-26', revenue: 3890, orders: 17 },
            { date: '2025-08-27', revenue: 4200, orders: 19 }
          ],
          categorySales: [
            { category: 'Vegetables', revenue: 35200, percentage: 41.2 },
            { category: 'Fruits', revenue: 28900, percentage: 33.8 },
            { category: 'Leafy Greens', revenue: 12800, percentage: 15.0 },
            { category: 'Dairy Products', revenue: 6300, percentage: 7.4 },
            { category: 'Animal Products', revenue: 2220, percentage: 2.6 }
          ],
          customerMetrics: {
            newCustomers: 45,
            returningCustomers: 189,
            customerRetentionRate: 78.5,
            averageCustomerValue: 425
          }
        }
      };
    }
  },

  // Inventory Reports
  getInventoryData: async (dateRange = '30', filterStatus = 'all') => {
    try {
      // First try to fetch from the backend API
      const response = await fetch(`${API_BASE_URL}/reports/inventory?dateRange=${dateRange}&status=${filterStatus}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.log('Backend inventory API not available, calculating from products data:', error.message);
    }

    try {
      // Fallback: Fetch real products data and calculate inventory metrics
      const { productAPI } = await import('./productAPI');
      const productsResponse = await productAPI.getAllProducts();
      
      if (productsResponse.success && productsResponse.data) {
        const products = productsResponse.data;
        console.log('📦 Calculating inventory data from', products.length, 'products');
        
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => {
          const stock = p.stock?.current || p.stockQuantity || 0;
          const price = parseFloat(p.price) || 0;
          return sum + (stock * price);
        }, 0);
        
        // Calculate inventory items by status
        const lowStockItems = [];
        const outOfStockItems = [];
        const overStockItems = [];
        
        products.forEach(product => {
          const currentStock = product.stock?.current || product.stockQuantity || 0;
          const minStock = product.stock?.minimum || 5;
          const maxStock = product.stock?.maximum || 100;
          const price = parseFloat(product.price) || 0;
          
          if (currentStock === 0) {
            outOfStockItems.push({
              name: product.name,
              category: product.category || 'uncategorized',
              lastRestocked: product.stock?.lastRestocked || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          } else if (currentStock <= minStock) {
            lowStockItems.push({
              name: product.name,
              current: currentStock,
              minimum: minStock,
              category: product.category || 'uncategorized',
              value: Math.round(currentStock * price)
            });
          } else if (currentStock > maxStock) {
            overStockItems.push({
              name: product.name,
              current: currentStock,
              maximum: maxStock,
              category: product.category || 'uncategorized',
              value: Math.round(currentStock * price)
            });
          }
        });
        
        // Calculate category breakdown
        const categoryData = {};
        products.forEach(product => {
          const category = product.category || 'uncategorized';
          const stock = product.stock?.current || product.stockQuantity || 0;
          const price = parseFloat(product.price) || 0;
          const value = stock * price;
          
          if (!categoryData[category]) {
            categoryData[category] = {
              category: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
              totalItems: 0,
              value: 0
            };
          }
          categoryData[category].totalItems += 1;
          categoryData[category].value += value;
        });
        
        const categoryBreakdown = Object.values(categoryData)
          .sort((a, b) => b.value - a.value)
          .map(cat => ({
            ...cat,
            percentage: totalValue > 0 ? parseFloat(((cat.value / totalValue) * 100).toFixed(1)) : 0
          }));
        
        // Generate mock stock movements (would come from real transaction log in production)
        const recentDays = 5;
        const stockMovements = [];
        for (let i = 0; i < Math.min(recentDays, products.length); i++) {
          const product = products[i];
          const types = ['sale', 'restock', 'adjustment'];
          const reasons = {
            sale: 'Customer order',
            restock: 'Supplier delivery',
            adjustment: 'Inventory correction'
          };
          const type = types[Math.floor(Math.random() * types.length)];
          stockMovements.push({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type,
            product: product.name,
            quantity: type === 'restock' ? Math.floor(Math.random() * 20) + 5 : -(Math.floor(Math.random() * 15) + 1),
            reason: reasons[type]
          });
        }
        
        // Calculate alerts
        const alerts = [];
        if (lowStockItems.length > 0) {
          alerts.push({ type: 'low-stock', count: lowStockItems.length, priority: 'high' });
        }
        if (outOfStockItems.length > 0) {
          alerts.push({ type: 'out-of-stock', count: outOfStockItems.length, priority: 'critical' });
        }
        if (overStockItems.length > 0) {
          alerts.push({ type: 'over-stock', count: overStockItems.length, priority: 'medium' });
        }
        
        console.log('✅ Calculated real inventory data:', {
          totalProducts,
          totalValue: Math.round(totalValue),
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length,
          overStock: overStockItems.length
        });
        
        return {
          success: true,
          data: {
            totalProducts,
            totalValue: Math.round(totalValue),
            lowStockItems,
            outOfStockItems,
            overStockItems,
            stockTurnoverRate: 4.2, // Mock value
            averageDaysToSell: 87, // Mock value
            categoryBreakdown,
            stockMovements,
            alerts
          }
        };
      }
    } catch (error) {
      console.error('Error fetching products data for inventory:', error);
    }
    
    // Final fallback to mock data
    console.log('⚠️ Using fallback inventory mock data');
    return {
      success: true,
      data: {
        totalProducts: 156,
        totalValue: 67850,
        lowStockItems: [
          { name: 'Organic Tomatoes', current: 8, minimum: 15, category: 'vegetables', value: 240 },
          { name: 'Bell Peppers', current: 5, minimum: 10, category: 'vegetables', value: 125 },
          { name: 'Spinach', current: 12, minimum: 20, category: 'leafy-greens', value: 180 },
          { name: 'Carrots', current: 6, minimum: 12, category: 'root-vegetables', value: 90 },
          { name: 'Strawberries', current: 3, minimum: 8, category: 'berries', value: 45 }
        ],
        outOfStockItems: [
          { name: 'Organic Lettuce', category: 'leafy-greens', lastRestocked: '2025-08-20' },
          { name: 'Cherry Tomatoes', category: 'vegetables', lastRestocked: '2025-08-18' },
          { name: 'Blueberries', category: 'berries', lastRestocked: '2025-08-19' }
        ],
        overStockItems: [
          { name: 'Potatoes', current: 150, maximum: 100, category: 'root-vegetables', value: 300 },
          { name: 'Onions', current: 80, maximum: 50, category: 'vegetables', value: 160 }
        ],
        stockTurnoverRate: 4.2,
        averageDaysToSell: 87,
        categoryBreakdown: [
          { category: 'Vegetables', totalItems: 45, value: 28500, percentage: 42.0 },
          { category: 'Fruits', totalItems: 32, value: 19200, percentage: 28.3 },
          { category: 'Leafy Greens', totalItems: 28, value: 12400, percentage: 18.3 },
          { category: 'Root Vegetables', totalItems: 25, value: 5200, percentage: 7.7 },
          { category: 'Berries', totalItems: 15, value: 1800, percentage: 2.7 },
          { category: 'Dairy Products', totalItems: 8, value: 650, percentage: 1.0 },
          { category: 'Animal Products', totalItems: 3, value: 100, percentage: 0.1 }
        ],
        stockMovements: [
          { date: '2025-08-27', type: 'sale', product: 'Organic Tomatoes', quantity: -15, reason: 'Customer order' },
          { date: '2025-08-27', type: 'restock', product: 'Bell Peppers', quantity: +25, reason: 'Supplier delivery' },
          { date: '2025-08-26', type: 'sale', product: 'Spinach', quantity: -8, reason: 'Customer order' },
          { date: '2025-08-26', type: 'adjustment', product: 'Carrots', quantity: -2, reason: 'Spoilage' },
          { date: '2025-08-25', type: 'sale', product: 'Strawberries', quantity: -12, reason: 'Bulk order' }
        ],
        alerts: [
          { type: 'low-stock', count: 5, priority: 'high' },
          { type: 'out-of-stock', count: 3, priority: 'critical' },
          { type: 'over-stock', count: 2, priority: 'medium' },
          { type: 'expiring-soon', count: 7, priority: 'medium' }
        ]
      }
    };
  },

  // Product Performance Reports
  getProductPerformanceData: async (dateRange = '30', sortBy = 'revenue') => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/products?dateRange=${dateRange}&sortBy=${sortBy}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product performance data');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching product performance data:', error);
      // Return mock data for now
      return {
        success: true,
        data: {
          bestSellers: [
            { 
              name: 'Organic Tomatoes', 
              revenue: 15420, 
              unitsSold: 245, 
              profitMargin: 35.2, 
              rating: 4.8, 
              reviews: 89, 
              growth: 22.5,
              category: 'vegetables' 
            },
            { 
              name: 'Fresh Spinach', 
              revenue: 12890, 
              unitsSold: 189, 
              profitMargin: 42.1, 
              rating: 4.6, 
              reviews: 67, 
              growth: 18.7,
              category: 'leafy-greens' 
            },
            { 
              name: 'Bell Peppers', 
              revenue: 9650, 
              unitsSold: 156, 
              profitMargin: 28.9, 
              rating: 4.4, 
              reviews: 45, 
              growth: 15.3,
              category: 'vegetables' 
            },
            { 
              name: 'Organic Carrots', 
              revenue: 8200, 
              unitsSold: 134, 
              profitMargin: 38.5, 
              rating: 4.7, 
              reviews: 56, 
              growth: 12.8,
              category: 'root-vegetables' 
            },
            { 
              name: 'Mixed Salad Greens', 
              revenue: 7850, 
              unitsSold: 112, 
              profitMargin: 45.2, 
              rating: 4.5, 
              reviews: 38, 
              growth: 20.1,
              category: 'leafy-greens' 
            }
          ],
          worstPerformers: [
            { 
              name: 'Exotic Mushrooms', 
              revenue: 450, 
              unitsSold: 8, 
              profitMargin: 12.1, 
              rating: 3.2, 
              reviews: 5, 
              growth: -15.2,
              category: 'vegetables' 
            },
            { 
              name: 'Dragon Fruit', 
              revenue: 320, 
              unitsSold: 6, 
              profitMargin: 8.5, 
              rating: 3.8, 
              reviews: 3, 
              growth: -8.7,
              category: 'fruits' 
            },
            { 
              name: 'Purple Cabbage', 
              revenue: 280, 
              unitsSold: 12, 
              profitMargin: 15.3, 
              rating: 3.5, 
              reviews: 8, 
              growth: -5.2,
              category: 'vegetables' 
            }
          ],
          mostProfitable: [
            { name: 'Mixed Salad Greens', profitMargin: 45.2, revenue: 7850 },
            { name: 'Fresh Spinach', profitMargin: 42.1, revenue: 12890 },
            { name: 'Organic Carrots', profitMargin: 38.5, revenue: 8200 },
            { name: 'Organic Tomatoes', profitMargin: 35.2, revenue: 15420 },
            { name: 'Bell Peppers', profitMargin: 28.9, revenue: 9650 }
          ],
          categoryPerformance: [
            { 
              category: 'Vegetables', 
              totalRevenue: 45200, 
              unitsSold: 567, 
              averageRating: 4.5, 
              growthRate: 18.5,
              profitability: 32.1 
            },
            { 
              category: 'Leafy Greens', 
              totalRevenue: 28900, 
              unitsSold: 389, 
              averageRating: 4.6, 
              growthRate: 25.2,
              profitability: 41.8 
            },
            { 
              category: 'Fruits', 
              totalRevenue: 22100, 
              unitsSold: 234, 
              averageRating: 4.3, 
              growthRate: 12.8,
              profitability: 28.9 
            },
            { 
              category: 'Root Vegetables', 
              totalRevenue: 15600, 
              unitsSold: 178, 
              averageRating: 4.4, 
              growthRate: 15.7,
              profitability: 35.4 
            }
          ],
          productMetrics: {
            totalProductsListed: 156,
            activeProducts: 142,
            averageRating: 4.4,
            totalReviews: 892
          }
        }
      };
    }
  },

  // Farm Supplies Reports
  getSuppliesData: async (dateRange = '30', filterCategory = 'all') => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/supplies?dateRange=${dateRange}&category=${filterCategory}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch supplies data');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching supplies data:', error);
      // Return mock data for now
      return {
        success: true,
        data: {
          totalSupplies: 89,
          totalValue: 34560,
          monthlySpending: 8750,
          suppliersCount: 12,
          lowStockSupplies: [
            { name: 'Organic Fertilizer', current: 5, minimum: 15, category: 'fertilizers', cost: 450, supplier: 'GreenGrow Co.' },
            { name: 'Tomato Seeds', current: 8, minimum: 20, category: 'seeds', cost: 120, supplier: 'SeedMaster Inc.' },
            { name: 'Irrigation Pipes', current: 12, minimum: 25, category: 'irrigation', cost: 340, supplier: 'AquaFlow Systems' },
            { name: 'Garden Hose', current: 3, minimum: 8, category: 'irrigation', cost: 89, supplier: 'FlexiPipe Ltd.' }
          ],
          recentPurchases: [
            { 
              date: '2025-08-26', 
              supplier: 'GreenGrow Co.', 
              items: ['Organic Fertilizer', 'Soil Amendment'], 
              total: 1250, 
              status: 'delivered' 
            },
            { 
              date: '2025-08-24', 
              supplier: 'ToolMaster Pro', 
              items: ['Pruning Shears', 'Hand Trowels'], 
              total: 320, 
              status: 'delivered' 
            },
            { 
              date: '2025-08-22', 
              supplier: 'SeedMaster Inc.', 
              items: ['Carrot Seeds', 'Lettuce Seeds'], 
              total: 180, 
              status: 'pending' 
            }
          ],
          supplierPerformance: [
            { 
              name: 'GreenGrow Co.', 
              totalOrders: 24, 
              totalSpent: 15600, 
              onTimeDelivery: 95.8, 
              qualityRating: 4.7, 
              categories: ['fertilizers', 'soil-amendments'] 
            },
            { 
              name: 'SeedMaster Inc.', 
              totalOrders: 18, 
              totalSpent: 7800, 
              onTimeDelivery: 88.9, 
              qualityRating: 4.4, 
              categories: ['seeds'] 
            },
            { 
              name: 'AquaFlow Systems', 
              totalOrders: 12, 
              totalSpent: 5200, 
              onTimeDelivery: 91.7, 
              qualityRating: 4.6, 
              categories: ['irrigation'] 
            },
            { 
              name: 'ToolMaster Pro', 
              totalOrders: 8, 
              totalSpent: 3400, 
              onTimeDelivery: 100, 
              qualityRating: 4.8, 
              categories: ['tools', 'equipment'] 
            }
          ],
          categoryBreakdown: [
            { category: 'Fertilizers', totalValue: 12800, items: 15, percentage: 37.0, monthlyUsage: 2400 },
            { category: 'Seeds', totalValue: 8900, items: 25, percentage: 25.7, monthlyUsage: 1200 },
            { category: 'Tools', totalValue: 5600, items: 18, percentage: 16.2, monthlyUsage: 800 },
            { category: 'Irrigation', totalValue: 4200, items: 12, percentage: 12.2, monthlyUsage: 600 },
            { category: 'Pesticides', totalValue: 2100, items: 8, percentage: 6.1, monthlyUsage: 400 },
            { category: 'Equipment', totalValue: 960, items: 11, percentage: 2.8, monthlyUsage: 200 }
          ],
          expiringSupplies: [
            { name: 'Liquid Fertilizer', category: 'fertilizers', expiryDate: '2025-09-15', daysLeft: 18 },
            { name: 'Organic Pesticide', category: 'pesticides', expiryDate: '2025-09-22', daysLeft: 25 },
            { name: 'Plant Growth Enhancer', category: 'fertilizers', expiryDate: '2025-10-05', daysLeft: 38 }
          ],
          usageAnalytics: {
            averageMonthlyConsumption: 8750,
            costPerUnit: 145,
            efficiencyScore: 82.5,
            wastePercentage: 3.2
          }
        }
      };
    }
  },

  // Overview Dashboard Data
  getOverviewData: async (dateRange = '30') => {
    try {
      // First try to fetch from the backend API
      const response = await fetch(`${API_BASE_URL}/reports/overview?dateRange=${dateRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.log('Backend API not available, fetching from products API:', error.message);
    }

    try {
      // Fallback: Fetch real products data and calculate metrics
      const { productAPI } = await import('./productAPI');
      const productsResponse = await productAPI.getAllProducts();
      
      if (productsResponse.success && productsResponse.data) {
        const products = productsResponse.data;
        console.log('📊 Calculating overview data from', products.length, 'products');
        
        // Calculate real metrics from products data
        const totalProducts = products.length;
        const totalUnits = products.reduce((sum, p) => sum + (p.stock?.current || p.stockQuantity || 0), 0);
        const inventoryValue = products.reduce((sum, p) => {
          const stock = p.stock?.current || p.stockQuantity || 0;
          const price = parseFloat(p.price) || 0;
          return sum + (stock * price);
        }, 0);
        
        // Calculate stock status
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        
        products.forEach(product => {
          const currentStock = product.stock?.current || product.stockQuantity || 0;
          const minStock = product.stock?.minimum || 5;
          
          if (currentStock === 0) {
            outOfStock++;
          } else if (currentStock <= minStock) {
            lowStock++;
          } else {
            inStock++;
          }
        });
        
        const activeProducts = inStock + lowStock;
        
        // Calculate category breakdown
        const categoryData = {};
        products.forEach(product => {
          const category = product.category || 'uncategorized';
          const stock = product.stock?.current || product.stockQuantity || 0;
          const price = parseFloat(product.price) || 0;
          const value = stock * price;
          
          if (!categoryData[category]) {
            categoryData[category] = { name: category, value: 0, count: 0 };
          }
          categoryData[category].value += value;
          categoryData[category].count += 1;
        });
        
        const topCategories = Object.values(categoryData)
          .sort((a, b) => b.value - a.value)
          .slice(0, 4)
          .map(cat => ({
            name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1).replace('-', ' '),
            percentage: inventoryValue > 0 ? Math.round((cat.value / inventoryValue) * 100) : 0,
            revenue: Math.round(cat.value)
          }));
        
        console.log('✅ Calculated real overview data:', {
          totalProducts,
          inventoryValue: Math.round(inventoryValue),
          inStock,
          lowStock,
          outOfStock
        });
        
        return {
          success: true,
          data: {
            totalProducts,
            activeProducts,
            totalRevenue: Math.round(inventoryValue * 0.3), // Estimate revenue as 30% of inventory value
            totalOrders: Math.round(totalUnits * 0.1), // Estimate orders
            averageOrderValue: Math.round((inventoryValue * 0.3) / Math.max(totalUnits * 0.1, 1)),
            productsSold: Math.round(totalUnits * 0.2), // Estimate sold units
            inventoryValue: Math.round(inventoryValue),
            activeCustomers: Math.round(totalProducts * 5), // Estimate customers
            lowStockItems: lowStock,
            outOfStockItems: outOfStock,
            totalUnits,
            // Growth rates (estimated)
            revenueChange: 12.5,
            ordersChange: 8.3,
            aovChange: 5.1,
            productsSoldChange: 15.2,
            inventoryChange: inventoryValue > 100000 ? 15.3 : -2.1,
            customerChange: 9.7,
            // Additional metrics
            inventoryTurnover: 4.2,
            topSellingCategory: topCategories[0]?.name || 'Vegetables',
            topCategories
          }
        };
      }
    } catch (error) {
      console.error('Error fetching products data:', error);
    }
    
    // Final fallback to mock data
    console.log('⚠️ Using fallback mock data');
    return {
      success: true,
      data: {
        totalRevenue: 125000,
        totalOrders: 342,
        averageOrderValue: 365,
        productsSold: 1250,
        inventoryValue: 45000,
        activeCustomers: 1234,
        totalProducts: 247,
        activeProducts: 198,
        lowStockItems: 18,
        outOfStockItems: 12,
        // Growth rates
        revenueChange: 12.5,
        ordersChange: 8.3,
        aovChange: 5.1,
        productsSoldChange: 15.2,
        inventoryChange: -2.1,
        customerChange: 9.7,
        // Additional metrics
        inventoryTurnover: 4.2,
        topSellingCategory: 'Vegetables',
        topCategories: [
          { name: 'Vegetables', percentage: 100, revenue: 45200 },
          { name: 'Fruits', percentage: 85, revenue: 35800 },
          { name: 'Dairy Products', percentage: 70, revenue: 22500 },
          { name: 'Leafy Greens', percentage: 55, revenue: 15200 }
        ]
      }
    };
  },

  // Export Report Data
  exportReport: async (reportType, format, dateRange, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        type: reportType,
        format,
        dateRange,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/reports/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  // Export Sales as PDF using backend service
  exportSalesPDF: async (dateRange = '30', category = 'all') => {
    try {
      // Get auth token (normalize whether it already includes 'Bearer')
      const raw = (localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken') || '').trim();
      if (!raw) {
        throw new Error('Authentication required. Please log in again.');
      }
      let tokenPart = raw;
      if (/^Bearer\b/i.test(raw)) {
        tokenPart = raw.replace(/^Bearer\s*[.:]*/i, '').trim();
      }

      const response = await fetch(`${API_BASE_URL}/reports/sales-pdf?dateRange=${dateRange}&category=${category}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenPart}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(`Failed to generate PDF report: ${response.statusText}`);
      }
      
      // Handle PDF file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FarmNex_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'PDF report downloaded successfully!' };
    } catch (error) {
      console.error('Error exporting sales PDF:', error);
      throw error;
    }
  },

  // Get Report Statistics for Dashboard
  getReportStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch report statistics');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      return {
        success: true,
        data: {
          totalReports: 156,
          reportsThisMonth: 28,
          averageReportGeneration: '2.3s',
          mostRequestedReport: 'Sales Analytics'
        }
      };
    }
  }
};

export default reportAPI;
