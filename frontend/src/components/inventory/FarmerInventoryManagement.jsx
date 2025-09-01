import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  Upload,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Box,
  Truck,
  Wrench,
  Leaf,
  Droplets,
  Bug,
  Fuel,
  HardHat,
  Package2,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/productAPI';
import { inventoryAPI } from '../../services/inventoryAPI';
import { farmSuppliesAPI } from '../../services/api.js';
import { 
  exportToPDF, 
  exportToExcel, 
  getInventoryColumns,
  processDataForExport 
} from '../../utils/exportUtils';

const FarmerInventoryManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [allInventoryItems, setAllInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [itemTypeFilter, setItemTypeFilter] = useState('all'); // New filter for products vs supplies
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  // Combined categories for products and supplies
  const categories = [
    { value: 'all', label: 'All Categories' },
    // Product categories
    { value: 'vegetables', label: 'Vegetables', type: 'product' },
    { value: 'fruits', label: 'Fruits', type: 'product' },
    { value: 'leafy-greens', label: 'Leafy Greens', type: 'product' },
    { value: 'root-vegetables', label: 'Root Vegetables', type: 'product' },
    { value: 'berries', label: 'Berries', type: 'product' },
    { value: 'animal-products', label: 'Animal Products', type: 'product' },
    { value: 'dairy-products', label: 'Dairy Products', type: 'product' },
    { value: 'meats', label: 'Meats', type: 'product' },
    // Supply categories
    { value: 'tools', label: 'Tools & Equipment', type: 'supply' },
    { value: 'seeds', label: 'Seeds & Plants', type: 'supply' },
    { value: 'fertilizers', label: 'Fertilizers', type: 'supply' },
    { value: 'pesticides', label: 'Pesticides & Chemicals', type: 'supply' },
    { value: 'irrigation', label: 'Irrigation Supplies', type: 'supply' },
    { value: 'fuel', label: 'Fuel & Energy', type: 'supply' },
    { value: 'safety', label: 'Safety Equipment', type: 'supply' },
    { value: 'packaging', label: 'Packaging Materials', type: 'supply' },
    { value: 'feed', label: 'Animal Feed', type: 'supply' },
  ];

  const stockFilters = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'overstocked', label: 'Overstocked' },
    { value: 'maintenance', label: 'Maintenance Required' },
    { value: 'expired', label: 'Expired' },
  ];

  const itemTypeFilters = [
    { value: 'all', label: 'All Items' },
    { value: 'products', label: 'Products Only' },
    { value: 'supplies', label: 'Supplies Only' },
  ];

  // Network connectivity test
  const testNetworkConnectivity = async () => {
    console.log('🌐 Testing network connectivity...');
    
    try {
      // Test basic connectivity
      console.log('🔍 Testing basic API connectivity...');
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🌐 Health check response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        console.log('✅ Basic connectivity test passed');
      } else {
        console.warn('⚠️ Health check failed but server responded');
      }
      
    } catch (networkError) {
      console.error('❌ Network connectivity test failed:', networkError);
      console.error('❌ Network error details:', {
        message: networkError.message,
        type: networkError.name,
        stack: networkError.stack
      });
      
      // Test if it's a CORS issue
      if (networkError.message.includes('CORS') || networkError.message.includes('Cross-Origin')) {
        console.error('🚫 CORS Issue Detected!');
        toast.error('CORS issue detected. Check backend CORS configuration.');
      } else if (networkError.message.includes('Failed to fetch')) {
        console.error('🚫 Network or Connection Issue!');
        toast.error('Cannot connect to backend. Check if server is running.');
      }
    }
  };

  // Load all inventory items (products + supplies)
  useEffect(() => {
    // Test network connectivity first, then load inventory
    testNetworkConnectivity().finally(() => {
      loadInventory();
    });
  }, []);

  // Auto-refresh inventory data periodically to sync with backend changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing inventory data...');
      loadInventory();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading inventory...');
      console.log('🌐 Environment check:');
      console.log('  - API Base URL:', import.meta.env.VITE_BACKEND_URL);
      console.log('  - API Base URL (fallback):', 'http://localhost:3000');
      console.log('  - Current location:', window.location.href);
      
      // Initialize variables
      let productsWithType = [];
      
      // Load products with enhanced debugging
      console.log('📦 Attempting to load products...');
      const productsResult = await productAPI.getAllProducts();
      console.log('📦 Products API result:', productsResult);
      
      if (productsResult.success) {
        console.log('✅ Products loaded successfully:', productsResult.data);
        productsWithType = productsResult.data.map(product => ({
          ...product,
          type: 'product',
          quantity: product.stock?.current || 0,
          minQuantity: product.stock?.minimum || 5,
          maxQuantity: product.stock?.maximum || 100,
          unit: product.unit || 'units',
          unitPrice: product.price || 0
        }));
        console.log('🔄 Processed products:', productsWithType.length, 'items');
        console.log('📋 First product sample:', productsWithType[0]);
        setProducts(productsWithType);
      } else {
        console.error('❌ Products API failed:', productsResult);
        console.error('❌ Error details:', {
          error: productsResult.error,
          fullResult: productsResult
        });
        toast.error(`Failed to load products: ${productsResult.error}`);
        // Set empty array if products fail to load
        setProducts([]);
      }

      // Load supplies from backend API
      console.log('📦 Loading supplies from backend API...');
      let suppliesWithType = [];
      try {
        const suppliesResponse = await farmSuppliesAPI.getAllSupplies();
        console.log('📦 Farm supplies API result:', suppliesResponse);
        
        // Handle the response structure from backend
        const suppliesData = suppliesResponse.data || suppliesResponse;
        if (Array.isArray(suppliesData)) {
          suppliesWithType = suppliesData.map(supply => ({
            ...supply,
            type: 'supply',
            unitPrice: supply.price || 0,
            // Map backend fields to frontend expected fields if needed
            supplier: supply.supplier?.name || supply.supplier || 'Unknown Supplier',
            purchaseDate: supply.lastRestocked || supply.createdAt || new Date().toISOString().split('T')[0],
            lastUsed: supply.lastRestocked || supply.updatedAt || supply.createdAt || new Date().toISOString().split('T')[0]
          }));
          console.log('✅ Loaded supplies from API:', suppliesWithType.length, 'items');
          console.log('📋 First supply sample:', suppliesWithType[0]);
          setSupplies(suppliesWithType);
        } else {
          console.warn('⚠️ Unexpected supplies API response format:', suppliesResponse);
          setSupplies([]);
        }
      } catch (suppliesError) {
        console.error('❌ Error loading supplies from API:', suppliesError);
        toast.error('Failed to load farm supplies from database');
        // Fallback to localStorage if API fails
        const savedSupplies = localStorage.getItem('farmSupplies');
        if (savedSupplies) {
          try {
            const parsedSupplies = JSON.parse(savedSupplies);
            suppliesWithType = parsedSupplies.map(supply => ({
              ...supply,
              type: 'supply',
              unitPrice: supply.price || 0
            }));
            console.log('✅ Loaded supplies from localStorage fallback:', suppliesWithType.length, 'items');
            setSupplies(suppliesWithType);
          } catch (parseError) {
            console.error('❌ Error parsing supplies from localStorage:', parseError);
            setSupplies([]);
          }
        } else {
          setSupplies([]);
        }
      }

      // Combine all items
      const allItems = [...productsWithType, ...suppliesWithType];
      console.log('🔄 Combined inventory items:', {
        products: productsWithType.length,
        supplies: suppliesWithType.length,
        total: allItems.length
      });
      console.log('📋 Sample combined items:', allItems.slice(0, 2));
      setAllInventoryItems(allItems);
      
      toast.success(`Inventory loaded: ${allItems.length} items (${productsWithType.length} products, ${suppliesWithType.length} supplies)`);
      
    } catch (error) {
      console.error('❌ Error loading inventory:', error);
      console.error('❌ Error stack:', error.stack);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to load inventory: ${errorMessage}`);
      
      // Set empty states on error
      setProducts([]);
      setSupplies([]);
      setAllInventoryItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort all inventory items (products + supplies)
  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = [...allInventoryItems];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        (item.tags?.some(tag => tag.toLowerCase().includes(query))) ||
        (item.supplier && item.supplier.toLowerCase().includes(query))
      );
    }

    // Apply item type filter (products vs supplies)
    if (itemTypeFilter !== 'all') {
      if (itemTypeFilter === 'products') {
        filtered = filtered.filter(item => item.type === 'product');
      } else if (itemTypeFilter === 'supplies') {
        filtered = filtered.filter(item => item.type === 'supply');
      }
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(item => {
        const current = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
        const minimum = item.type === 'product' ? (item.stock?.minimum || 5) : (item.minQuantity || 5);
        const maximum = item.type === 'product' ? (item.stock?.maximum || 100) : (item.maxQuantity || 100);
        const isExpired = item.type === 'supply' && item.expiryDate && new Date(item.expiryDate) < new Date();
        const needsMaintenance = item.type === 'supply' && item.status === 'maintenance';

        switch (stockFilter) {
          case 'in-stock':
            return current > minimum && !isExpired && !needsMaintenance;
          case 'low-stock':
            return current > 0 && current <= minimum && !isExpired && !needsMaintenance;
          case 'out-of-stock':
            return current === 0;
          case 'overstocked':
            return current > maximum;
          case 'maintenance':
            return needsMaintenance;
          case 'expired':
            return isExpired;
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
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'price':
          aValue = a.type === 'product' ? (a.price || 0) : (a.price || 0);
          bValue = b.type === 'product' ? (b.price || 0) : (b.price || 0);
          break;
        case 'stock':
          aValue = a.type === 'product' ? (a.stock?.current || 0) : (a.quantity || 0);
          bValue = b.type === 'product' ? (b.stock?.current || 0) : (b.quantity || 0);
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'lastUpdated':
          aValue = new Date(a.updatedAt || a.createdAt || a.lastUsed || a.purchaseDate || 0);
          bValue = new Date(b.updatedAt || b.createdAt || b.lastUsed || b.purchaseDate || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allInventoryItems, searchQuery, selectedCategory, stockFilter, itemTypeFilter, sortBy, sortOrder]);

  // Calculate unified inventory statistics
  const inventoryStats = React.useMemo(() => {
    const totalItems = allInventoryItems.length;
    const totalProducts = products.length;
    const totalSupplies = supplies.length;
    
    // Calculate total value across both products and supplies
    const totalValue = allInventoryItems.reduce((sum, item) => {
      const quantity = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
      const price = item.type === 'product' ? (item.price || 0) : (item.price || 0);
      return sum + (quantity * price);
    }, 0);
    
    // Low stock items
    const lowStockItems = allInventoryItems.filter(item => {
      const current = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
      const minimum = item.type === 'product' ? (item.stock?.minimum || 5) : (item.minQuantity || 5);
      return current > 0 && current <= minimum;
    }).length;
    
    // Out of stock items
    const outOfStockItems = allInventoryItems.filter(item => {
      const current = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
      return current === 0;
    }).length;
    
    // Overstocked items
    const overstockedItems = allInventoryItems.filter(item => {
      const current = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
      const maximum = item.type === 'product' ? (item.stock?.maximum || 100) : (item.maxQuantity || 100);
      return current > maximum;
    }).length;
    
    // Maintenance items (supplies only)
    const maintenanceItems = supplies.filter(supply => supply.status === 'maintenance').length;
    
    // Expired items (supplies only)
    const expiredItems = supplies.filter(supply => 
      supply.expiryDate && new Date(supply.expiryDate) < new Date()
    ).length;
    
    // Total units
    const totalUnits = allInventoryItems.reduce((sum, item) => {
      const quantity = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
      return sum + quantity;
    }, 0);

    return {
      totalItems,
      totalProducts,
      totalSupplies,
      totalValue,
      lowStockItems,
      outOfStockItems,
      overstockedItems,
      maintenanceItems,
      expiredItems,
      totalUnits,
      inStockItems: totalItems - outOfStockItems
    };
  }, [allInventoryItems, products, supplies]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      const isSelected = prev.includes(productId);
      if (isSelected) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredAndSortedItems.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredAndSortedItems.map(p => p._id));
    }
  };

  const getStockStatus = (product) => {
    const current = product.stock?.current || 0;
    const minimum = product.stock?.minimum || 5;
    const maximum = product.stock?.maximum || 100;

    if (current === 0) return { status: 'out-of-stock', color: 'red', label: 'Out of Stock' };
    if (current <= minimum) return { status: 'low-stock', color: 'orange', label: 'Low Stock' };
    if (current > maximum) return { status: 'overstocked', color: 'purple', label: 'Overstocked' };
    return { status: 'in-stock', color: 'green', label: 'In Stock' };
  };

  // Export handlers
  const handleExportToPDF = () => {
    try {
      // Prepare data for export
      const exportData = filteredAndSortedItems.map(item => ({
        id: item._id || item.id,
        productName: item.name,
        category: item.category,
        quantity: item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0),
        unit: item.unit || 'units',
        pricePerUnit: item.price || 0,
        totalValue: (item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0)) * (item.price || 0),
        location: item.location || item.supplier || 'N/A',
        status: item.type === 'product' ? 
          getStockStatus(item).label : 
          (item.status === 'maintenance' ? 'Maintenance Required' : 
           item.expiryDate && new Date(item.expiryDate) < new Date() ? 'Expired' : 'Active'),
        lastUpdated: item.updatedAt || item.createdAt || item.lastUsed || item.purchaseDate || new Date().toISOString().split('T')[0]
      }));

      // Process data with formatting
      const processedData = processDataForExport(
        exportData, 
        ['pricePerUnit', 'totalValue'], 
        ['lastUpdated']
      );

      // Generate filename with current filters
      const filterSuffix = itemTypeFilter !== 'all' ? `_${itemTypeFilter}` : '';
      const categoryFilter = selectedCategory !== 'all' ? `_${selectedCategory}` : '';
      const filename = `inventory_report${filterSuffix}${categoryFilter}_${new Date().toISOString().split('T')[0]}`;

      exportToPDF(
        processedData,
        'Inventory Management Report',
        getInventoryColumns(),
        filename
      );
      
      toast.success('Inventory exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting inventory to PDF:', error);
      toast.error('Failed to export inventory to PDF');
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredAndSortedItems.map(item => ({
        id: item._id || item.id,
        productName: item.name,
        category: item.category,
        quantity: item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0),
        unit: item.unit || 'units',
        pricePerUnit: item.price || 0,
        totalValue: (item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0)) * (item.price || 0),
        location: item.location || item.supplier || 'N/A',
        status: item.type === 'product' ? 
          getStockStatus(item).label : 
          (item.status === 'maintenance' ? 'Maintenance Required' : 
           item.expiryDate && new Date(item.expiryDate) < new Date() ? 'Expired' : 'Active'),
        lastUpdated: item.updatedAt || item.createdAt || item.lastUsed || item.purchaseDate || new Date().toISOString().split('T')[0]
      }));

      // Generate filename with current filters
      const filterSuffix = itemTypeFilter !== 'all' ? `_${itemTypeFilter}` : '';
      const categoryFilter = selectedCategory !== 'all' ? `_${selectedCategory}` : '';
      const filename = `inventory_report${filterSuffix}${categoryFilter}_${new Date().toISOString().split('T')[0]}`;

      exportToExcel(
        exportData,
        'Inventory Report',
        getInventoryColumns(),
        filename
      );
      
      toast.success('Inventory exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting inventory to Excel:', error);
      toast.error('Failed to export inventory to Excel');
    }
  };

  // Inventory Overview Dashboard
  const InventoryOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{inventoryStats.totalProducts}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${inventoryStats.totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{inventoryStats.lowStockItems}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{inventoryStats.totalUnits}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Box className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{inventoryStats.inStockItems}</div>
            <div className="text-sm text-green-700">In Stock</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{inventoryStats.lowStockItems}</div>
            <div className="text-sm text-orange-700">Low Stock</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</div>
            <div className="text-sm text-red-700">Out of Stock</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{inventoryStats.overstockedItems}</div>
            <div className="text-sm text-purple-700">Overstocked</div>
          </div>
        </div>
      </div>

      {/* Recent Stock Changes */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Inventory Changes</h3>
        <div className="space-y-3">
          {products.slice(0, 5).map((product, index) => (
            <div key={product._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Package className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Current: {product.stock?.current || 0} {product.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStockStatus(product).color === 'green' ? 'bg-green-100 text-green-800' :
                  getStockStatus(product).color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  getStockStatus(product).color === 'red' ? 'bg-red-100 text-red-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {getStockStatus(product).label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Detailed Inventory Table View
  const DetailedInventoryView = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
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

            <select
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {itemTypeFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadInventory}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportToPDF()}
                disabled={loading || filteredAndSortedItems.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </button>
              <button
                onClick={() => handleExportToExcel()}
                disabled={loading || filteredAndSortedItems.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedItems.length} of {allInventoryItems.length} items
          </span>
          {selectedProducts.length > 0 && (
            <span className="text-green-600 font-medium">
              {selectedProducts.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center">
                    Current Stock
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Levels
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Unit Price
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedItems.map((item) => {
                // Handle both products and supplies consistently
                const currentStock = item.type === 'product' ? (item.stock?.current || 0) : (item.quantity || 0);
                const minStock = item.type === 'product' ? (item.stock?.minimum || 5) : (item.minQuantity || 5);
                const maxStock = item.type === 'product' ? (item.stock?.maximum || 100) : (item.maxQuantity || 100);
                const unitPrice = item.price || 0;
                const stockValue = currentStock * unitPrice;
                
                // Get status for both types
                let stockStatus;
                if (item.type === 'product') {
                  stockStatus = getStockStatus(item);
                } else {
                  // Supply status logic
                  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                  const needsMaintenance = item.status === 'maintenance';
                  
                  if (needsMaintenance) stockStatus = { status: 'maintenance', color: 'purple', label: 'Maintenance Required' };
                  else if (isExpired) stockStatus = { status: 'expired', color: 'red', label: 'Expired' };
                  else if (currentStock === 0) stockStatus = { status: 'out-of-stock', color: 'red', label: 'Out of Stock' };
                  else if (currentStock <= minStock) stockStatus = { status: 'low-stock', color: 'orange', label: 'Low Stock' };
                  else stockStatus = { status: 'in-stock', color: 'green', label: 'In Stock' };
                }
                
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(item._id)}
                        onChange={() => handleSelectProduct(item._id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {item.images && item.images.length > 0 && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={item.images[0]}
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.unit} • <span className="capitalize text-blue-600">{item.type}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {currentStock}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium">{minStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium">{maxStock}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stockStatus.color === 'green' ? 'bg-green-500' :
                              stockStatus.color === 'orange' ? 'bg-orange-500' :
                              stockStatus.color === 'red' ? 'bg-red-500' :
                              'bg-purple-500'
                            }`}
                            style={{ 
                              width: `${Math.min((currentStock / maxStock) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        ${unitPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        ${stockValue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stockStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                        stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toast.success(`Viewing ${item.name} details`)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast.success(`Editing ${item.name}`)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title={`Edit ${item.type === 'product' ? 'Product' : 'Supply'}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Low Stock Alerts View
  const LowStockAlertsView = () => {
    const lowStockProducts = products.filter(product => {
      const current = product.stock?.current || 0;
      const minimum = product.stock?.minimum || 5;
      return current <= minimum;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
              <p className="text-sm text-gray-600">{lowStockProducts.length} items need attention</p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">Immediate Action Required</span>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
              <p className="text-gray-600">No low stock alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map((product) => {
                const current = product.stock?.current || 0;
                const minimum = product.stock?.minimum || 5;
                const isOutOfStock = current === 0;
                
                return (
                  <div key={product._id} className={`p-4 rounded-lg border-l-4 ${
                    isOutOfStock ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images[0]}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">Category: {product.category.replace('-', ' ')}</p>
                          <p className="text-sm text-gray-600">
                            Current: {current} {product.unit} | Minimum: {minimum} {product.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Need: {Math.max(minimum - current, minimum)} {product.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => toast.success(`Restocking ${product.name}`)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          isOutOfStock 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        Restock Now
                      </button>
                      <button
                        onClick={() => toast.success(`Editing ${product.name}`)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Edit Product
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage your farm inventory and stock levels
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toast.success('Add product functionality available in Products menu')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2 inline" />
            Overview
          </button>
          <button
            onClick={() => setActiveView('detailed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'detailed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-4 w-4 mr-2 inline" />
            Detailed View
          </button>
          <button
            onClick={() => setActiveView('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
              activeView === 'alerts'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4 mr-2 inline" />
            Stock Alerts
            {inventoryStats.lowStockItems + inventoryStats.outOfStockItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {inventoryStats.lowStockItems + inventoryStats.outOfStockItems}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {activeView === 'overview' && <InventoryOverview />}
          {activeView === 'detailed' && <DetailedInventoryView />}
          {activeView === 'alerts' && <LowStockAlertsView />}
        </>
      )}
    </div>
  );
};

export default FarmerInventoryManagement;
