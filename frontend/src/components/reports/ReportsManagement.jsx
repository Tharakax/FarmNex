import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Filter,
  Eye,
  Users,
  Truck,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reportAPI } from '../../services/reportAPI';

// Import individual report components
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import ProductPerformanceReport from './ProductPerformanceReport';
import SuppliesReport from './SuppliesReport';

const ReportsManagement = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30'); // days
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    overview: {},
    sales: [],
    inventory: [],
    products: [],
    supplies: [],
    financial: {}
  });

  // Report menu items
  const reportMenuItems = [
    {
      id: 'overview',
      name: 'Dashboard Overview',
      icon: BarChart3,
      description: 'Key metrics and performance indicators',
      color: 'bg-blue-500'
    },
    {
      id: 'sales',
      name: 'Sales Analytics',
      icon: TrendingUp,
      description: 'Sales trends, revenue, and customer insights',
      color: 'bg-green-500'
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      icon: Package,
      description: 'Stock levels, turnover, and alerts',
      color: 'bg-yellow-500'
    },
    {
      id: 'products',
      name: 'Product Performance',
      icon: ShoppingCart,
      description: 'Best sellers, profitability analysis',
      color: 'bg-purple-500'
    },
    {
      id: 'supplies',
      name: 'Farm Supplies',
      icon: Truck,
      description: 'Supply usage, costs, and reorder alerts',
      color: 'bg-orange-500'
    },
  ];

  // Date range options
  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Fetch overview data from the API
      const response = await reportAPI.getOverviewData(dateRange);
      
      if (response.success) {
        setReportData({
          overview: response.data,
          // Other report data would be loaded here
        });
      } else {
        throw new Error('Failed to fetch overview data');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
      setLoading(false);
    }
  };

  // Overview Dashboard Component
  const OverviewDashboard = () => {
    const { overview } = reportData;
    
    const statsCards = [
      {
        title: 'Total Revenue',
        value: `$${overview.totalRevenue?.toLocaleString() || 0}`,
        change: '+12.5%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'bg-green-500'
      },
      {
        title: 'Total Orders',
        value: overview.totalOrders?.toLocaleString() || 0,
        change: '+8.3%',
        changeType: 'positive',
        icon: ShoppingCart,
        color: 'bg-blue-500'
      },
      {
        title: 'Average Order Value',
        value: `$${overview.averageOrderValue || 0}`,
        change: '+5.1%',
        changeType: 'positive',
        icon: TrendingUp,
        color: 'bg-purple-500'
      },
      {
        title: 'Products Sold',
        value: overview.productsSold?.toLocaleString() || 0,
        change: '+15.2%',
        changeType: 'positive',
        icon: Package,
        color: 'bg-orange-500'
      },
      {
        title: 'Inventory Value',
        value: `$${overview.inventoryValue?.toLocaleString() || 0}`,
        change: '-2.1%',
        changeType: 'negative',
        icon: Truck,
        color: 'bg-yellow-500'
      },
      {
        title: 'Active Customers',
        value: '1,234',
        change: '+9.7%',
        changeType: 'positive',
        icon: Users,
        color: 'bg-indigo-500'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Farm Performance Overview</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Last {dateRange} days</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className={`inline-flex items-center text-sm mt-2 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Categories</h3>
            <div className="space-y-3">
              {['Vegetables', 'Fruits', 'Dairy Products', 'Leafy Greens'].map((category, index) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${100 - (index * 15)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{100 - (index * 15)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts & Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
                  <p className="text-xs text-yellow-600">5 products below minimum threshold</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Sales Trending Up</p>
                  <p className="text-xs text-blue-600">15% increase this week</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Revenue Target</p>
                  <p className="text-xs text-green-600">85% of monthly goal achieved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render active report content
  const renderReportContent = () => {
    switch (activeReport) {
      case 'sales':
        return <SalesReport dateRange={dateRange} />;
      case 'inventory':
        return <InventoryReport dateRange={dateRange} />;
      case 'products':
        return <ProductPerformanceReport dateRange={dateRange} />;
      case 'supplies':
        return <SuppliesReport dateRange={dateRange} />;
      case 'overview':
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track performance, analyze trends, and make data-driven decisions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={loadReportData}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeReport === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveReport(item.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isActive
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`font-semibold ${
                    isActive ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {item.name}
                  </h3>
                </div>
                <p className={`text-sm ${
                  isActive ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading report data...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {renderReportContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;
