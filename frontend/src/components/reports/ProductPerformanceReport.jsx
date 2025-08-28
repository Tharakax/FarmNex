import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Star,
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  FileText,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { reportAPI } from '../../services/reportAPI';

const ProductPerformanceReport = ({ dateRange }) => {
  const [performanceData, setPerformanceData] = useState({
    bestSellers: [],
    worstPerformers: [],
    mostProfitable: [],
    categoryPerformance: [],
    productMetrics: {
      totalProductsListed: 0,
      activeProducts: 0,
      averageRating: 0,
      totalReviews: 0
    },
    revenueByProduct: [],
    stockTurnoverByProduct: []
  });
  
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    loadPerformanceData();
  }, [dateRange, sortBy]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getProductPerformanceData(dateRange, sortBy);
      
      if (response.success) {
        setPerformanceData(response.data);
      } else {
        throw new Error('Failed to fetch product performance data');
      }
    } catch (error) {
      console.error('Error loading product performance data:', error);
      // Fallback to mock data on error
      setPerformanceData({
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
      });
    }
    setLoading(false);
  };

  const handleExportProductReport = (format) => {
    const exportData = performanceData.bestSellers.map(product => ({
      name: product.name,
      category: product.category,
      revenue: product.revenue,
      unitsSold: product.unitsSold,
      profitMargin: `${product.profitMargin}%`,
      rating: product.rating,
      reviews: product.reviews,
      growth: `${product.growth > 0 ? '+' : ''}${product.growth}%`
    }));

    const filename = `product_performance_${dateRange}days_${new Date().toISOString().split('T')[0]}`;
    
    const columns = [
      { header: 'Product Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Revenue', dataKey: 'revenue' },
      { header: 'Units Sold', dataKey: 'unitsSold' },
      { header: 'Profit Margin', dataKey: 'profitMargin' },
      { header: 'Rating', dataKey: 'rating' },
      { header: 'Reviews', dataKey: 'reviews' },
      { header: 'Growth', dataKey: 'growth' }
    ];

    if (format === 'pdf') {
      exportToPDF(exportData, `Product Performance Report - Last ${dateRange} Days`, columns, filename);
    } else {
      exportToExcel(exportData, 'Product Performance Report', columns, filename);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading product performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Performance Report</h2>
          <p className="text-gray-600 mt-1">Analyze product sales, profitability, and customer satisfaction</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="units">Sort by Units Sold</option>
            <option value="profit">Sort by Profit Margin</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <button
            onClick={() => handleExportProductReport('pdf')}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </button>
          <button
            onClick={() => handleExportProductReport('excel')}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Products</p>
              <p className="text-2xl font-bold">{performanceData.productMetrics.activeProducts}</p>
              <p className="text-blue-100 text-xs">of {performanceData.productMetrics.totalProductsListed} total</p>
            </div>
            <Package className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Average Rating</p>
              <p className="text-2xl font-bold">{performanceData.productMetrics.averageRating}</p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(performanceData.productMetrics.averageRating) ? 'text-yellow-300 fill-current' : 'text-green-200'}`} />
                ))}
              </div>
            </div>
            <Star className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Reviews</p>
              <p className="text-2xl font-bold">{performanceData.productMetrics.totalReviews}</p>
              <div className="flex items-center mt-1 text-purple-100">
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span className="text-xs">94% positive</span>
              </div>
            </div>
            <Eye className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg Profit Margin</p>
              <p className="text-2xl font-bold">32.8%</p>
              <div className="flex items-center mt-1 text-orange-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-xs">+5.2% vs last period</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Best Sellers vs Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            Top Performing Products
          </h3>
          <div className="space-y-4">
            {performanceData.bestSellers.map((product, index) => (
              <div key={product.name} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">${product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{product.unitsSold} units sold</p>
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+{product.growth}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
            Products Needing Attention
          </h3>
          <div className="space-y-4">
            {performanceData.worstPerformers.map((product, index) => (
              <div key={product.name} className="border border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700">${product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{product.unitsSold} units sold</p>
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>{product.growth}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Profitable Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Profitable Products</h3>
        <div className="space-y-3">
          {performanceData.mostProfitable.map((product, index) => (
            <div key={product.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-900">{product.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-bold text-green-700">{product.profitMargin}%</p>
                  <p className="text-xs text-gray-600">profit margin</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">revenue</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Revenue</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Units Sold</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Avg Rating</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Growth Rate</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Profitability</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.categoryPerformance.map((category) => (
                <tr key={category.category} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 text-sm font-medium text-gray-900">{category.category}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">${category.totalRevenue.toLocaleString()}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">{category.unitsSold}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm text-gray-900">{category.averageRating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className={`inline-flex items-center text-sm ${
                      category.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {category.growthRate >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      <span>{category.growthRate > 0 ? '+' : ''}{category.growthRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(category.profitability / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{category.profitability}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            Success Factors
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Organic products show 25% higher margins
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Leafy greens have highest customer satisfaction
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Fresh vegetables drive repeat purchases
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <ThumbsDown className="h-5 w-5 text-red-600 mr-2" />
            Areas for Improvement
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-red-700">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Exotic products need better marketing
            </div>
            <div className="flex items-center text-red-700">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Some products have low review scores
            </div>
            <div className="flex items-center text-red-700">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Price optimization needed for slow movers
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            Recommendations
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Focus on promoting leafy greens
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Bundle slow-moving items with bestsellers
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Consider seasonal pricing strategies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceReport;
