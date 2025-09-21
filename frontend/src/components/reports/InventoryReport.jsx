import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  FileText,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { reportAPI } from '../../services/reportAPI';

const InventoryReport = ({ dateRange }) => {
  const [inventoryData, setInventoryData] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: [],
    outOfStockItems: [],
    overStockItems: [],
    stockTurnoverRate: 0,
    averageDaysToSell: 0,
    categoryBreakdown: [],
    stockMovements: [],
    alerts: []
  });
  
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadInventoryData();
  }, [dateRange, filterStatus]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getInventoryData(dateRange, filterStatus);
      
      if (response.success) {
        setInventoryData(response.data);
      } else {
        throw new Error('Failed to fetch inventory data');
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
      // Fallback to mock data on error
      setInventoryData({
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
      });
    }
    setLoading(false);
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'low-stock': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'out-of-stock': return 'text-red-600 bg-red-50 border-red-200';
      case 'over-stock': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-stock': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'low-stock': return AlertTriangle;
      case 'out-of-stock': return XCircle;
      case 'over-stock': return Package;
      case 'in-stock': return CheckCircle;
      default: return Package;
    }
  };

  const handleExportInventoryReport = (format) => {
    const exportData = inventoryData.lowStockItems.concat(
      inventoryData.overStockItems.map(item => ({ ...item, status: 'Over Stock' }))
    ).concat(
      inventoryData.outOfStockItems.map(item => ({ ...item, current: 0, status: 'Out of Stock' }))
    );

    const filename = `inventory_report_${dateRange}days_${new Date().toISOString().split('T')[0]}`;
    
    const columns = [
      { header: 'Product Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Current Stock', dataKey: 'current' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Value', dataKey: 'value' }
    ];

    if (format === 'pdf') {
      exportToPDF(exportData, `Inventory Report - Last ${dateRange} Days`, columns, filename, 'reports');
    } else {
      exportToExcel(exportData, 'Inventory Report', columns, filename);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory Report</h2>
          <p className="text-gray-600 mt-1">Stock levels, turnover rates, and inventory alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportInventoryReport('pdf')}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </button>
          <button
            onClick={() => handleExportInventoryReport('excel')}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryData.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">${inventoryData.totalValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stock Turnover Rate</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryData.stockTurnoverRate}x</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Days to Sell</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryData.averageDaysToSell}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Stock Alerts Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {inventoryData.alerts.map((alert) => {
            const alertConfig = {
              'low-stock': { label: 'Low Stock', icon: AlertTriangle, color: 'yellow' },
              'out-of-stock': { label: 'Out of Stock', icon: XCircle, color: 'red' },
              'over-stock': { label: 'Over Stock', icon: Package, color: 'blue' },
              'expiring-soon': { label: 'Expiring Soon', icon: Clock, color: 'orange' }
            }[alert.type];

            const Icon = alertConfig.icon;
            
            return (
              <div key={alert.type} className={`p-4 rounded-lg border-2 border-${alertConfig.color}-200 bg-${alertConfig.color}-50`}>
                <div className="flex items-center space-x-3">
                  <Icon className={`h-6 w-6 text-${alertConfig.color}-600`} />
                  <div>
                    <p className={`font-medium text-${alertConfig.color}-900`}>{alertConfig.label}</p>
                    <p className={`text-lg font-bold text-${alertConfig.color}-900`}>{alert.count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Status Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            Low Stock Items ({inventoryData.lowStockItems.length})
          </h3>
          <div className="space-y-3">
            {inventoryData.lowStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-700">{item.current}/{item.minimum}</p>
                  <p className="text-sm text-gray-600">${item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            Out of Stock Items ({inventoryData.outOfStockItems.length})
          </h3>
          <div className="space-y-3">
            {inventoryData.outOfStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">0 units</p>
                  <p className="text-xs text-gray-600">
                    Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Value by Category</h3>
        <div className="space-y-4">
          {inventoryData.categoryBreakdown.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">({category.totalItems} items)</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-900 font-semibold">
                    ${category.value.toLocaleString()}
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

      {/* Recent Stock Movements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Movements</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Product</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Quantity</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.stockMovements.map((movement, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-3 text-sm text-gray-900">
                    {new Date(movement.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      movement.type === 'sale' ? 'bg-red-100 text-red-800' :
                      movement.type === 'restock' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-900">{movement.product}</td>
                  <td className={`py-3 px-3 text-sm font-medium ${
                    movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-600">{movement.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overstock Items (if any) */}
      {inventoryData.overStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            Over Stock Items ({inventoryData.overStockItems.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inventoryData.overStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-700">{item.current}/{item.maximum}</p>
                  <p className="text-sm text-gray-600">${item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReport;
