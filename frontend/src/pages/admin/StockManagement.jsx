import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaPlus, 
  FaDownload, 
  FaSort,
  FaSortUp,
  FaSortDown,
  FaWarning,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
<<<<<<< HEAD
import { FileText, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StockDisplay, { StockSummary } from '../../components/StockDisplay.jsx';
import { 
  exportToPDF, 
  exportToExcel, 
  getInventoryColumns,
  processDataForExport 
} from '../../utils/exportUtils';
=======
import axios from 'axios';
import StockDisplay, { StockSummary } from '../../components/StockDisplay.jsx';
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, in-stock, low-stock, out-of-stock
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    productId: '',
    current: '',
    maximum: '',
    minimum: '',
    average: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, stockFilter, sortConfig]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/product/");
      if (response.status === 200) {
        setProducts(response.data);
        console.log('Products fetched successfully:', response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stock status
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        const currentStock = typeof product.stock === 'number' 
          ? product.stock 
          : product.stock?.current || 0;
        const minStock = product.stock?.minimum || 5;

        switch (stockFilter) {
          case 'in-stock':
            return currentStock > minStock;
          case 'low-stock':
            return currentStock > 0 && currentStock <= minStock;
          case 'out-of-stock':
            return currentStock === 0;
          default:
            return true;
        }
      });
    }

    // Sort products
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'stock':
            aValue = typeof a.stock === 'number' ? a.stock : a.stock?.current || 0;
            bValue = typeof b.stock === 'number' ? b.stock : b.stock?.current || 0;
            break;
          case 'price':
            aValue = a.price || 0;
            bValue = b.price || 0;
            break;
          case 'category':
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          default:
            aValue = 0;
            bValue = 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  const getStockStatus = (product) => {
    const currentStock = typeof product.stock === 'number' 
      ? product.stock 
      : product.stock?.current || 0;
    const minStock = product.stock?.minimum || 5;

    if (currentStock === 0) return { status: 'out', color: 'text-red-600', icon: FaWarning };
    if (currentStock <= minStock) return { status: 'low', color: 'text-orange-600', icon: FaExclamationTriangle };
    return { status: 'good', color: 'text-green-600', icon: FaCheckCircle };
  };

  const handleUpdateStock = (product) => {
    const currentStock = typeof product.stock === 'number' ? product.stock : product.stock?.current || 0;
    const maxStock = product.stock?.maximum || 100;
    const minStock = product.stock?.minimum || 5;
    const avgStock = product.stock?.average || 50;

    setUpdateData({
      productId: product._id,
      current: currentStock.toString(),
      maximum: maxStock.toString(),
      minimum: minStock.toString(),
      average: avgStock.toString()
    });
    setShowUpdateModal(true);
  };

  const submitStockUpdate = async () => {
    try {
      const stockData = {
        stock: {
          current: parseInt(updateData.current),
          maximum: parseInt(updateData.maximum),
          minimum: parseInt(updateData.minimum),
          average: parseInt(updateData.average),
          lastRestocked: new Date(),
          reservedStock: 0
        }
      };

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/${updateData.productId}`,
        stockData
      );

      // Refresh products
      fetchProducts();
      setShowUpdateModal(false);
      setUpdateData({ productId: '', current: '', maximum: '', minimum: '', average: '' });
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const exportStockReport = () => {
    const csvContent = [
      ['Product Name', 'Category', 'Current Stock', 'Max Stock', 'Min Stock', 'Status', 'Price', 'Unit'].join(','),
      ...filteredProducts.map(product => {
        const currentStock = typeof product.stock === 'number' ? product.stock : product.stock?.current || 0;
        const maxStock = product.stock?.maximum || 100;
        const minStock = product.stock?.minimum || 5;
        const { status } = getStockStatus(product);

        return [
          `"${product.name}"`,
          `"${product.category}"`,
          currentStock,
          maxStock,
          minStock,
          status,
          product.price || 0,
          product.unit || 'unit'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

<<<<<<< HEAD
  // Enhanced export handlers
  const handleExportToPDF = () => {
    try {
      // Prepare data for export
      const exportData = filteredProducts.map(product => {
        const currentStock = typeof product.stock === 'number' ? product.stock : product.stock?.current || 0;
        const minStock = product.stock?.minimum || 5;
        const maxStock = product.stock?.maximum || 100;
        const { status } = getStockStatus(product);
        
        return {
          id: product._id || product.id,
          productName: product.name,
          category: product.category,
          quantity: currentStock,
          unit: product.unit || 'units',
          pricePerUnit: product.price || 0,
          totalValue: currentStock * (product.price || 0),
          location: 'Stock Management',
          status: status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock',
          lastUpdated: product.updatedAt || product.createdAt || new Date().toISOString().split('T')[0]
        };
      });

      // Process data with formatting
      const processedData = processDataForExport(
        exportData, 
        ['pricePerUnit', 'totalValue'], 
        ['lastUpdated']
      );

      // Generate filename with current filters
      const filterSuffix = stockFilter !== 'all' ? `_${stockFilter}` : '';
      const filename = `stock_management_report${filterSuffix}_${new Date().toISOString().split('T')[0]}`;

      exportToPDF(
        processedData,
        'Stock Management Report',
        getInventoryColumns(),
        filename
      );
      
      toast.success('Stock report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting stock report to PDF:', error);
      toast.error('Failed to export stock report to PDF');
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredProducts.map(product => {
        const currentStock = typeof product.stock === 'number' ? product.stock : product.stock?.current || 0;
        const minStock = product.stock?.minimum || 5;
        const maxStock = product.stock?.maximum || 100;
        const { status } = getStockStatus(product);
        
        return {
          id: product._id || product.id,
          productName: product.name,
          category: product.category,
          quantity: currentStock,
          unit: product.unit || 'units',
          pricePerUnit: product.price || 0,
          totalValue: currentStock * (product.price || 0),
          location: 'Stock Management',
          status: status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock',
          lastUpdated: product.updatedAt || product.createdAt || new Date().toISOString().split('T')[0]
        };
      });

      // Generate filename with current filters
      const filterSuffix = stockFilter !== 'all' ? `_${stockFilter}` : '';
      const filename = `stock_management_report${filterSuffix}_${new Date().toISOString().split('T')[0]}`;

      exportToExcel(
        exportData,
        'Stock Management Report',
        getInventoryColumns(),
        filename
      );
      
      toast.success('Stock report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting stock report to Excel:', error);
      toast.error('Failed to export stock report to Excel');
    }
  };

=======
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Management</h1>
        <p className="text-gray-600">Monitor and manage inventory levels across all products</p>
      </div>

      {/* Stock Summary */}
      <StockSummary products={filteredProducts} />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-400" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

<<<<<<< HEAD
            <div className="flex gap-2">
              <button
                onClick={() => handleExportToPDF()}
                disabled={loading || filteredProducts.length === 0}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExportToExcel()}
                disabled={loading || filteredProducts.length === 0}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={exportStockReport}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaDownload />
                <span>CSV</span>
              </button>
            </div>
=======
            <button
              onClick={exportStockReport}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload />
              <span>Export Report</span>
            </button>
>>>>>>> 9d4ce885325407505be00e0308db71a082e385c5
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Product</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    {getSortIcon('category')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Current Stock</span>
                    {getSortIcon('stock')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Price</span>
                    {getSortIcon('price')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const currentStock = typeof product.stock === 'number' ? product.stock : product.stock?.current || 0;
                const maxStock = product.stock?.maximum || 100;
                const { status, color, icon: StatusIcon } = getStockStatus(product);

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images && product.images[0] ? (
                          <img 
                            className="h-10 w-10 rounded-lg object-cover mr-3" 
                            src={product.images[0]} 
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {product.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className={`mr-2 ${color}`} />
                        <span className={`text-sm font-medium ${color} capitalize`}>
                          {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{currentStock} / {maxStock}</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-full rounded-full ${
                              status === 'out' ? 'bg-red-500' : 
                              status === 'low' ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((currentStock / maxStock) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs. {product.price ? product.price.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUpdateStock(product)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <FaEdit />
                        <span>Update Stock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No products found</div>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Stock Levels</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input
                  type="number"
                  value={updateData.current}
                  onChange={(e) => setUpdateData({...updateData, current: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Capacity</label>
                <input
                  type="number"
                  value={updateData.maximum}
                  onChange={(e) => setUpdateData({...updateData, maximum: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Threshold</label>
                <input
                  type="number"
                  value={updateData.minimum}
                  onChange={(e) => setUpdateData({...updateData, minimum: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Stock Level</label>
                <input
                  type="number"
                  value={updateData.average}
                  onChange={(e) => setUpdateData({...updateData, average: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={submitStockUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
