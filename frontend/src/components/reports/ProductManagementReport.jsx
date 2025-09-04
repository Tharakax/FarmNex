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
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  Target,
  Filter,
  Download,
  Settings,
  Truck,
  Award,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { reportAPI } from '../../services/reportAPI';
import toast from 'react-hot-toast';

const ProductManagementReport = ({ dateRange = '30' }) => {
  const [reportData, setReportData] = useState({
    // Performance Metrics
    performanceMetrics: {
      totalProducts: 0,
      activeProducts: 0,
      totalRevenue: 0,
      totalUnitsSold: 0,
      averageOrderValue: 0,
      averageRating: 0,
      totalReviews: 0,
      conversionRate: 0
    },
    
    // Product Performance
    bestSellers: [],
    worstPerformers: [],
    mostProfitable: [],
    fastestMoving: [],
    slowestMoving: [],
    
    // Inventory Analysis
    inventoryStatus: {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      overStock: 0,
      totalValue: 0
    },
    lowStockItems: [],
    outOfStockItems: [],
    overStockItems: [],
    
    // Category Performance
    categoryPerformance: [],
    categoryTrends: [],
    
    // Quality & Satisfaction
    topRatedProducts: [],
    lowRatedProducts: [],
    customerFeedback: [],
    
    // Financial Analysis
    profitabilityAnalysis: [],
    revenueByCategory: [],
    costAnalysis: [],
    
    // Operational Insights
    stockTurnover: [],
    seasonalTrends: [],
    demandForecasting: [],
    
    // Alerts & Recommendations
    alerts: [],
    recommendations: [],
    actionItems: []
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getProductManagementReport(dateRange);
      
      if (response.success) {
        setReportData(response.data);
      } else {
        // Fallback to comprehensive mock data
        setReportData(generateMockData());
      }
    } catch (error) {
      console.error('Error loading product management report:', error);
      setReportData(generateMockData());
      toast.error('Using sample data - API connection failed');
    }
    setLoading(false);
  };

  const generateMockData = () => ({
    performanceMetrics: {
      totalProducts: 156,
      activeProducts: 142,
      totalRevenue: 125420,
      totalUnitsSold: 2847,
      averageOrderValue: 44.07,
      averageRating: 4.4,
      totalReviews: 892,
      conversionRate: 3.2
    },
    
    bestSellers: [
      { name: 'Organic Tomatoes', revenue: 15420, unitsSold: 245, profitMargin: 35.2, rating: 4.8, reviews: 89, growth: 22.5, category: 'vegetables', stockLevel: 'good' },
      { name: 'Fresh Spinach', revenue: 12890, unitsSold: 189, profitMargin: 42.1, rating: 4.6, reviews: 67, growth: 18.7, category: 'leafy-greens', stockLevel: 'low' },
      { name: 'Bell Peppers', revenue: 9650, unitsSold: 156, profitMargin: 28.9, rating: 4.4, reviews: 45, growth: 15.3, category: 'vegetables', stockLevel: 'good' },
      { name: 'Organic Carrots', revenue: 8200, unitsSold: 134, profitMargin: 38.5, rating: 4.7, reviews: 56, growth: 12.8, category: 'root-vegetables', stockLevel: 'good' },
      { name: 'Mixed Salad Greens', revenue: 7850, unitsSold: 112, profitMargin: 45.2, rating: 4.5, reviews: 38, growth: 20.1, category: 'leafy-greens', stockLevel: 'critical' }
    ],
    
    worstPerformers: [
      { name: 'Exotic Mushrooms', revenue: 450, unitsSold: 8, profitMargin: 12.1, rating: 3.2, reviews: 5, growth: -15.2, category: 'vegetables', stockLevel: 'overstock' },
      { name: 'Dragon Fruit', revenue: 320, unitsSold: 6, profitMargin: 8.5, rating: 3.8, reviews: 3, growth: -8.7, category: 'fruits', stockLevel: 'overstock' },
      { name: 'Purple Cabbage', revenue: 280, unitsSold: 12, profitMargin: 15.3, rating: 3.5, reviews: 8, growth: -5.2, category: 'vegetables', stockLevel: 'good' }
    ],
    
    inventoryStatus: {
      inStock: 89,
      lowStock: 23,
      outOfStock: 12,
      overStock: 18,
      totalValue: 67850
    },
    
    lowStockItems: [
      { name: 'Fresh Spinach', current: 8, minimum: 15, category: 'leafy-greens', value: 240, reorderPoint: 'immediate' },
      { name: 'Bell Peppers', current: 5, minimum: 10, category: 'vegetables', value: 125, reorderPoint: 'urgent' },
      { name: 'Strawberries', current: 3, minimum: 8, category: 'berries', value: 45, reorderPoint: 'immediate' }
    ],
    
    outOfStockItems: [
      { name: 'Organic Lettuce', category: 'leafy-greens', lastRestocked: '2025-08-20', daysSinceStock: 14, lostRevenue: 890 },
      { name: 'Cherry Tomatoes', category: 'vegetables', lastRestocked: '2025-08-18', daysSinceStock: 16, lostRevenue: 650 },
      { name: 'Blueberries', category: 'berries', lastRestocked: '2025-08-19', daysSinceStock: 15, lostRevenue: 420 }
    ],
    
    categoryPerformance: [
      { category: 'Vegetables', totalRevenue: 45200, unitsSold: 567, averageRating: 4.5, growthRate: 18.5, profitability: 32.1, marketShare: 35.2 },
      { category: 'Leafy Greens', totalRevenue: 28900, unitsSold: 389, averageRating: 4.6, growthRate: 25.2, profitability: 41.8, marketShare: 22.8 },
      { category: 'Fruits', totalRevenue: 22100, unitsSold: 234, averageRating: 4.3, growthRate: 12.8, profitability: 28.9, marketShare: 17.6 },
      { category: 'Root Vegetables', totalRevenue: 15600, unitsSold: 178, averageRating: 4.4, growthRate: 15.7, profitability: 35.4, marketShare: 12.4 },
      { category: 'Berries', totalRevenue: 8900, unitsSold: 145, averageRating: 4.2, growthRate: 8.3, profitability: 22.1, marketShare: 7.1 },
      { category: 'Dairy Products', totalRevenue: 4720, unitsSold: 89, averageRating: 4.1, growthRate: 5.2, profitability: 18.7, marketShare: 3.8 }
    ],
    
    topRatedProducts: [
      { name: 'Organic Tomatoes', rating: 4.8, reviews: 89, category: 'vegetables' },
      { name: 'Organic Carrots', rating: 4.7, reviews: 56, category: 'root-vegetables' },
      { name: 'Fresh Spinach', rating: 4.6, reviews: 67, category: 'leafy-greens' },
      { name: 'Mixed Salad Greens', rating: 4.5, reviews: 38, category: 'leafy-greens' },
      { name: 'Bell Peppers', rating: 4.4, reviews: 45, category: 'vegetables' }
    ],
    
    profitabilityAnalysis: [
      { name: 'Mixed Salad Greens', profitMargin: 45.2, grossProfit: 3548, netProfit: 2835 },
      { name: 'Fresh Spinach', profitMargin: 42.1, grossProfit: 5427, netProfit: 4341 },
      { name: 'Organic Carrots', profitMargin: 38.5, grossProfit: 3157, netProfit: 2526 },
      { name: 'Organic Tomatoes', profitMargin: 35.2, grossProfit: 5428, netProfit: 4342 },
      { name: 'Bell Peppers', profitMargin: 28.9, grossProfit: 2789, netProfit: 2231 }
    ],
    
    alerts: [
      { type: 'critical', message: '12 products are out of stock', count: 12, priority: 'high', action: 'immediate_restock' },
      { type: 'warning', message: '23 products have low stock levels', count: 23, priority: 'medium', action: 'schedule_restock' },
      { type: 'info', message: '18 products are overstocked', count: 18, priority: 'low', action: 'promotion_needed' },
      { type: 'success', message: '5 products exceeded sales targets', count: 5, priority: 'info', action: 'celebrate' }
    ],
    
    recommendations: [
      { title: 'Focus Marketing on Leafy Greens', description: 'Highest profit margin category with growing demand', priority: 'high', impact: 'revenue_increase' },
      { title: 'Optimize Exotic Product Pricing', description: 'Low-performing exotic items need price adjustment or bundling', priority: 'medium', impact: 'cost_reduction' },
      { title: 'Implement Dynamic Pricing', description: 'Seasonal pricing for better profit optimization', priority: 'medium', impact: 'profit_increase' },
      { title: 'Expand Organic Product Line', description: 'High customer satisfaction and premium pricing potential', priority: 'high', impact: 'market_expansion' }
    ]
  });

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'categories', label: 'Categories', icon: PieChart },
    { id: 'quality', label: 'Quality', icon: Star },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'insights', label: 'Insights', icon: Target }
  ];

  const handleExport = (format) => {
    try {
      const allProducts = [...reportData.bestSellers, ...reportData.worstPerformers];
      const exportData = allProducts.map(product => ({
        id: product.name.replace(/\s/g, '').slice(-6),
        name: product.name,
        category: product.category,
        description: getProductDescription(product.category),
        price: `LKR ${(product.revenue / product.unitsSold).toFixed(2)}`,
        stockQuantity: product.unitsSold,
        unit: product.category === 'dairy-products' ? 'pack' : 'kg',
        status: getStatusText(product.stockLevel)
      }));

      const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Product Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Description', key: 'description' },
        { header: 'Price', key: 'price' },
        { header: 'Stock Quantity', key: 'stockQuantity' },
        { header: 'Unit', key: 'unit' },
        { header: 'Status', key: 'status' }
      ];

      const fileName = `product_management_report_${dateRange}days_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'pdf') {
        exportToPDF(exportData, 'Products Management Report', columns, fileName, 'reports');
      } else {
        exportToExcel(exportData, 'Product Management Report', columns, fileName);
      }
      
      toast.success(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export report as ${format.toUpperCase()}`);
    }
  };

  const getProductDescription = (category) => {
    const descriptions = {
      'vegetables': 'Fresh, ripe vegetables - perfect for salads, cooking, and daily nutrition',
      'fruits': 'Premium quality fruits - sweet, nutritious, and perfectly ripened',
      'leafy-greens': 'Fresh leafy greens - rich in vitamins and perfect for healthy meals',
      'root-vegetables': 'Farm-fresh root vegetables - essential for cooking and nutrition',
      'dairy-products': 'Pure, fresh dairy products - rich in calcium and essential nutrients',
      'animal-products': 'Fresh farm products - rich in protein and essential nutrients'
    };
    return descriptions[category] || 'High-quality farm product';
  };

  const getStatusText = (stockLevel) => {
    const statusMap = {
      'good': 'In Stock',
      'low': 'Low Stock',
      'critical': 'Critical',
      'overstock': 'Overstock'
    };
    return statusMap[stockLevel] || 'Unknown';
  };

  const MetricCard = ({ title, value, icon: Icon, color, change, description }) => (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${color || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center text-sm mt-2 ${
              change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : 
               change.startsWith('-') ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
              <span>{change}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-full bg-gray-100">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={reportData.performanceMetrics.totalProducts}
          icon={Package}
          description={`${reportData.performanceMetrics.activeProducts} active`}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${reportData.performanceMetrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+12.5%"
        />
        <MetricCard
          title="Units Sold"
          value={reportData.performanceMetrics.totalUnitsSold.toLocaleString()}
          icon={ShoppingCart}
          change="+8.3%"
        />
        <MetricCard
          title="Average Rating"
          value={reportData.performanceMetrics.averageRating}
          icon={Star}
          description={`${reportData.performanceMetrics.totalReviews} reviews`}
        />
      </div>

      {/* Inventory Status Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{reportData.inventoryStatus.inStock}</p>
            <p className="text-sm text-green-600">In Stock</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-700">{reportData.inventoryStatus.lowStock}</p>
            <p className="text-sm text-yellow-600">Low Stock</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">{reportData.inventoryStatus.outOfStock}</p>
            <p className="text-sm text-red-600">Out of Stock</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{reportData.inventoryStatus.overStock}</p>
            <p className="text-sm text-blue-600">Over Stock</p>
          </div>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {reportData.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center p-3 rounded-lg border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className={`p-1 rounded-full mr-3 ${
                  alert.type === 'critical' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'info' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-600">Priority: {alert.priority}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            Key Recommendations
          </h3>
          <div className="space-y-3">
            {reportData.recommendations.slice(0, 4).map((rec, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">{rec.title}</h4>
                <p className="text-xs text-blue-700 mt-1">{rec.description}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Comprehensive Product Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Complete Product Inventory</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center"
            >
              <FileText className="h-3 w-3 mr-1" />
              PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center"
            >
              <FileSpreadsheet className="h-3 w-3 mr-1" />
              Excel
            </button>
          </div>
        </div>
        
        {/* Responsive Table Container */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-gray-200" style={{minWidth: '1400px'}}>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '200px'}}>
                    Product Name
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '120px'}}>
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '250px'}}>
                    Description
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '100px'}}>
                    Price
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '120px'}}>
                    Stock Quantity
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '80px'}}>
                    Unit
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '130px'}}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.bestSellers.concat(reportData.worstPerformers).map((product, index) => {
                  const stockStatus = product.stockLevel || 'unknown';
                  const statusColor = 
                    stockStatus === 'good' ? 'bg-green-100 text-green-800' :
                    stockStatus === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    stockStatus === 'critical' ? 'bg-red-100 text-red-800' :
                    stockStatus === 'overstock' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800';
                  
                  return (
                    <tr key={`${product.name}-${index}`} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="max-w-[180px] truncate" title={product.name}>
                          {product.name}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {product.category?.replace('-', ' ')}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        <div className="max-w-[200px] truncate" title={`High-quality ${product.category?.replace('-', ' ')} product with excellent customer rating`}>
                          {product.category === 'vegetables' && 'Fresh, ripe vegetables - perfect for salads, cooking, and daily nutrition'}
                          {product.category === 'fruits' && 'Premium quality fruits - sweet, nutritious, and perfectly ripened'}
                          {product.category === 'leafy-greens' && 'Fresh leafy greens - rich in vitamins and perfect for healthy meals'}
                          {product.category === 'root-vegetables' && 'Farm-fresh root vegetables - essential for cooking and nutrition'}
                          {product.category === 'dairy-products' && 'Pure, fresh dairy products - rich in calcium and essential nutrients'}
                          {product.category === 'animal-products' && 'Fresh farm products - rich in protein and essential nutrients'}
                          {!['vegetables', 'fruits', 'leafy-greens', 'root-vegetables', 'dairy-products', 'animal-products'].includes(product.category) && 'High-quality farm product'}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        LKR {product.revenue ? (product.revenue / product.unitsSold).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.unitsSold || Math.floor(Math.random() * 100) + 20}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category === 'dairy-products' || product.category === 'animal-products' ? 'pack' : 'kg'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                          {stockStatus === 'good' && 'In Stock'}
                          {stockStatus === 'low' && 'Low Stock'}
                          {stockStatus === 'critical' && 'Critical'}
                          {stockStatus === 'overstock' && 'Overstock'}
                          {stockStatus === 'unknown' && 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Table Info */}
        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
          <span>Showing {reportData.bestSellers.length + reportData.worstPerformers.length} products</span>
          <span>Generated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Best and Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 text-green-600 mr-2" />
            Top Performers
          </h3>
          <div className="space-y-4">
            {reportData.bestSellers.slice(0, 5).map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">${product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{product.unitsSold} units</p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+{product.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
            Needs Attention
          </h3>
          <div className="space-y-4">
            {reportData.worstPerformers.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-700">${product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{product.unitsSold} units</p>
                  <div className="flex items-center text-red-600 text-sm mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>{product.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profitability Analysis */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Product</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Profit Margin</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Gross Profit</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Net Profit</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Profitability</th>
              </tr>
            </thead>
            <tbody>
              {reportData.profitabilityAnalysis.map((item) => (
                <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">{item.profitMargin}%</td>
                  <td className="py-3 px-3 text-sm text-gray-900">${item.grossProfit.toLocaleString()}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">${item.netProfit.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(item.profitMargin / 50) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-6">
      {/* Inventory Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Inventory Value"
          value={`$${reportData.inventoryStatus.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-50 to-blue-100"
        />
        <MetricCard
          title="In Stock"
          value={reportData.inventoryStatus.inStock}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-50 to-green-100"
        />
        <MetricCard
          title="Low Stock"
          value={reportData.inventoryStatus.lowStock}
          icon={AlertTriangle}
          color="bg-gradient-to-r from-yellow-50 to-yellow-100"
        />
        <MetricCard
          title="Out of Stock"
          value={reportData.inventoryStatus.outOfStock}
          icon={XCircle}
          color="bg-gradient-to-r from-red-50 to-red-100"
        />
        <MetricCard
          title="Over Stock"
          value={reportData.inventoryStatus.overStock}
          icon={Package}
          color="bg-gradient-to-r from-purple-50 to-purple-100"
        />
      </div>

      {/* Critical Inventory Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            Low Stock Items ({reportData.lowStockItems.length})
          </h3>
          <div className="space-y-3">
            {reportData.lowStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</p>
                  <p className="text-xs text-yellow-700">Stock: {item.current} / Min: {item.minimum}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-700">${item.value}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.reorderPoint === 'immediate' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.reorderPoint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            Out of Stock Items ({reportData.outOfStockItems.length})
          </h3>
          <div className="space-y-3">
            {reportData.outOfStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</p>
                  <p className="text-xs text-red-700">Out for {item.daysSinceStock} days</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-700">-${item.lostRevenue}</p>
                  <p className="text-xs text-gray-600">Lost revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Category Performance Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance Analysis</h3>
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
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {reportData.categoryPerformance.map((category) => (
                <tr key={category.category} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 text-sm font-medium text-gray-900">{category.category}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">${category.totalRevenue.toLocaleString()}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">{category.unitsSold.toLocaleString()}</td>
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
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(category.marketShare / 40) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{category.marketShare}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderQualityTab = () => (
    <div className="space-y-6">
      {/* Top Rated Products */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-600 mr-2" />
          Top Rated Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportData.topRatedProducts.map((product, index) => (
            <div key={product.name} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-yellow-700">#{index + 1}</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-bold text-yellow-700">{product.rating}</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
              <p className="text-xs text-yellow-600 mt-1">{product.reviews} reviews</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Overall Rating"
          value={reportData.performanceMetrics.averageRating}
          icon={Star}
          change="+0.2 from last period"
          description="Across all products"
        />
        <MetricCard
          title="Total Reviews"
          value={reportData.performanceMetrics.totalReviews}
          icon={Users}
          change="+145 new reviews"
          description="Customer feedback"
        />
        <MetricCard
          title="Customer Satisfaction"
          value="94.2%"
          icon={ThumbsUp}
          change="+2.1% improvement"
          description="Positive feedback rate"
        />
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            Success Factors
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Organic products show 35% higher profit margins
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Leafy greens have highest customer satisfaction (4.6★)
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Fresh vegetables drive 68% of repeat purchases
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Premium pricing accepted for quality products
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            Areas for Improvement
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Exotic products underperforming (avg 3.5★)
            </div>
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Stock management needs optimization
            </div>
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Seasonal demand forecasting gaps
            </div>
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Price optimization needed for slow movers
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            Strategic Recommendations
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Expand organic product portfolio by 40%
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Implement dynamic pricing strategies
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Bundle slow-moving with bestsellers
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Enhance customer education programs
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Action Items</h3>
        <div className="space-y-4">
          {reportData.recommendations.map((rec, index) => (
            <div key={index} className={`flex items-start p-4 rounded-lg border ${
              rec.priority === 'high' ? 'bg-red-50 border-red-200' :
              rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className={`p-1 rounded-full mr-3 mt-1 ${
                rec.priority === 'high' ? 'bg-red-500' :
                rec.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.priority} priority
                  </span>
                  <span className="text-xs text-gray-500">Impact: {rec.impact.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading comprehensive product management report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management Report</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of product performance, inventory status, and strategic insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="pdf">PDF Format</option>
            <option value="excel">Excel Format</option>
          </select>
          
          <button
            onClick={() => handleExport(exportFormat)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          
          <button
            onClick={loadReportData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabOptions.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'quality' && renderQualityTab()}
        {activeTab === 'financial' && renderPerformanceTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

export default ProductManagementReport;
