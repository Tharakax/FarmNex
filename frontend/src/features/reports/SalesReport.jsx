import React, { useState, useEffect, useCallback } from 'react';
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
  Filter,
  RefreshCw,
  Clock,
  BarChart3
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils';
import { reportAPI } from '../../services/reportAPI';
import { realtime } from '../../services/realtime';
import { orderAPI } from '../../services/orderAPI';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/currencyUtils.js';

// getCurrentSeason function 
const getCurrentSeason = (date = new Date()) => {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

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
  const [exporting, setExporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange || 30);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveMode, setLiveMode] = useState('off');
  const [lastOrdersSig, setLastOrdersSig] = useState(null);
  const pollIntervalMs = Number(import.meta.env.VITE_REPORT_POLL_INTERVAL_MS || 5000);

  const loadSalesData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await reportAPI.getSalesData(selectedDateRange, selectedCategory, { scope: import.meta.env.VITE_DEFAULT_REPORT_SCOPE || 'auto' });
      
      if (response.success) {
        setSalesData(response.data);
        setLastUpdated(new Date());
        
        if (response.generated) {
          console.log('✨ Using generated sales data with current seasonality');
        }
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error('⚠️ Failed to load sales data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDateRange, selectedCategory]);

  useEffect(() => {
    loadSalesData();
  }, [loadSalesData]);

  // Realtime: refresh sales data when order/payment events occur
  useEffect(() => {
    // Connect once; the client manages reconnection
    realtime.connect();
    const offStatus = realtime.onStatusChange(({ connected, mode }) => { setLiveConnected(connected); setLiveMode(mode || 'off'); });
    const unsubscribe = realtime.subscribe([
      'payment.completed',
      'order.created',
      'order.updated'
    ], () => {
      // Light refresh on realtime events
      loadSalesData(true);
    });
    return () => {
      offStatus?.();
      unsubscribe?.();
    };
  }, [loadSalesData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSalesData(true);
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [autoRefresh, loadSalesData]);

  // Polling fallback when websocket is offline and auto-refresh is disabled
  useEffect(() => {
    if (liveConnected || autoRefresh) return; // Only poll when offline and auto-refresh is off

    let canceled = false;
    let timer;

    const computeSig = (orders = []) => {
      const latestTs = orders.reduce((max, o) => {
        const ts = new Date(o.createdAt || o.orderDate || o.date || o.timestamp || 0).getTime();
        return Math.max(max, isNaN(ts) ? 0 : ts);
      }, 0);
      return `${orders.length}|${latestTs}`;
    };

    const poll = async () => {
      try {
        const res = await orderAPI.getMyOrders();
        if (res?.success) {
          const sig = computeSig(res.data || []);
          if (lastOrdersSig === null) {
            setLastOrdersSig(sig); // establish baseline without refresh on first poll
          } else if (sig !== lastOrdersSig) {
            setLastOrdersSig(sig);
            await loadSalesData(true);
          }
        }
      } catch (e) {
        // ignore errors during polling
      }
      if (!canceled) {
        timer = setTimeout(poll, pollIntervalMs);
      }
    };

    timer = setTimeout(poll, pollIntervalMs);
    return () => {
      canceled = true;
      if (timer) clearTimeout(timer);
    };
  }, [liveConnected, autoRefresh, lastOrdersSig, pollIntervalMs, loadSalesData]);

  // Date range options
  const dateRangeOptions = [
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
    { value: 180, label: '6 Months' },
    { value: 365, label: '1 Year' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'root-vegetables', label: 'Root Vegetables' },
    { value: 'dairy-products', label: 'Dairy Products' },
    { value: 'animal-products', label: 'Animal Products' }
  ];

  const handleManualRefresh = () => {
    loadSalesData(true);
    toast.success('🔄 Sales data refreshed!');
  };

  const currentSeason = getCurrentSeason();
  const seasonEmojis = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂', 
    winter: '❄️'
  };

  const handleExportSalesReport = async (format) => {
    if (exporting) return; // Prevent multiple clicks
    
    setExporting(true);
    try {
      if (format === 'pdf') {
        // Use backend PDF service for professional reports
        await reportAPI.exportSalesPDF(selectedDateRange, selectedCategory);
        toast.success('📄 Sales report PDF downloaded successfully!');
      } else {
        // Use client-side Excel export for quick data export
        const exportData = {
          summary: [
            ['Total Revenue', formatCurrency(salesData.totalRevenue)],
            ['Total Orders', salesData.totalOrders.toString()],
            ['Average Order Value', formatCurrency(salesData.averageOrderValue)],
            ['Revenue Change', `${salesData.revenueChange > 0 ? '+' : ''}${salesData.revenueChange}%`],
            ['Orders Change', `${salesData.ordersChange > 0 ? '+' : ''}${salesData.ordersChange}%`]
          ],
          topProducts: salesData.topProducts,
          dailySales: salesData.dailySales,
          categorySales: salesData.categorySales
        };

        const filename = `sales_report_${selectedDateRange}days_${new Date().toISOString().split('T')[0]}`;
        
        await exportToExcel(
          exportData.topProducts,
          'Sales Report',
          [
            { header: 'Product Name', key: 'name' },
            { header: 'Revenue', key: 'revenue' },
            { header: 'Orders', key: 'orders' },
            { header: 'Growth %', key: 'growth' }
          ],
          filename
        );
        toast.success('📊 Sales report Excel downloaded successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`❌ Failed to export report: ${error.message}`);
    } finally {
      setExporting(false);
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">Sales Analytics</h2>
              <span className="text-lg">{seasonEmojis[currentSeason]}</span>
              <span className="text-sm text-gray-500 capitalize">({currentSeason})</span>
            </div>
            <p className="text-gray-600 mt-1">
              Revenue trends and sales performance for the last {selectedDateRange} days
              {lastUpdated && (
                <span className="ml-2 text-xs text-gray-500">
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => handleExportSalesReport('pdf')}
              disabled={exporting}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              ) : (
                <FileText className="h-4 w-4 mr-1" />
              )}
              {exporting ? 'Generating...' : 'PDF'}
            </button>
            <button
              onClick={() => handleExportSalesReport('excel')}
              disabled={exporting}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-1" />
              )}
              {exporting ? 'Exporting...' : 'Excel'}
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <Clock className="h-4 w-4" />
              <span>Auto-refresh</span>
            </label>
            
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${liveConnected ? 'text-green-700 bg-green-50' : (autoRefresh ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50')}`}>
              <BarChart3 className="h-3 w-3" />
              <span>
                {liveConnected
                  ? (liveMode === 'ws' ? 'Live (WS)' : liveMode === 'sse' ? 'Live (SSE)' : 'Live')
                  : (autoRefresh ? 'Auto (60s)' : `Polling (${Math.max(1, Math.round(pollIntervalMs/1000))}s)`)
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</p>
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
              <p className="text-2xl font-bold">{formatCurrency(salesData.averageOrderValue)}</p>
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
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Daily Sales Trend</h3>
          {salesData.seasonalContext && (
            <div className="text-sm text-gray-500">
              {seasonEmojis[salesData.seasonalContext.currentSeason]} {salesData.seasonalContext.currentSeason} season impact
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {salesData.dailySales.map((day, index) => {
              const isWeekend = new Date(day.date).getDay() % 6 === 0;
              return (
                <div key={day.date} className="space-y-2">
                  <div className={`text-xs font-medium ${
                    isWeekend ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div 
                    className={`rounded-md flex items-end justify-center text-white text-xs font-medium transition-colors ${
                      isWeekend ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      height: `${Math.max(20, (day.revenue / Math.max(...salesData.dailySales.map(d => d.revenue))) * 100)}px` 
                    }}
                  >
                    {formatCurrency(day.revenue / 1000, 0)}k
                  </div>
                  <div className="text-xs text-gray-600">
                    {day.orders} orders
                    <br />
                    <span className="text-gray-400">
                      {formatCurrency(day.revenue / Math.max(1, day.orders), 0)} avg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Weekdays</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Weekends</span>
              </div>
            </div>
            <div>
              Total: {formatCurrency(salesData.dailySales.reduce((sum, day) => sum + day.revenue, 0))}
            </div>
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
