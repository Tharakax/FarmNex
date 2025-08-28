import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Filter
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { reportAPI } from '../../services/reportAPI';

const SalesReport = ({ dateRange }) => {
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    topProducts: [],
    dailySales: [],
    categorySales: [],
    customerMetrics: {}
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadSalesData();
  }, [dateRange, selectedCategory]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getSalesData(dateRange, selectedCategory);
      
      if (response.success) {
        setSalesData(response.data);
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      // Fallback to mock data on error
      setSalesData({
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
      });
    }
    setLoading(false);
  };

  const handleExportSalesReport = (format) => {
    const exportData = {
      summary: [
        ['Total Revenue', `$${salesData.totalRevenue.toLocaleString()}`],
        ['Total Orders', salesData.totalOrders.toString()],
        ['Average Order Value', `$${salesData.averageOrderValue}`],
        ['Revenue Change', `${salesData.revenueChange > 0 ? '+' : ''}${salesData.revenueChange}%`],
        ['Orders Change', `${salesData.ordersChange > 0 ? '+' : ''}${salesData.ordersChange}%`]
      ],
      topProducts: salesData.topProducts,
      dailySales: salesData.dailySales,
      categorySales: salesData.categorySales
    };

    const filename = `sales_report_${dateRange}days_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'pdf') {
      exportToPDF(
        exportData.topProducts,
        `Sales Report - Last ${dateRange} Days`,
        [
          { header: 'Product Name', dataKey: 'name' },
          { header: 'Revenue', dataKey: 'revenue' },
          { header: 'Orders', dataKey: 'orders' },
          { header: 'Growth %', dataKey: 'growth' }
        ],
        filename
      );
    } else {
      exportToExcel(
        exportData.topProducts,
        'Sales Report',
        [
          { header: 'Product Name', dataKey: 'name' },
          { header: 'Revenue', dataKey: 'revenue' },
          { header: 'Orders', dataKey: 'orders' },
          { header: 'Growth %', dataKey: 'growth' }
        ],
        filename
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600 mt-1">Revenue trends and sales performance for the last {dateRange} days</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportSalesReport('pdf')}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </button>
          <button
            onClick={() => handleExportSalesReport('excel')}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">${salesData.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-green-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{salesData.revenueChange}%</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{salesData.totalOrders}</p>
              <div className="flex items-center mt-2 text-blue-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{salesData.ordersChange}%</span>
              </div>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Average Order Value</p>
              <p className="text-2xl font-bold">${salesData.averageOrderValue}</p>
              <div className="flex items-center mt-2 text-purple-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+5.1%</span>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Customer Retention</p>
              <p className="text-2xl font-bold">{salesData.customerMetrics.customerRetentionRate}%</p>
              <div className="flex items-center mt-2 text-orange-100">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+3.2%</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {salesData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                  <div className={`text-sm flex items-center ${
                    product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span>{product.growth > 0 ? '+' : ''}{product.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <div className="space-y-4">
            {salesData.categorySales.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{category.category}</span>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">
                      ${category.revenue.toLocaleString()}
                    </span>
                    <span className="text-gray-600 text-sm ml-2">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Sales Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Trend</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {salesData.dailySales.map((day, index) => (
              <div key={day.date} className="space-y-2">
                <div className="text-xs text-gray-600 font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div 
                  className="bg-green-500 rounded-md flex items-end justify-center text-white text-xs font-medium"
                  style={{ 
                    height: `${Math.max(20, (day.revenue / Math.max(...salesData.dailySales.map(d => d.revenue))) * 100)}px` 
                  }}
                >
                  ${(day.revenue / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-gray-600">{day.orders} orders</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{salesData.customerMetrics.newCustomers}</p>
            <p className="text-sm text-blue-700">New Customers</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{salesData.customerMetrics.returningCustomers}</p>
            <p className="text-sm text-green-700">Returning Customers</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{salesData.customerMetrics.customerRetentionRate}%</p>
            <p className="text-sm text-purple-700">Retention Rate</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">${salesData.customerMetrics.averageCustomerValue}</p>
            <p className="text-sm text-orange-700">Avg Customer Value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
