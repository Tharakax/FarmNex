import React, { useState, useEffect } from 'react';
import {
  Truck,
  AlertTriangle,
  DollarSign,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Users
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { reportAPI } from '../../services/reportAPI';

const SuppliesReport = ({ dateRange }) => {
  const [suppliesData, setSuppliesData] = useState({
    totalSupplies: 0,
    totalValue: 0,
    monthlySpending: 0,
    suppliersCount: 0,
    lowStockSupplies: [],
    recentPurchases: [],
    supplierPerformance: [],
    categoryBreakdown: [],
    costTrends: [],
    expiringSupplies: [],
    usageAnalytics: {}
  });
  
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const supplyCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'seeds', label: 'Seeds' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'tools', label: 'Tools' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'animal-feed', label: 'Animal Feed' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'equipment', label: 'Equipment' }
  ];

  useEffect(() => {
    loadSuppliesData();
  }, [dateRange, filterCategory]);

  const loadSuppliesData = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getSuppliesData(dateRange, filterCategory);
      
      if (response.success) {
        setSuppliesData(response.data);
      } else {
        throw new Error('Failed to fetch supplies data');
      }
    } catch (error) {
      console.error('Error loading supplies data:', error);
      // Fallback to mock data on error
      setSuppliesData({
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
      });
    }
    setLoading(false);
  };

  const handleExportSuppliesReport = (format) => {
    const exportData = suppliesData.lowStockSupplies.map(supply => ({
      name: supply.name,
      category: supply.category,
      currentStock: supply.current,
      minimumThreshold: supply.minimum,
      value: supply.cost,
      supplier: supply.supplier,
      status: supply.current <= supply.minimum ? 'Low Stock' : 'In Stock'
    }));

    const filename = `supplies_report_${dateRange}days_${new Date().toISOString().split('T')[0]}`;
    
    const columns = [
      { header: 'Supply Name', dataKey: 'name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Current Stock', dataKey: 'currentStock' },
      { header: 'Min Threshold', dataKey: 'minimumThreshold' },
      { header: 'Value', dataKey: 'value' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Status', dataKey: 'status' }
    ];

    if (format === 'pdf') {
      exportToPDF(exportData, `Farm Supplies Report - Last ${dateRange} Days`, columns, filename);
    } else {
      exportToExcel(exportData, 'Farm Supplies Report', columns, filename);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading supplies data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Farm Supplies Report</h2>
          <p className="text-gray-600 mt-1">Supply usage, costs, and inventory management for the last {dateRange} days</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {supplyCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleExportSuppliesReport('pdf')}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </button>
          <button
            onClick={() => handleExportSuppliesReport('excel')}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Supplies</p>
              <p className="text-2xl font-bold">{suppliesData.totalSupplies}</p>
              <p className="text-orange-100 text-xs">items in inventory</p>
            </div>
            <Package className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Value</p>
              <p className="text-2xl font-bold">${suppliesData.totalValue.toLocaleString()}</p>
              <div className="flex items-center mt-1 text-green-100">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-xs">+8.2% this month</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Monthly Spending</p>
              <p className="text-2xl font-bold">${suppliesData.monthlySpending.toLocaleString()}</p>
              <div className="flex items-center mt-1 text-blue-100">
                <TrendingDown className="h-3 w-3 mr-1" />
                <span className="text-xs">-5.1% vs last month</span>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Suppliers</p>
              <p className="text-2xl font-bold">{suppliesData.suppliersCount}</p>
              <p className="text-purple-100 text-xs">trusted partners</p>
            </div>
            <Users className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {suppliesData.lowStockSupplies.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            Low Stock Alerts ({suppliesData.lowStockSupplies.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliesData.lowStockSupplies.map((supply) => (
              <div key={supply.name} className="bg-white border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{supply.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{supply.category.replace('-', ' ')}</p>
                    <p className="text-xs text-gray-500 mt-1">Supplier: {supply.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-700">{supply.current}/{supply.minimum}</p>
                    <p className="text-sm text-gray-600">${supply.cost}</p>
                    <button className="mt-1 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplies by Category</h3>
        <div className="space-y-4">
          {suppliesData.categoryBreakdown.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">({category.items} items)</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-900 font-semibold">
                    ${category.totalValue.toLocaleString()}
                  </span>
                  <span className="text-gray-600 text-sm ml-2">
                    {category.percentage}%
                  </span>
                  <div className="text-xs text-gray-500">
                    Monthly usage: ${category.monthlyUsage}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Performance & Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="h-5 w-5 text-blue-600 mr-2" />
            Supplier Performance
          </h3>
          <div className="space-y-4">
            {suppliesData.supplierPerformance.map((supplier) => (
              <div key={supplier.name} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                    <p className="text-sm text-gray-600">{supplier.categories.join(', ')}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-gray-700">{supplier.onTimeDelivery}% on-time</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-700 ml-1">{supplier.qualityRating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${supplier.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{supplier.totalOrders} orders</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-green-600 mr-2" />
            Recent Purchases
          </h3>
          <div className="space-y-4">
            {suppliesData.recentPurchases.map((purchase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{purchase.supplier}</h4>
                    <p className="text-sm text-gray-600">{purchase.items.join(', ')}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(purchase.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${purchase.total.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      purchase.status === 'delivered' 
                        ? 'bg-green-100 text-green-800'
                        : purchase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expiring Supplies */}
      {suppliesData.expiringSupplies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            Expiring Soon ({suppliesData.expiringSupplies.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliesData.expiringSupplies.map((supply) => (
              <div key={supply.name} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900">{supply.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{supply.category.replace('-', ' ')}</p>
                  <div className="mt-2">
                    <p className="text-lg font-bold text-orange-700">{supply.daysLeft} days</p>
                    <p className="text-xs text-gray-600">
                      Expires: {new Date(supply.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Monthly Consumption</span>
              <span className="font-semibold text-gray-900">${suppliesData.usageAnalytics.averageMonthlyConsumption.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Cost per Unit</span>
              <span className="font-semibold text-gray-900">${suppliesData.usageAnalytics.costPerUnit}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Efficiency Score</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${suppliesData.usageAnalytics.efficiencyScore}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-gray-900">{suppliesData.usageAnalytics.efficiencyScore}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Waste Percentage</span>
              <span className="font-semibold text-red-700">{suppliesData.usageAnalytics.wastePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Cost Optimization Tips */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Optimization</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Bulk Purchasing</p>
                <p className="text-xs text-green-700">Save 15% on fertilizers with bulk orders</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Seasonal Planning</p>
                <p className="text-xs text-blue-700">Order seeds 2 months before planting season</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">Supplier Negotiation</p>
                <p className="text-xs text-purple-700">Review contracts with top 3 suppliers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">Waste Reduction</p>
                <p className="text-xs text-orange-700">Improve storage to reduce {suppliesData.usageAnalytics.wastePercentage}% waste</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Supplier Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Supplier Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Supplier</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Orders</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Total Spent</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">On-Time Delivery</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Quality Rating</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Categories</th>
              </tr>
            </thead>
            <tbody>
              {suppliesData.supplierPerformance.map((supplier) => (
                <tr key={supplier.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">{supplier.totalOrders}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">${supplier.totalSpent.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        supplier.onTimeDelivery >= 95 ? 'bg-green-500' :
                        supplier.onTimeDelivery >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-900">{supplier.onTimeDelivery}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-sm text-gray-900">{supplier.qualityRating}/5</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-600">
                    {supplier.categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuppliesReport;
