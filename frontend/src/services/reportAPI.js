const API_BASE_URL = 'http://localhost:3000/api';

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
      const response = await fetch(`${API_BASE_URL}/reports/inventory?dateRange=${dateRange}&status=${filterStatus}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      // Return mock data for now
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
    }
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
      const response = await fetch(`${API_BASE_URL}/reports/overview?dateRange=${dateRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch overview data');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching overview data:', error);
      // Return mock data for now
      return {
        success: true,
        data: {
          totalRevenue: 125000,
          totalOrders: 342,
          averageOrderValue: 365,
          productsSold: 1250,
          topSellingCategory: 'Vegetables',
          inventoryValue: 45000
        }
      };
    }
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
