import React from 'react';
import { 
  FaWarning, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaTruck,
  FaClock,
  FaChartBar
} from 'react-icons/fa';

const StockDisplay = ({ stock, unit = 'unit', showDetailedView = false }) => {
  // Handle both old and new stock formats
  const getCurrentStock = () => {
    if (typeof stock === 'number') return stock;
    if (stock && typeof stock === 'object') return stock.current || 0;
    return 0;
  };

  const getMaxStock = () => {
    if (stock && typeof stock === 'object') return stock.maximum || 100;
    return 100;
  };

  const getAvgStock = () => {
    if (stock && typeof stock === 'object') return stock.average || 50;
    return 50;
  };

  const getMinStock = () => {
    if (stock && typeof stock === 'object') return stock.minimum || 5;
    return 5;
  };

  const getReservedStock = () => {
    if (stock && typeof stock === 'object') return stock.reservedStock || 0;
    return 0;
  };

  const getLastRestocked = () => {
    if (stock && typeof stock === 'object' && stock.lastRestocked) {
      return new Date(stock.lastRestocked).toLocaleDateString();
    }
    return 'N/A';
  };

  const currentStock = getCurrentStock();
  const maxStock = getMaxStock();
  const avgStock = getAvgStock();
  const minStock = getMinStock();
  const reservedStock = getReservedStock();
  const availableStock = currentStock - reservedStock;

  // Calculate stock percentage
  const stockPercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;

  // Determine stock status
  const getStockStatus = () => {
    if (currentStock === 0) return { status: 'out', color: 'red', icon: FaWarning };
    if (currentStock <= minStock) return { status: 'low', color: 'orange', icon: FaExclamationTriangle };
    if (currentStock >= avgStock) return { status: 'good', color: 'green', icon: FaCheckCircle };
    return { status: 'moderate', color: 'yellow', icon: FaInfoCircle };
  };

  const { status, color, icon: StatusIcon } = getStockStatus();

  // Stock status messages
  const getStatusMessage = () => {
    switch (status) {
      case 'out': return 'Out of Stock';
      case 'low': return 'Low Stock';
      case 'moderate': return 'Moderate Stock';
      case 'good': return 'In Stock';
      default: return 'Unknown';
    }
  };

  // Color classes for different states
  const colorClasses = {
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      progress: 'bg-red-500',
      badge: 'bg-red-100 text-red-800'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      progress: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-800'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      progress: 'bg-yellow-500',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      progress: 'bg-green-500',
      badge: 'bg-green-100 text-green-800'
    }
  };

  const classes = colorClasses[color];

  if (!showDetailedView) {
    // Simple badge view for product cards
    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes.badge}`}>
          <StatusIcon className="inline w-3 h-3 mr-1" />
          {currentStock > 0 ? `${currentStock} ${unit}` : 'Out of stock'}
        </span>
      </div>
    );
  }

  // Detailed view for product detail pages
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaChartBar className="mr-2 text-blue-600" />
          Stock Information
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${classes.badge}`}>
          <StatusIcon className="inline w-4 h-4 mr-1" />
          {getStatusMessage()}
        </span>
      </div>

      {/* Stock Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Current Stock Level</span>
          <span>{Math.round(stockPercentage)}% of capacity</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div 
            className={`h-full ${classes.progress} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
          ></div>
          {/* Average stock indicator */}
          <div 
            className="absolute top-0 h-full w-0.5 bg-gray-600"
            style={{ left: `${Math.min((avgStock / maxStock) * 100, 100)}%` }}
          ></div>
          {/* Minimum stock indicator */}
          <div 
            className="absolute top-0 h-full w-0.5 bg-red-400"
            style={{ left: `${Math.min((minStock / maxStock) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Min: {minStock}</span>
          <span>Avg: {avgStock}</span>
          <span>Max: {maxStock}</span>
        </div>
      </div>

      {/* Stock Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{currentStock}</div>
          <div className="text-xs text-gray-600">Current Stock</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{availableStock}</div>
          <div className="text-xs text-gray-600">Available</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{reservedStock}</div>
          <div className="text-xs text-gray-600">Reserved</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{maxStock}</div>
          <div className="text-xs text-gray-600">Capacity</div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-600">
          <FaTruck className="mr-2" />
          <span>Last Restocked: {getLastRestocked()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaClock className="mr-2" />
          <span>Unit: {unit}</span>
        </div>
      </div>

      {/* Stock Status Indicators Legend */}
      <div className="pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600 mb-2">Stock Level Indicators:</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
            <span>Minimum Threshold</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-600 rounded-full mr-1"></div>
            <span>Average Level</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>Current Stock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stock summary component for admin dashboards
export const StockSummary = ({ products = [] }) => {
  const getStockStatistics = () => {
    let totalProducts = products.length;
    let outOfStock = 0;
    let lowStock = 0;
    let goodStock = 0;
    let totalValue = 0;

    products.forEach(product => {
      const currentStock = typeof product.stock === 'number' 
        ? product.stock 
        : product.stock?.current || 0;
      const minStock = product.stock?.minimum || 5;
      
      if (currentStock === 0) outOfStock++;
      else if (currentStock <= minStock) lowStock++;
      else goodStock++;
      
      totalValue += currentStock * (product.price || 0);
    });

    return {
      totalProducts,
      outOfStock,
      lowStock,
      goodStock,
      totalValue
    };
  };

  const stats = getStockStatistics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <FaChartBar className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <FaWarning className="h-8 w-8 text-red-600" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Low Stock</p>
            <p className="text-3xl font-bold text-orange-600">{stats.lowStock}</p>
          </div>
          <FaExclamationTriangle className="h-8 w-8 text-orange-600" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Well Stocked</p>
            <p className="text-3xl font-bold text-green-600">{stats.goodStock}</p>
          </div>
          <FaCheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>
  );
};

export default StockDisplay;
