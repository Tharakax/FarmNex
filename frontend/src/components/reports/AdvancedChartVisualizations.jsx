import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar, ScatterChart, Scatter,
  TreemapChart, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Activity, Target, Layers,
  ArrowUp, ArrowDown, Minus, MoreHorizontal
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

const AdvancedChartVisualizations = ({ data, type = 'overview' }) => {
  const [activeChart, setActiveChart] = useState('revenue');
  const [timeframe, setTimeframe] = useState('12m');

  // Sample data for different chart types
  const revenueData = [
    { month: 'Jan', revenue: 4200, target: 4000, growth: 5 },
    { month: 'Feb', revenue: 3800, target: 4100, growth: -7.5 },
    { month: 'Mar', revenue: 5100, target: 4200, growth: 21.4 },
    { month: 'Apr', revenue: 6500, target: 4300, growth: 27.5 },
    { month: 'May', revenue: 7800, target: 4400, growth: 20.0 },
    { month: 'Jun', revenue: 8500, target: 4500, growth: 9.0 },
    { month: 'Jul', revenue: 9200, target: 4600, growth: 8.2 },
    { month: 'Aug', revenue: 8800, target: 4700, growth: -4.3 },
    { month: 'Sep', revenue: 9500, target: 4800, growth: 8.0 },
    { month: 'Oct', revenue: 10200, target: 4900, growth: 7.4 },
    { month: 'Nov', revenue: 11000, target: 5000, growth: 7.8 },
    { month: 'Dec', revenue: 12500, target: 5100, growth: 13.6 }
  ];

  const categoryPerformance = [
    { name: 'Vegetables', value: 35, amount: 45200, color: '#10B981', trend: 'up' },
    { name: 'Fruits', value: 28, amount: 35800, color: '#F59E0B', trend: 'up' },
    { name: 'Grains', value: 18, amount: 22500, color: '#8B5CF6', trend: 'stable' },
    { name: 'Dairy', value: 12, amount: 15200, color: '#EF4444', trend: 'down' },
    { name: 'Herbs', value: 7, amount: 6050, color: '#6B7280', trend: 'up' }
  ];

  const inventoryHealth = [
    { name: 'Healthy Stock', value: 168, percentage: 68, color: '#10B981' },
    { name: 'Low Stock', value: 42, percentage: 17, color: '#F59E0B' },
    { name: 'Critical Stock', value: 23, percentage: 9, color: '#EF4444' },
    { name: 'Overstock', value: 14, percentage: 6, color: '#6B7280' }
  ];

  const salesFunnel = [
    { stage: 'Leads', value: 1000, fill: '#10B981' },
    { stage: 'Prospects', value: 750, fill: '#34D399' },
    { stage: 'Qualified', value: 500, fill: '#6EE7B7' },
    { stage: 'Negotiation', value: 300, fill: '#A7F3D0' },
    { stage: 'Closed', value: 150, fill: '#D1FAE5' }
  ];

  const productScatter = [
    { name: 'Tomatoes', price: 5.99, sales: 1250, profit: 2.5, category: 'Vegetables' },
    { name: 'Spinach', price: 3.49, sales: 980, profit: 1.8, category: 'Leafy Greens' },
    { name: 'Bell Peppers', price: 4.25, sales: 756, profit: 2.1, category: 'Vegetables' },
    { name: 'Carrots', price: 2.99, sales: 890, profit: 1.5, category: 'Root Vegetables' },
    { name: 'Cucumbers', price: 1.99, sales: 675, profit: 1.2, category: 'Vegetables' },
    { name: 'Broccoli', price: 3.75, sales: 432, profit: 1.9, category: 'Cruciferous' }
  ];

  const renderRevenueChart = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Revenue Performance</h3>
          <p className="text-gray-600 mt-1">Monthly revenue vs targets with growth indicators</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="24m">Last 24 months</option>
          </select>
          <div className="flex items-center space-x-2 text-gray-500">
            <LineChartIcon className="h-5 w-5" />
            <span className="text-sm">Trend Analysis</span>
          </div>
        </div>
      </div>

      <div className="h-96 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                fontSize: '14px'
              }}
              formatter={(value, name) => [
                typeof value === 'number' ? 
                  (name === 'growth' ? `${value.toFixed(1)}%` : `$${value.toLocaleString()}`) : 
                  value,
                name === 'revenue' ? 'Revenue' : 
                name === 'target' ? 'Target' : 'Growth'
              ]}
            />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              name="Actual Revenue" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="left"
              dataKey="target" 
              name="Target" 
              fill="#E5E7EB" 
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="growth" 
              name="Growth %" 
              stroke="#F59E0B" 
              strokeWidth={3}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-emerald-900">Total Revenue</h4>
          </div>
          <div className="text-2xl font-bold text-emerald-900">$95,700</div>
          <div className="text-sm text-emerald-700 mt-1">+12.5% from last year</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-blue-900">Target Achievement</h4>
          </div>
          <div className="text-2xl font-bold text-blue-900">147%</div>
          <div className="text-sm text-blue-700 mt-1">Exceeded annual target</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-amber-900">Average Growth</h4>
          </div>
          <div className="text-2xl font-bold text-amber-900">8.7%</div>
          <div className="text-sm text-amber-700 mt-1">Monthly growth rate</div>
        </div>
      </div>
    </div>
  );

  const renderCategoryChart = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Category Performance</h3>
          <p className="text-gray-600 mt-1">Revenue distribution and trends by product category</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <PieChartIcon className="h-5 w-5" />
          <span className="text-sm">Category Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryPerformance}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}% ($${props.payload.amount.toLocaleString()})`,
                  'Market Share'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <FontAwesomeIcon icon={faLeaf} className="h-8 w-8 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-700">100%</p>
              <p className="text-xs text-gray-500">Coverage</p>
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div className="space-y-4">
          {categoryPerformance.map((category, index) => {
            const TrendIcon = category.trend === 'up' ? TrendingUp : 
                             category.trend === 'down' ? TrendingDown : Minus;
            const trendColor = category.trend === 'up' ? 'text-green-500' : 
                              category.trend === 'down' ? 'text-red-500' : 'text-gray-400';
            
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <div>
                    <div className="font-semibold text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600">{category.value}% market share</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-gray-900">${category.amount.toLocaleString()}</span>
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderInventoryHealthChart = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Inventory Health</h3>
          <p className="text-gray-600 mt-1">Stock level distribution across all products</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm">Stock Analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radial Bar Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="30%" 
              outerRadius="90%" 
              data={inventoryHealth}
              startAngle={90} 
              endAngle={450}
            >
              <RadialBar 
                dataKey="percentage" 
                cornerRadius={10} 
                fill={(entry) => entry.color}
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}% (${props.payload.value} products)`,
                  'Stock Level'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Metrics */}
        <div className="space-y-6">
          {inventoryHealth.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.percentage}% of inventory</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductScatterChart = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Product Performance Matrix</h3>
          <p className="text-gray-600 mt-1">Price vs Sales correlation with profitability indicators</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <Layers className="h-5 w-5" />
          <span className="text-sm">Correlation Analysis</span>
        </div>
      </div>

      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            data={productScatter}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="price" 
              name="Price" 
              unit="$"
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              type="number" 
              dataKey="sales" 
              name="Sales" 
              unit=" units"
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900">{data.name}</p>
                      <p className="text-sm text-gray-600">Category: {data.category}</p>
                      <p className="text-sm text-emerald-600">Price: ${data.price}</p>
                      <p className="text-sm text-blue-600">Sales: {data.sales} units</p>
                      <p className="text-sm text-purple-600">Profit: ${data.profit}k</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Products" dataKey="sales" fill="#10B981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Quadrants */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">High Price, High Sales</h4>
          <p className="text-sm text-green-700">Premium products with strong demand</p>
          <div className="mt-3 space-y-1">
            <div className="text-xs text-green-600">• Organic Tomatoes</div>
            <div className="text-xs text-green-600">• Bell Peppers</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Low Price, High Sales</h4>
          <p className="text-sm text-blue-700">Volume drivers with mass appeal</p>
          <div className="mt-3 space-y-1">
            <div className="text-xs text-blue-600">• Carrots</div>
            <div className="text-xs text-blue-600">• Cucumbers</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Chart Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-1">
          {[
            { id: 'revenue', name: 'Revenue Trends', icon: LineChartIcon },
            { id: 'categories', name: 'Categories', icon: PieChartIcon },
            { id: 'inventory', name: 'Inventory Health', icon: BarChart3 },
            { id: 'performance', name: 'Product Matrix', icon: Layers }
          ].map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeChart === chart.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{chart.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Content */}
      <div>
        {activeChart === 'revenue' && renderRevenueChart()}
        {activeChart === 'categories' && renderCategoryChart()}
        {activeChart === 'inventory' && renderInventoryHealthChart()}
        {activeChart === 'performance' && renderProductScatterChart()}
      </div>
    </div>
  );
};

export default AdvancedChartVisualizations;