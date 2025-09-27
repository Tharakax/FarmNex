import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  BarChart3,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Eye,
  EyeOff,
  Download,
  Settings,
  ChevronDown,
  Grid3X3,
  List,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

// Import existing components
import { productAPI } from '../../services/productAPI';
import AddProductForm from './AddProductForm';
import ProductList from './ProductList';
import ProductStats from './ProductStats';

const EnhancedProductManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showStats, setShowStats] = useState(true);
  const [showReports, setShowReports] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Mock data for demonstration
  const mockProducts = [
    {
      _id: '1',
      name: 'Organic Tomatoes',
      description: 'Fresh organic cherry tomatoes grown locally',
      category: 'vegetables',
      price: { base: 4.99, sale: 3.99, bulk: 3.50 },
      stock: { current: 150, minimum: 20, maximum: 500 },
      status: 'active',
      image: '/images/tomatoes.jpg',
      tags: ['organic', 'local', 'fresh'],
      createdAt: new Date('2024-01-15'),
      sales: { total: 245, thisMonth: 67, growth: 12.5 }
    },
    {
      _id: '2',
      name: 'Fresh Carrots',
      description: 'Crisp orange carrots perfect for cooking',
      category: 'root-vegetables',
      price: { base: 2.99, sale: null, bulk: 2.50 },
      stock: { current: 8, minimum: 25, maximum: 200 },
      status: 'active',
      image: '/images/carrots.jpg',
      tags: ['fresh', 'local'],
      createdAt: new Date('2024-01-10'),
      sales: { total: 189, thisMonth: 43, growth: 8.3 }
    },
    {
      _id: '3',
      name: 'Bell Peppers',
      description: 'Colorful bell peppers - red, yellow, green',
      category: 'vegetables',
      price: { base: 3.49, sale: 2.99, bulk: 2.75 },
      stock: { current: 0, minimum: 15, maximum: 300 },
      status: 'inactive',
      image: '/images/peppers.jpg',
      tags: ['colorful', 'versatile'],
      createdAt: new Date('2024-01-05'),
      sales: { total: 134, thisMonth: 12, growth: -5.2 }
    },
    {
      _id: '4',
      name: 'Organic Spinach',
      description: 'Baby spinach leaves, pesticide-free',
      category: 'leafy-greens',
      price: { base: 3.99, sale: null, bulk: 3.25 },
      stock: { current: 45, minimum: 20, maximum: 150 },
      status: 'active',
      image: '/images/spinach.jpg',
      tags: ['organic', 'baby', 'pesticide-free'],
      createdAt: new Date('2024-01-20'),
      sales: { total: 98, thisMonth: 34, growth: 18.7 }
    }
  ];

  // Categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'root-vegetables', label: 'Root Vegetables' },
    { value: 'berries', label: 'Berries' },
    { value: 'animal-products', label: 'Animal Products' },
    { value: 'dairy-products', label: 'Dairy Products' },
    { value: 'meats', label: 'Meats' }
  ];

  const stockFilters = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters when products or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, sortOrder]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, use mock data
      // Replace with: const result = await productAPI.getAllProducts();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setProducts(mockProducts);
      toast.success('Products loaded successfully');
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProducts();
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        const current = product.stock?.current || 0;
        const minimum = product.stock?.minimum || 5;

        switch (stockFilter) {
          case 'in-stock':
            return current > minimum;
          case 'low-stock':
            return current > 0 && current <= minimum;
          case 'out-of-stock':
            return current === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price.base;
          bValue = b.price.base;
          break;
        case 'stock':
          aValue = a.stock.current;
          bValue = b.stock.current;
          break;
        case 'sales':
          aValue = a.sales?.total || 0;
          bValue = b.sales?.total || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredProducts(filtered);
  };

  // Export handlers
  const handleExportPDF = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('Exporting to PDF...');
          resolve();
        }, 2000);
      }),
      {
        loading: 'Generating PDF report...',
        success: 'PDF report downloaded successfully!',
        error: 'Failed to generate PDF'
      }
    );
  };

  const handleExportExcel = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('Exporting to Excel...');
          resolve();
        }, 1500);
      }),
      {
        loading: 'Generating Excel report...',
        success: 'Excel report downloaded successfully!',
        error: 'Failed to generate Excel'
      }
    );
  };

  // Calculate stats
  const stats = {
    total: filteredProducts.length,
    active: filteredProducts.filter(p => p.status === 'active').length,
    lowStock: filteredProducts.filter(p => p.stock.current <= p.stock.minimum).length,
    outOfStock: filteredProducts.filter(p => p.stock.current === 0).length,
    totalValue: filteredProducts.reduce((sum, p) => sum + (p.price.base * p.stock.current), 0),
    totalSales: filteredProducts.reduce((sum, p) => sum + (p.sales?.total || 0), 0)
  };

  const getStockStatus = (product) => {
    const current = product.stock.current;
    const minimum = product.stock.minimum;
    
    if (current === 0) return { status: 'out', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
    if (current <= minimum) return { status: 'low', color: 'text-amber-600 bg-amber-100', icon: Clock };
    return { status: 'good', color: 'text-green-600 bg-green-100', icon: CheckCircle };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section with Professional Styling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Title Section */}
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FontAwesomeIcon icon={faLeaf} className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-600 mt-1">Manage your farm products, inventory, and pricing</p>
              </div>
            </div>

            {/* Action Buttons - Matching Your Design */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Hide/Show Stats Button */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  showStats 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>

              {/* View Reports Button */}
              <button
                onClick={() => setShowReports(!showReports)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* PDF Export Button */}
              <button
                onClick={handleExportPDF}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </button>

              {/* Excel Export Button */}
              <button
                onClick={handleExportExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </button>

              {/* Add Product Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Show/Hide based on state */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalSales}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {stockFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
              <option value="sales-desc">Sales (High to Low)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
              : "divide-y divide-gray-200"
            }>
              {filteredProducts.map((product) => {
                const stockInfo = getStockStatus(product);
                const StockIcon = stockInfo.icon;
                
                return viewMode === 'grid' ? (
                  // Grid View Card
                  <div key={product._id} className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <FontAwesomeIcon icon={faLeaf} className="h-12 w-12 text-green-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                          <StockIcon className="h-3 w-3 mr-1" />
                          {product.stock.current}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">${product.price.base}</span>
                          {product.price.sale && (
                            <span className="text-sm text-green-600 ml-2">Sale: ${product.price.sale}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          Sales: {product.sales?.total || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                        
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 transition-colors">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View Row
                  <div key={product._id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faLeaf} className="h-6 w-6 text-green-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{product.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-lg font-bold text-gray-900">${product.price.base}</span>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                            <StockIcon className="h-3 w-3 mr-1" />
                            Stock: {product.stock.current}
                          </div>
                          <span className="text-sm text-gray-500">Sales: {product.sales?.total || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 transition-colors p-1">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 transition-colors p-1">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Product Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Add Product Form would go here */}
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FontAwesomeIcon icon={faLeaf} className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Form</h3>
                  <p className="text-gray-600 mb-6">Product form component would be integrated here</p>
                  <button
                    onClick={() => {
                      toast.success('Product would be saved here');
                      setShowAddForm(false);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProductManagement;