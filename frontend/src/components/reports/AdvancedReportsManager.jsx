import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart,
  Calendar, Download, FileText, Users, Truck, Activity,
  Zap, Target, Award, AlertTriangle, CheckCircle, ArrowUpRight,
  ArrowDownRight, RefreshCw, Filter, Search, MoreHorizontal,
  Leaf, Droplets, Sun, Wind
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

const AdvancedReportsManager = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'orders', 'products']);

  // Sample data for demonstration - replace with real API data
  const trendsData = [
    { month: 'Jan', revenue: 4200, orders: 124, products: 89, customers: 45 },
    { month: 'Feb', revenue: 3800, orders: 98, products: 76, customers: 52 },
    { month: 'Mar', revenue: 5100, orders: 156, products: 112, customers: 68 },
    { month: 'Apr', revenue: 6500, orders: 198, products: 145, customers: 84 },
    { month: 'May', revenue: 7800, orders: 234, products: 167, customers: 96 },
    { month: 'Jun', revenue: 8500, orders: 267, products: 189, customers: 108 },
    { month: 'Jul', revenue: 9200, orders: 289, products: 203, customers: 124 },
    { month: 'Aug', revenue: 8800, orders: 276, products: 198, customers: 118 },
    { month: 'Sep', revenue: 7500, orders: 245, products: 176, customers: 102 },
    { month: 'Oct', revenue: 6800, orders: 212, products: 154, customers: 89 },
    { month: 'Nov', revenue: 5900, orders: 187, products: 134, customers: 76 },
    { month: 'Dec', revenue: 4800, orders: 156, products: 118, customers: 63 }
  ];

  const categoryData = [
    { name: 'Vegetables', value: 35, color: '#10B981' },
    { name: 'Fruits', value: 28, color: '#F59E0B' },
    { name: 'Grains', value: 18, color: '#8B5CF6' },
    { name: 'Dairy', value: 12, color: '#EF4444' },
    { name: 'Others', value: 7, color: '#6B7280' }
  ];

  const performanceData = [
    { category: 'Organic Tomatoes', sales: 1247, revenue: 15678, growth: 12.5, trend: 'up' },
    { category: 'Fresh Carrots', sales: 982, revenue: 8934, growth: 8.3, trend: 'up' },
    { category: 'Sweet Corn', sales: 756, revenue: 6789, growth: -2.1, trend: 'down' },
    { category: 'Bell Peppers', sales: 634, revenue: 7456, growth: 15.2, trend: 'up' },
    { category: 'Spinach', sales: 523, revenue: 4567, growth: 5.7, trend: 'up' },
    { category: 'Potatoes', sales: 892, revenue: 5234, growth: -0.8, trend: 'down' },
    { category: 'Lettuce', sales: 445, revenue: 3456, growth: 18.9, trend: 'up' },
    { category: 'Onions', sales: 667, revenue: 2890, growth: 6.4, trend: 'up' }
  ];

  // Key metrics cards data
  const keyMetrics = [
    {
      title: 'Total Revenue',
      value: '$84,247',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-emerald-500',
      description: 'Monthly revenue growth'
    },
    {
      title: 'Total Orders',
      value: '2,847',
      change: '+8.3%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      description: 'Orders processed'
    },
    {
      title: 'Active Products',
      value: '156',
      change: '+15.2%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-purple-500',
      description: 'Available products'
    },
    {
      title: 'Customer Base',
      value: '1,234',
      change: '+9.7%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-orange-500',
      description: 'Active customers'
    }
  ];

  const renderOverviewReport = () => (
    <div className="space-y-8">
      {/* Header with FarmNex Branding */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faLeaf} className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FarmNex Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive Farm Performance Report</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${metric.color} p-3 rounded-lg shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue & Orders Trends</h3>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">12 months overview</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="revenue" orientation="left" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar yAxisId="revenue" dataKey="revenue" name="Revenue ($)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Product Categories</h3>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Sales distribution</span>
            </div>
          </div>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <FontAwesomeIcon icon={faLeaf} className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">100%</p>
                <p className="text-xs text-gray-500">Coverage</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category.color }}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Product Performance Analysis</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Product</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Sales</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Revenue</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Growth</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-900">Trend</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((product, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faLeaf} className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">{product.category}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    {product.sales.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`flex items-center justify-end ${
                      product.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.growth > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="font-semibold">{Math.abs(product.growth)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.trend === 'up' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.trend === 'up' ? 'Rising' : 'Declining'}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {renderOverviewReport()}
      </div>
    </div>
  );
};

export default AdvancedReportsManager;