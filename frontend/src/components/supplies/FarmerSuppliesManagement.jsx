import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  AlertTriangle, 
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
  Wrench,
  Scissors,
  Zap,
  Droplets,
  Bug,
  Leaf,
  Shield,
  Fuel,
  HardHat,
  Activity,
  DollarSign,
  Package2,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { farmSuppliesAPI } from '../../services/api.js';
import { 
  exportToPDF, 
  exportToExcel, 
  getSuppliesColumns,
  processDataForExport 
} from '../../utils/exportUtils';

const FarmerSuppliesManagement = () => {
  // Initialize supplies data (this will be replaced with API calls later)
  const getInitialSuppliesData = () => {
    const savedSupplies = localStorage.getItem('farmSupplies');
    if (savedSupplies) {
      return JSON.parse(savedSupplies);
    }
    return [
      {
        _id: '1',
        name: 'Organic Tomato Seeds',
        category: 'seeds',
        quantity: 50,
        unit: 'packets',
        minQuantity: 10,
        maxQuantity: 100,
        price: 1599,
        supplier: 'Green Seeds Co.',
        purchaseDate: '2024-08-01',
        expiryDate: '2025-08-01',
        location: 'Storage Room A',
        status: 'in-stock',
        lastUsed: '2024-08-15',
        notes: 'Premium organic seeds for greenhouse cultivation'
      },
    {
      _id: '2',
      name: 'NPK Fertilizer 10-10-10',
      category: 'fertilizers',
      quantity: 5,
      unit: 'bags (50kg)',
      minQuantity: 10,
      maxQuantity: 50,
      price: 4500,
      supplier: 'Farm Supply Inc.',
      purchaseDate: '2024-07-15',
      expiryDate: '2026-07-15',
      location: 'Fertilizer Shed',
      status: 'low-stock',
      lastUsed: '2024-08-20',
      notes: 'General purpose fertilizer for vegetable crops'
    },
    {
      _id: '3',
      name: 'Irrigation Drip Tape',
      category: 'irrigation',
      quantity: 200,
      unit: 'meters',
      minQuantity: 50,
      maxQuantity: 500,
      price: 125,
      supplier: 'IrrigationPro',
      purchaseDate: '2024-06-01',
      expiryDate: null,
      location: 'Tool Shed',
      status: 'in-stock',
      lastUsed: '2024-08-10',
      notes: 'High-quality drip irrigation tape for efficient watering'
    },
    {
      _id: '4',
      name: 'Garden Hoe',
      category: 'tools',
      quantity: 3,
      unit: 'pieces',
      minQuantity: 2,
      maxQuantity: 5,
      price: 3500,
      supplier: 'ToolMaster',
      purchaseDate: '2024-05-15',
      expiryDate: null,
      location: 'Tool Storage',
      status: 'maintenance',
      lastUsed: '2024-08-25',
      notes: 'Handle needs replacement on one hoe'
    },
    {
      _id: '5',
      name: 'Organic Pesticide Spray',
      category: 'pesticides',
      quantity: 0,
      unit: 'bottles (1L)',
      minQuantity: 5,
      maxQuantity: 20,
      price: 2850,
      supplier: 'EcoFarm Solutions',
      purchaseDate: '2024-07-01',
      expiryDate: '2025-07-01',
      location: 'Chemical Storage',
      status: 'out-of-stock',
      lastUsed: '2024-08-20',
      notes: 'Natural pesticide for organic farming'
    },
    {
      _id: '6',
      name: 'Diesel Fuel',
      category: 'fuel',
      quantity: 150,
      unit: 'liters',
      minQuantity: 100,
      maxQuantity: 500,
      price: 145,
      supplier: 'FuelStation',
      purchaseDate: '2024-08-20',
      expiryDate: null,
      location: 'Fuel Tank',
      status: 'in-stock',
      lastUsed: '2024-08-26',
      notes: 'For tractors and farm equipment'
    }
    ];
  };

  // State management
  const [supplies, setSupplies] = useState(getInitialSuppliesData());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSupplies, setSelectedSupplies] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);

  // Supply categories - matching backend enum values
  const categories = [
    { value: 'all', label: 'All Categories', icon: Package2 },
    { value: 'seeds', label: 'Seeds & Plants', icon: Leaf },
    { value: 'fertilizers', label: 'Fertilizers', icon: Droplets },
    { value: 'pesticides', label: 'Pesticides & Chemicals', icon: Bug },
    { value: 'tools', label: 'Tools & Equipment', icon: Wrench },
    { value: 'irrigation', label: 'Irrigation Supplies', icon: Droplets },
    { value: 'animal-feed', label: 'Animal Feed', icon: Package2 },
    { value: 'machinery', label: 'Machinery', icon: Wrench },
    { value: 'equipment', label: 'Equipment', icon: HardHat },
    { value: 'soil-amendments', label: 'Soil Amendments', icon: Leaf },
    { value: 'greenhouse-supplies', label: 'Greenhouse Supplies', icon: Box },
  ];

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
    { value: 'expired', label: 'Expired' },
    { value: 'maintenance', label: 'Maintenance Required' },
  ];

  const [suppliesData, setSuppliesData] = useState(getInitialSuppliesData);

  // Load supplies from API
  useEffect(() => {
    loadSupplies();
  }, []);

  const loadSupplies = async () => {
    setLoading(true);
    try {
      const response = await farmSuppliesAPI.getAllSupplies();
      setSupplies(response.data || response);
    } catch (error) {
      console.error('Error loading supplies:', error);
      toast.error('Failed to load farm supplies');
      // Fallback to localStorage or default data if API fails
      const savedSupplies = localStorage.getItem('farmSupplies');
      if (savedSupplies) {
        setSupplies(JSON.parse(savedSupplies));
      } else {
        setSupplies(suppliesData);
      }
    } finally {
      setLoading(false);
    }
  };

  const addSupply = async (newSupplyData) => {
    try {
      const supplyToAdd = {
        ...newSupplyData,
        status: getSupplyStatus(newSupplyData.quantity, newSupplyData.minQuantity, newSupplyData.expiryDate),
        lastUsed: new Date().toISOString().split('T')[0]
      };
      
      const response = await farmSuppliesAPI.createSupply(supplyToAdd);
      const newSupply = response.data || response;
      
      setSupplies(prev => [...prev, newSupply]);
      toast.success(`${newSupply.name} added successfully!`);
    } catch (error) {
      console.error('Error adding supply:', error);
      toast.error('Failed to add farm supply');
    }
  };

  const updateSupply = async (id, updatedData) => {
    try {
      const updatedSupplyData = {
        ...updatedData,
        status: getSupplyStatus(updatedData.quantity, updatedData.minQuantity, updatedData.expiryDate)
      };
      
      const response = await farmSuppliesAPI.updateSupply(id, updatedSupplyData);
      const updatedSupply = response.data || response;
      
      setSupplies(prev => prev.map(supply => supply._id === id ? updatedSupply : supply));
      toast.success(`${updatedSupply.name} updated successfully!`);
    } catch (error) {
      console.error('Error updating supply:', error);
      toast.error('Failed to update farm supply');
    }
  };

  const deleteSupply = async (id) => {
    try {
      const supplyToDelete = supplies.find(s => s._id === id);
      await farmSuppliesAPI.deleteSupply(id);
      
      setSupplies(prev => prev.filter(supply => supply._id !== id));
      toast.success(`${supplyToDelete?.name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting supply:', error);
      toast.error('Failed to delete farm supply');
    }
  };



  const getSupplyStatus = (quantity, minQuantity, expiryDate) => {
    const current = quantity || 0;
    const minimum = minQuantity || 5;
    const isExpired = expiryDate && new Date(expiryDate) < new Date();

    if (isExpired) return 'expired';
    if (current === 0) return 'out-of-stock';
    if (current <= minimum) return 'low-stock';
    return 'in-stock';
  };

  // Filter and sort supplies
  const filteredAndSortedSupplies = React.useMemo(() => {
    let filtered = [...supplies];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(supply =>
        supply.name.toLowerCase().includes(query) ||
        supply.category.toLowerCase().includes(query) ||
        (typeof supply.supplier === 'string' ? supply.supplier : supply.supplier?.name || '').toLowerCase().includes(query) ||
        supply.notes.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(supply => supply.category === selectedCategory);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supply => {
        const current = supply.quantity || 0;
        const minimum = supply.minQuantity || 5;

        switch (statusFilter) {
          case 'in-stock':
            return current > minimum && supply.status === 'in-stock';
          case 'low-stock':
            return (current > 0 && current <= minimum) || supply.status === 'low-stock';
          case 'out-of-stock':
            return current === 0 || supply.status === 'out-of-stock';
          case 'expired':
            return supply.expiryDate && new Date(supply.expiryDate) < new Date();
          case 'maintenance':
            return supply.status === 'maintenance';
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
        case 'quantity':
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'lastUsed':
          aValue = new Date(a.lastUsed || a.purchaseDate);
          bValue = new Date(b.lastUsed || b.purchaseDate);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [supplies, searchQuery, selectedCategory, statusFilter, sortBy, sortOrder]);

  // Calculate supplies statistics
  const suppliesStats = React.useMemo(() => {
    const totalSupplies = supplies.length;
    const totalValue = supplies.reduce((sum, supply) => 
      sum + ((supply.quantity || 0) * (supply.price || 0)), 0
    );
    const lowStockItems = supplies.filter(supply => {
      const current = supply.quantity || 0;
      const minimum = supply.minQuantity || 5;
      return current > 0 && current <= minimum;
    }).length;
    const outOfStockItems = supplies.filter(supply => 
      (supply.quantity || 0) === 0
    ).length;
    const maintenanceItems = supplies.filter(supply => 
      supply.status === 'maintenance'
    ).length;
    const expiredItems = supplies.filter(supply => 
      supply.expiryDate && new Date(supply.expiryDate) < new Date()
    ).length;

    return {
      totalSupplies,
      totalValue,
      lowStockItems,
      outOfStockItems,
      maintenanceItems,
      expiredItems,
      inStockItems: totalSupplies - outOfStockItems
    };
  }, [supplies]);

  const getStatusInfo = (supply) => {
    const current = supply.quantity || 0;
    const minimum = supply.minQuantity || 5;
    const isExpired = supply.expiryDate && new Date(supply.expiryDate) < new Date();

    if (supply.status === 'maintenance') return { status: 'maintenance', color: 'purple', label: 'Maintenance Required' };
    if (isExpired) return { status: 'expired', color: 'red', label: 'Expired' };
    if (current === 0) return { status: 'out-of-stock', color: 'red', label: 'Out of Stock' };
    if (current <= minimum) return { status: 'low-stock', color: 'orange', label: 'Low Stock' };
    return { status: 'in-stock', color: 'green', label: 'In Stock' };
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      seeds: Leaf,
      fertilizers: Droplets,
      pesticides: Bug,
      tools: Wrench,
      irrigation: Droplets,
      'animal-feed': Package2,
      machinery: Wrench,
      equipment: HardHat,
      'soil-amendments': Leaf,
      'greenhouse-supplies': Box,
    };
    return iconMap[category] || Package2;
  };

  // Export handlers
  const handleExportToPDF = () => {
    try {
      // Prepare data for export
      const exportData = filteredAndSortedSupplies.map(supply => ({
        id: supply._id || supply.id,
        name: supply.name,
        type: supply.category,
        quantity: supply.quantity || 0,
        unit: supply.unit || 'units',
        costPerUnit: supply.price || 0,
        totalCost: (supply.quantity || 0) * (supply.price || 0),
        supplier: supply.supplier || 'N/A',
        status: getStatusInfo(supply).label,
        purchaseDate: supply.purchaseDate || supply.createdAt || new Date().toISOString().split('T')[0]
      }));

      // Process data with formatting
      const processedData = processDataForExport(
        exportData, 
        ['costPerUnit', 'totalCost'], 
        ['purchaseDate']
      );

      // Generate filename with current filters
      const categoryFilter = selectedCategory !== 'all' ? `_${selectedCategory}` : '';
      const statusFilterText = statusFilter !== 'all' ? `_${statusFilter}` : '';
      const filename = `farm_supplies${categoryFilter}${statusFilterText}_${new Date().toISOString().split('T')[0]}`;

      exportToPDF(
        processedData,
        'Farm Supplies Management Report',
        getSuppliesColumns(),
        filename,
        'supplies'
      );
      
      toast.success('Farm supplies exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting supplies to PDF:', error);
      toast.error('Failed to export supplies to PDF');
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredAndSortedSupplies.map(supply => ({
        id: supply._id || supply.id,
        name: supply.name,
        type: supply.category,
        quantity: supply.quantity || 0,
        unit: supply.unit || 'units',
        costPerUnit: supply.price || 0,
        totalCost: (supply.quantity || 0) * (supply.price || 0),
        supplier: supply.supplier || 'N/A',
        status: getStatusInfo(supply).label,
        purchaseDate: supply.purchaseDate || supply.createdAt || new Date().toISOString().split('T')[0]
      }));

      // Generate filename with current filters
      const categoryFilter = selectedCategory !== 'all' ? `_${selectedCategory}` : '';
      const statusFilterText = statusFilter !== 'all' ? `_${statusFilter}` : '';
      const filename = `farm_supplies${categoryFilter}${statusFilterText}_${new Date().toISOString().split('T')[0]}`;

      exportToExcel(
        exportData,
        'Farm Supplies Report',
        getSuppliesColumns(),
        filename
      );
      
      toast.success('Farm supplies exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting supplies to Excel:', error);
      toast.error('Failed to export supplies to Excel');
    }
  };

  // Supplies Overview Dashboard
  const SuppliesOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Supplies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{suppliesStats.totalSupplies}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">LKR {suppliesStats.totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{suppliesStats.lowStockItems}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Items</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{suppliesStats.maintenanceItems}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplies Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{suppliesStats.inStockItems}</div>
            <div className="text-sm text-green-700">In Stock</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{suppliesStats.lowStockItems}</div>
            <div className="text-sm text-orange-700">Low Stock</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{suppliesStats.outOfStockItems}</div>
            <div className="text-sm text-red-700">Out of Stock</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{suppliesStats.maintenanceItems}</div>
            <div className="text-sm text-purple-700">Maintenance</div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(1).map((category) => {
            const Icon = category.icon;
            const count = supplies.filter(supply => supply.category === category.value).length;
            const value = supplies
              .filter(supply => supply.category === category.value)
              .reduce((sum, supply) => sum + ((supply.quantity || 0) * (supply.price || 0)), 0);
            
            return (
              <div key={category.value} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Icon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{category.label}</div>
                <div className="text-xs text-gray-500 mt-1">LKR {value.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Supply Activity</h3>
        <div className="space-y-3">
          {supplies.slice(0, 5).map((supply) => {
            const Icon = getCategoryIcon(supply.category);
            const statusInfo = getStatusInfo(supply);
            
            return (
              <div key={supply._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{supply.name}</p>
                    <p className="text-sm text-gray-600">
                      {supply.quantity} {supply.unit} • Last used: {new Date(supply.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                    statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {statusInfo.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Detailed Supplies View
  const DetailedSuppliesView = () => {
    console.log('DetailedSuppliesView rendering, supplies length:', supplies.length);
    console.log('filteredAndSortedSupplies length:', filteredAndSortedSupplies.length);
    console.log('activeView is:', activeView);
    
    // Try catch to identify any rendering errors
    try {
      return (
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
                placeholder="Search supplies..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadSupplies}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportToPDF()}
                disabled={loading || filteredAndSortedSupplies.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </button>
              <button
                onClick={() => handleExportToExcel()}
                disabled={loading || filteredAndSortedSupplies.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </button>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supply
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedSupplies.length} of {supplies.length} supplies
          </span>
          {selectedSupplies.length > 0 && (
            <span className="text-green-600 font-medium">
              {selectedSupplies.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setSortBy('name')}
                >
                  <div className="flex items-center">
                    Supply Item
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setSortBy('category')}
                >
                  <div className="flex items-center">
                    Category
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setSortBy('quantity')}
                >
                  <div className="flex items-center">
                    Quantity
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Levels
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
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
              {filteredAndSortedSupplies.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Truck className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No supplies found</h3>
                      <p className="text-gray-500 mb-4">
                        {supplies.length === 0 
                          ? "No supplies have been added yet. Click 'Add Supply' to get started." 
                          : "No supplies match your current filters. Try adjusting your search or filters."
                        }
                      </p>
                      {supplies.length === 0 && (
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Supply
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedSupplies.map((supply) => {
                const Icon = getCategoryIcon(supply.category);
                const statusInfo = getStatusInfo(supply);
                
                return (
                  <tr key={supply._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Icon className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supply.name}</div>
                          <div className="text-sm text-gray-500">{supply.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {supply.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {supply.quantity || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        LKR {((supply.quantity || 0) * (supply.price || 0)).toFixed(2)} value
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium">{supply.minQuantity || 5}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium">{supply.maxQuantity || 100}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              statusInfo.color === 'green' ? 'bg-green-500' :
                              statusInfo.color === 'orange' ? 'bg-orange-500' :
                              statusInfo.color === 'red' ? 'bg-red-500' :
                              'bg-purple-500'
                            }`}
                            style={{ 
                              width: `${Math.min(((supply.quantity || 0) / (supply.maxQuantity || 100)) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {typeof supply.supplier === 'string' ? supply.supplier : supply.supplier?.name || 'Unknown Supplier'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Purchased: {new Date(supply.purchaseDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(supply.lastUsed).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                        statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toast.success(`Viewing ${supply.name} details`)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSupply(supply);
                            setShowAddForm(true);
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Supply"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${supply.name}?`)) {
                              deleteSupply(supply._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Supply"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
    } catch (error) {
      console.error('Error rendering DetailedSuppliesView:', error);
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">Rendering Error</h3>
          <p className="text-sm text-red-600">There was an error displaying the detailed view. Please check the console for more details.</p>
          <p className="text-xs text-red-500 mt-2">Error: {error.message}</p>
        </div>
      );
    }
  };

  // Alerts and Maintenance View
  const AlertsView = () => {
    const alertSupplies = supplies.filter(supply => {
      const statusInfo = getStatusInfo(supply);
      return ['low-stock', 'out-of-stock', 'maintenance', 'expired'].includes(statusInfo.status);
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Supply Alerts & Maintenance</h3>
              <p className="text-sm text-gray-600">{alertSupplies.length} items need attention</p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">Action Required</span>
            </div>
          </div>

          {alertSupplies.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
              <p className="text-gray-600">No alerts or maintenance required at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertSupplies.map((supply) => {
                const Icon = getCategoryIcon(supply.category);
                const statusInfo = getStatusInfo(supply);
                const current = supply.quantity || 0;
                const minimum = supply.minQuantity || 5;
                
                return (
                  <div key={supply._id} className={`p-4 rounded-lg border-l-4 ${
                    statusInfo.status === 'out-of-stock' ? 'border-red-500 bg-red-50' :
                    statusInfo.status === 'expired' ? 'border-red-500 bg-red-50' :
                    statusInfo.status === 'maintenance' ? 'border-purple-500 bg-purple-50' :
                    'border-orange-500 bg-orange-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Icon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{supply.name}</h4>
                          <p className="text-sm text-gray-600">Category: {supply.category.replace('-', ' ')}</p>
                          <p className="text-sm text-gray-600">
                            Current: {current} {supply.unit} | Minimum: {minimum} {supply.unit}
                          </p>
                          <p className="text-sm text-gray-600">
                            Supplier: {typeof supply.supplier === 'string' ? supply.supplier : supply.supplier?.name || 'Unknown Supplier'}
                          </p>
                          {supply.expiryDate && (
                            <p className="text-sm text-gray-600">
                              Expires: {new Date(supply.expiryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusInfo.status === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                          statusInfo.status === 'expired' ? 'bg-red-100 text-red-800' :
                          statusInfo.status === 'maintenance' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {statusInfo.label}
                        </div>
                        {statusInfo.status === 'low-stock' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Need: {Math.max(minimum - current, minimum)} {supply.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      {statusInfo.status === 'maintenance' ? (
                        <button
                          onClick={() => toast.success(`Scheduling maintenance for ${supply.name}`)}
                          className="px-3 py-1 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Schedule Maintenance
                        </button>
                      ) : statusInfo.status === 'expired' ? (
                        <button
                          onClick={() => toast.success(`Replacing expired ${supply.name}`)}
                          className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Replace Item
                        </button>
                      ) : (
                        <button
                          onClick={() => toast.success(`Ordering more ${supply.name}`)}
                          className="px-3 py-1 text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1 inline" />
                          Order More
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingSupply(supply);
                          setShowAddForm(true);
                        }}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Edit
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
          <h1 className="text-2xl font-bold text-gray-900">Supplies Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your farm supplies, equipment, and materials
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Supply
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
            <Truck className="h-4 w-4 mr-2 inline" />
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
            Alerts & Maintenance
            {suppliesStats.lowStockItems + suppliesStats.outOfStockItems + suppliesStats.maintenanceItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {suppliesStats.lowStockItems + suppliesStats.outOfStockItems + suppliesStats.maintenanceItems}
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
          {activeView === 'overview' && <SuppliesOverview />}
          {activeView === 'detailed' && <DetailedSuppliesView />}
          {activeView === 'alerts' && <AlertsView />}
        </>
      )}

      {/* Add/Edit Supply Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Form Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSupply ? 'Edit Supply' : 'Add New Supply'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingSupply(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supply Name *
                    </label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingSupply?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter supply name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      defaultValue={editingSupply?.category || 'tools'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      defaultValue={editingSupply?.quantity || ''}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <input
                      name="unit"
                      type="text"
                      defaultValue={editingSupply?.unit || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., pieces, kg, liters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price *
                    </label>
                    <input
                      name="price"
                      type="number"
                      defaultValue={editingSupply?.price || ''}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Quantity
                    </label>
                    <input
                      name="minQuantity"
                      type="number"
                      defaultValue={editingSupply?.minQuantity || ''}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Quantity
                    </label>
                    <input
                      name="maxQuantity"
                      type="number"
                      defaultValue={editingSupply?.maxQuantity || ''}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <input
                      name="supplier"
                      type="text"
                      defaultValue={editingSupply?.supplier || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Supplier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Location
                    </label>
                    <input
                      name="location"
                      type="text"
                      defaultValue={editingSupply?.location || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Storage location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Date
                    </label>
                    <input
                      name="purchaseDate"
                      type="date"
                      defaultValue={editingSupply?.purchaseDate || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date (optional)
                    </label>
                    <input
                      name="expiryDate"
                      type="date"
                      defaultValue={editingSupply?.expiryDate || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={editingSupply?.notes || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Additional notes about this supply..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSupply(null);
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target.form);
                      const supplierName = formData.get('supplier') || e.target.form.elements.supplier.value || '';
                      const supplyData = {
                        name: formData.get('name') || e.target.form.elements.name.value,
                        description: formData.get('notes') || e.target.form.elements.notes.value || 'No description provided',
                        category: formData.get('category') || e.target.form.elements.category.value,
                        quantity: parseInt(formData.get('quantity') || e.target.form.elements.quantity.value) || 0,
                        unit: formData.get('unit') || e.target.form.elements.unit.value,
                        price: parseFloat(formData.get('price') || e.target.form.elements.price.value) || 0,
                        minQuantity: parseInt(formData.get('minQuantity') || e.target.form.elements.minQuantity.value) || 5,
                        maxQuantity: parseInt(formData.get('maxQuantity') || e.target.form.elements.maxQuantity.value) || 100,
                        supplier: {
                          name: supplierName,
                          contact: '',
                          email: ''
                        },
                        storage: {
                          location: formData.get('location') || e.target.form.elements.location.value || '',
                          temperature: 'room-temp',
                          instructions: ''
                        },
                        expiryDate: formData.get('expiryDate') || e.target.form.elements.expiryDate.value || null,
                        batchNumber: '',
                        lastRestocked: new Date(formData.get('purchaseDate') || e.target.form.elements.purchaseDate.value || new Date())
                      };

                      // Validation
                      if (!supplyData.name || !supplyData.category || !supplyData.unit) {
                        toast.error('Please fill in all required fields (Name, Category, Unit)');
                        return;
                      }

                      if (editingSupply) {
                        updateSupply(editingSupply._id, supplyData);
                      } else {
                        addSupply(supplyData);
                      }
                      
                      setShowAddForm(false);
                      setEditingSupply(null);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    {editingSupply ? 'Update Supply' : 'Add Supply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerSuppliesManagement;
