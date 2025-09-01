import React from 'react';
import { Package, DollarSign, AlertTriangle, Star } from 'lucide-react';

const ProductStats = ({ products = [] }) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + ((product.stock?.current || 0) * product.price), 0);
    const lowStockCount = products.filter(product => {
      const current = product.stock?.current || 0;
      const minimum = product.stock?.minimum || 5;
      return current > 0 && current <= minimum;
    }).length;
    const outOfStockCount = products.filter(product => (product.stock?.current || 0) === 0).length;
    const featuredCount = products.filter(product => product.isFeatured).length;
    
    // Category breakdown
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryStats).reduce(
      (max, [category, count]) => count > max.count ? { category, count } : max,
      { category: 'None', count: 0 }
    );

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      featuredCount,
      topCategory,
      categoryStats
    };
  }, [products]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Inventory Value',
      value: `$${stats.totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockCount,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Featured Products',
      value: stats.featuredCount,
      icon: Star,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4 border border-opacity-20`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          {Object.keys(stats.categoryStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.categoryStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category.replace('-', ' ')}
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(count / stats.totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 min-w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No products available</p>
          )}
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Most Popular Category</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {stats.topCategory.category.replace('-', ' ')} ({stats.topCategory.count})
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock Health</span>
              <span className={`text-sm font-medium ${
                stats.outOfStockCount === 0 && stats.lowStockCount === 0 
                  ? 'text-green-600' 
                  : stats.outOfStockCount > 0 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
              }`}>
                {stats.outOfStockCount === 0 && stats.lowStockCount === 0 
                  ? 'Excellent' 
                  : stats.outOfStockCount > 0 
                    ? 'Needs Attention' 
                    : 'Good'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Featured Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.totalProducts > 0 ? Math.round((stats.featuredCount / stats.totalProducts) * 100) : 0}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Price</span>
              <span className="text-sm font-medium text-gray-900">
                ${stats.totalProducts > 0 
                  ? (products.reduce((sum, p) => sum + p.price, 0) / stats.totalProducts).toFixed(2)
                  : '0.00'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.outOfStockCount > 0 || stats.lowStockCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Stock Alerts</h4>
              <div className="text-sm text-yellow-700 mt-1">
                {stats.outOfStockCount > 0 && (
                  <p>• {stats.outOfStockCount} product{stats.outOfStockCount !== 1 ? 's are' : ' is'} out of stock</p>
                )}
                {stats.lowStockCount > 0 && (
                  <p>• {stats.lowStockCount} product{stats.lowStockCount !== 1 ? 's have' : ' has'} low stock levels</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStats;
