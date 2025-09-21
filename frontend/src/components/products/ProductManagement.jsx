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
  Eye 
} from 'lucide-react';
import toast from 'react-hot-toast';

import { productAPI } from '../../services/productAPI';
import AddProductForm from './AddProductForm';
import ProductList from './ProductList';
import ProductStats from './ProductStats';
import ProductManagementReport from '../reports/ProductManagementReport';
import { 
  exportToPDF, 
  exportToExcel, 
  getProductsColumns,
  processDataForExport 
} from '../../utils/exportUtils';

const ProductManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form and UI state
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

  // Categories from the product model
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'root-vegetables', label: 'Root Vegetables' },
    { value: 'berries', label: 'Berries' },
    { value: 'animal-products', label: 'Animal Products' },
    { value: 'dairy-products', label: 'Dairy Products' },
    { value: 'meats', label: 'Meats' },
  ];

  const stockFilters = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
  ];

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters when products or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await productAPI.getAllProducts();
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.error);
        toast.error(result.error || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
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

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p._id !== productId));
    toast.success('Product removed from list');
  };

  const handleViewProduct = (product) => {
    // For now, just show product details in a toast
    // In a real app, you might navigate to a detailed view
    toast.success(`Viewing ${product.name}`);
  };

  const handleProductSaved = (savedProduct) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => p._id === savedProduct._id ? savedProduct : p));
      toast.success('Product updated successfully');
    } else {
      // Add new product
      setProducts(prev => [...prev, savedProduct]);
      toast.success('Product added successfully');
    }
    
    // Refresh products to ensure we have the latest data
    setTimeout(() => {
      loadProducts();
    }, 1000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStockFilter('all');
  };

  // Export handlers
  const handleExportToPDF = async () => {
    console.log('🔥 PDF Export started...');
    const loadingToast = toast.loading('Generating PDF report...');
    
    try {
      // Debug data
      console.log('Data check:', {
        filteredProducts: filteredProducts?.length || 0,
        sampleData: filteredProducts?.[0]
      });
      
      // Validate data
      if (!filteredProducts || filteredProducts.length === 0) {
        toast.dismiss(loadingToast);
        toast.error('No products available to export');
        return;
      }

      // Import export function dynamically to test
      const { exportToPDF, getProductsColumns } = await import('../../utils/exportUtils');
      
      // Prepare data for export with better error handling
      const exportData = filteredProducts.map((product, index) => {
        try {
          return {
            id: product._id || product.id || `P${index + 1}`,
            name: product.name || 'Unknown Product',
            category: product.category || 'Uncategorized',
            description: (product.description || 'No description available').substring(0, 80),
            price: product.price || 0,
            stockQuantity: product.stock?.current ?? product.stockQuantity ?? 0,
            unit: product.unit || 'units',
            status: (() => {
              const current = product.stock?.current ?? product.stockQuantity ?? 0;
              const minimum = product.stock?.minimum || 5;
              if (current === 0) return 'Out of Stock';
              if (current <= minimum) return 'Low Stock';
              return 'In Stock';
            })(),
            createdDate: product.createdAt || product.createdDate || new Date().toISOString().split('T')[0]
          };
        } catch (productError) {
          console.warn('Error processing product:', product, productError);
          return {
            id: `P${index + 1}`,
            name: 'Error loading product',
            category: 'Unknown',
            description: 'Data unavailable',
            price: 0,
            stockQuantity: 0,
            unit: 'units',
            status: 'Unknown',
            createdDate: new Date().toISOString().split('T')[0]
          };
        }
      });

      // Process data with formatting (skip this if causing issues)
      let processedData;
      try {
        processedData = processDataForExport(
          exportData, 
          ['price'], 
          ['createdDate']
        );
      } catch (processError) {
        console.warn('Error in processDataForExport, using raw data:', processError);
        processedData = exportData;
      }

      const categoryFilter = selectedCategory !== 'all' ? `_${selectedCategory}` : '';
      const stockFilterText = stockFilter !== 'all' ? `_${stockFilter}` : '';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `products_report${categoryFilter}${stockFilterText}_${timestamp}`;

      await new Promise(resolve => setTimeout(resolve, 500));

      
      const success = await exportToPDF(
        processedData,
        'Products Management Report',
        getProductsColumns(),
        filename,
        'products'
      );
      
      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success(`PDF report exported successfully! (${exportData.length} products)`);
      } else {
        toast.error('Failed to export PDF report');
      }
      
    } catch (error) {
      console.error('Error exporting products to PDF:', error);
      toast.dismiss(loadingToast);
      

      let errorMessage = 'Export failed: ';
      if (error.message?.includes('autoTable')) {
        errorMessage += 'PDF library not loaded properly. Please refresh the page.';
      } else if (error.message?.includes('data')) {
        errorMessage += 'Invalid product data detected.';
      } else if (error.message?.includes('download')) {
        errorMessage += 'Download blocked. Please allow downloads in your browser.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleExportToExcel = async () => {
    console.log('📊 Excel Export started...');
    const loadingToast = toast.loading('Generating Excel report...');
    
    try {
      // Debug data
      console.log('Data check:', {
        filteredProducts: filteredProducts?.length || 0,
        sampleData: filteredProducts?.[0]
      });
      
      if (!filteredProducts || filteredProducts.length === 0) {
        toast.dismiss(loadingToast);
        toast.error('No products available to export');
        return;
      }

      // Import export function dynamically
      const { exportToExcel, getProductsColumns } = await import('../../utils/exportUtils');
      
      const exportData = filteredProducts.map((product, index) => ({
        id: product._id || product.id || `P${index + 1}`,
        name: product.name || 'Unknown Product',
        category: product.category || 'Uncategorized',
        description: product.description || 'No description',
        price: product.price || 0,
        stockQuantity: product.stock?.current || 0,
        unit: product.unit || 'units',
        status: (() => {
          const current = product.stock?.current || 0;
          const minimum = product.stock?.minimum || 5;
          if (current === 0) return 'Out of Stock';
          if (current <= minimum) return 'Low Stock';
          return 'In Stock';
        })(),
        createdDate: product.createdAt 
          ? new Date(product.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      }));

      console.log('📋 Export data prepared:', exportData.length, 'items');

      const categoryFilter = selectedCategory !== 'all' ? `_${selectedCategory}` : '';
      const stockFilterText = stockFilter !== 'all' ? `_${stockFilter}` : '';
      const filename = `products_report${categoryFilter}${stockFilterText}_${new Date().toISOString().split('T')[0]}`;

      await exportToExcel(
        exportData,
        'Products Report',
        getProductsColumns(),
        filename
      );
      
      toast.dismiss(loadingToast);
      toast.success('Excel file exported successfully! Check your downloads folder.');
      
      console.log('✅ Excel Export completed successfully');
      
    } catch (error) {
      console.error('❌ Excel Export error:', error);
      toast.dismiss(loadingToast);
      
      let errorMessage = 'Failed to export to Excel. ';
      
      if (error.message?.includes('No data')) {
        errorMessage += 'No data available to export.';
      } else if (error.message?.includes('blocked')) {
        errorMessage += 'Download blocked. Please allow downloads in your browser.';
      } else if (error.message?.includes('Excel')) {
        errorMessage += 'Excel generation failed. Try again or check console for details.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      toast.error(errorMessage);
      
      // Show detailed error for debugging
      console.error('Detailed error info:', {
        message: error.message,
        stack: error.stack,
        dataLength: filteredProducts?.length,
        hasExportUtils: typeof exportToExcel
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your farm products, inventory, and pricing
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showStats 
                ? 'bg-green-100 text-green-700 border-green-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          
          <button
            onClick={() => setShowReports(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4 mr-2 inline" />
            View Reports
          </button>
          
          <button
            onClick={loadProducts}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleExportToPDF()}
              disabled={loading || filteredProducts.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleExportToExcel()}
              disabled={loading || filteredProducts.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
          
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Product
          </button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <ProductStats products={products} />
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {stockFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2 inline" />
            Clear Filters
          </button>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          {(searchQuery || selectedCategory !== 'all' || stockFilter !== 'all') && (
            <span>
              Filters active: {[
                searchQuery && 'search',
                selectedCategory !== 'all' && 'category',
                stockFilter !== 'all' && 'stock'
              ].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadProducts}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Product List */}
      <ProductList
        products={filteredProducts}
        loading={loading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onView={handleViewProduct}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Add/Edit Product Form Modal */}
      <AddProductForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onProductSaved={handleProductSaved}
      />
      
      {/* Product Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Management Reports</h2>
                <p className="text-sm text-gray-600 mt-1">Comprehensive analytics and insights for your products</p>
              </div>
              <button
                onClick={() => setShowReports(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <ProductManagementReport />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
