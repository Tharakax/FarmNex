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
import { validateSupplyForm, getFieldClasses, formatSupplyData } from '../../utils/SupplyFormValidator';
import { 
  showDeleteConfirm, 
  showSuccess, 
  showError, 
  showWarning,
  showValidationError,
  showCriticalValidation,
  showSubmissionConfirm,
  showFieldHint,
  showValidationSuccess
} from '../../utils/sweetAlert';

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
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formCategory, setFormCategory] = useState('tools');
  
  // Update formCategory and reset form state when editingSupply changes
  useEffect(() => {
    if (editingSupply) {
      console.log('EditingSupply data:', editingSupply);
      console.log('Purchase date from supply:', editingSupply.purchaseDate);
      console.log('Expiry date from supply:', editingSupply.expiryDate);
      console.log('Storage location from supply:', editingSupply.location);
      console.log('Storage object from supply:', editingSupply.storage);
      setFormCategory(editingSupply.category || 'tools');
    } else {
      setFormCategory('tools');
    }
    
    // Reset form validation state when switching between add/edit modes
    setFormErrors({});
    setTouchedFields({});
  }, [editingSupply]);

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
      const apiSupplies = response.data || response;
      
      // Debug: Check what data we're getting
      console.log('Loaded supplies from API:', apiSupplies);
      if (apiSupplies.length > 0) {
        console.log('Sample supply data:', apiSupplies[0]);
      }
      
      setSupplies(apiSupplies);
    } catch (error) {
      console.error('Error loading supplies:', error);
      toast.error('Failed to load farm supplies');
      // Fallback to localStorage or default data if API fails
      const savedSupplies = localStorage.getItem('farmSupplies');
      if (savedSupplies) {
        const localSupplies = JSON.parse(savedSupplies);
        console.log('Loaded supplies from localStorage:', localSupplies);
        setSupplies(localSupplies);
      } else {
        console.log('Using default sample data');
        setSupplies(suppliesData);
      }
    } finally {
      setLoading(false);
    }
  };

  const addSupply = async (newSupplyData) => {
    try {
      setFormSubmitting(true);
      
      // Validate form data before submission
      const validation = validateSupplyForm(newSupplyData);
      
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        
        // Show enhanced validation errors with SweetAlert
        await showValidationError(
          validation.errors,
          'Please Fix These Issues Before Adding'
        );
        return false;
      }
      
      // Check for critical validations (high-value items)
      const totalValue = (parseFloat(newSupplyData.price) || 0) * (parseInt(newSupplyData.quantity) || 0);
      if (totalValue > 100000) {
        const criticalResult = await showCriticalValidation(
          `This supply has a high total value of LKR ${totalValue.toFixed(2)}. Please confirm this is correct.`,
          'High-Value Item Detected'
        );
        
        if (!criticalResult.isConfirmed) {
          return false;
        }
      }
      
      // Show submission confirmation
      const confirmResult = await showSubmissionConfirm('supply', newSupplyData);
      if (!confirmResult.isConfirmed) {
        return false;
      }
      
      // Format and prepare data
      const formattedData = formatSupplyData(newSupplyData);
      const supplyToAdd = {
        ...formattedData,
        lastUsed: new Date().toISOString().split('T')[0], // Auto-set when supply is added
        createdAt: new Date().toISOString()
      };
      
      const response = await farmSuppliesAPI.createSupply(supplyToAdd);
      const newSupply = response.data || response;
      
      setSupplies(prev => [...prev, newSupply]);
      
      // Show enhanced success message with recommendations
      const recommendations = [];
      if (newSupply.quantity <= newSupply.minQuantity) {
        recommendations.push('Consider ordering more - current quantity is at or below minimum level');
      }
      if (!newSupply.expiryDate && ['seeds', 'fertilizers', 'pesticides'].includes(newSupply.category)) {
        recommendations.push('Consider adding an expiry date for better inventory management');
      }
      if (!newSupply.location) {
        recommendations.push('Add a storage location for easier inventory tracking');
      }
      
      if (recommendations.length > 0) {
        await showValidationSuccess(
          `${newSupply.name} has been added to your inventory successfully!`,
          recommendations
        );
      } else {
        await showSuccess(
          `${newSupply.name} has been added to your inventory successfully!`,
          'Supply Added'
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error adding supply:', error);
      
      // Try to get detailed error message from response
      let errorMessage = 'Failed to add farm supply';
      
      if (error.response) {
        // Response from server with error status
        const responseData = error.response.data;
        if (responseData && responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData && responseData.error) {
          errorMessage = responseData.error;
        }
      } else if (error.message) {
        // Network or other error
        errorMessage = error.message;
      }
      
      await showError(
        errorMessage,
        'Failed to Add Supply'
      );
      
      return false;
    } finally {
      setFormSubmitting(false);
    }
  };

  const updateSupply = async (id, updatedData) => {
    try {
      setFormSubmitting(true);
      
      // Validate form data before submission
      const validation = validateSupplyForm(updatedData);
      
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        
        // Show enhanced validation errors with SweetAlert
        await showValidationError(
          validation.errors,
          'Please Fix These Issues Before Updating'
        );
        return false;
      }
      
      // Check for critical validations (high-value items)
      const totalValue = (parseFloat(updatedData.price) || 0) * (parseInt(updatedData.quantity) || 0);
      if (totalValue > 100000) {
        const criticalResult = await showCriticalValidation(
          `This supply update results in a high total value of LKR ${totalValue.toFixed(2)}. Please confirm this is correct.`,
          'High-Value Update Detected'
        );
        
        if (!criticalResult.isConfirmed) {
          return false;
        }
      }
      
      // Show submission confirmation
      const confirmResult = await showSubmissionConfirm('supply', {...updatedData, _id: id});
      if (!confirmResult.isConfirmed) {
        return false;
      }
      
      // Format and prepare data
      const formattedData = formatSupplyData(updatedData);
      const dataWithLastUsed = {
        ...formattedData,
        lastUsed: new Date().toISOString().split('T')[0], // Auto-update when supply is modified
        updatedAt: new Date().toISOString()
      };
      
      const response = await farmSuppliesAPI.updateSupply(id, dataWithLastUsed);
      const updatedSupply = response.data || response;
      
      setSupplies(prev => prev.map(supply => supply._id === id ? updatedSupply : supply));
      toast.success(`${updatedSupply.name} updated successfully!`);
      return true;
    } catch (error) {
      console.error('Error updating supply:', error);
      toast.error('Failed to update farm supply: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setFormSubmitting(false);
    }
  };

  const deleteSupply = async (id) => {
    try {
      const supplyToDelete = supplies.find(s => s._id === id);
      await farmSuppliesAPI.deleteSupply(id);
      
      setSupplies(prev => prev.filter(supply => supply._id !== id));
      
      // Show success message with SweetAlert
      await showSuccess(
        `${supplyToDelete?.name} has been permanently deleted from your supplies.`,
        'Supply Deleted Successfully!'
      );
    } catch (error) {
      console.error('Error deleting supply:', error);
      toast.error('Failed to delete farm supply');
    }
  };

  // Real-time validation helper
  const validateField = async (fieldName, value, allValues = {}) => {
    const tempData = { ...allValues, [fieldName]: value };
    const validation = validateSupplyForm(tempData);
    
    if (validation.errors[fieldName]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: validation.errors[fieldName]
      }));
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    return validation.errors[fieldName] ? false : true;
  };
  
  // Helper function to check if date fields are required based on category
  const isDateRequiredForCategory = (category) => {
    const requiresDate = ['seeds', 'fertilizers', 'pesticides', 'animal-feed', 'soil-amendments'];
    return requiresDate.includes(category);
  };
  
  // Helper function to safely format dates for display
  const formatDate = (dateValue, debugLabel, showRecent = false) => {
    if (debugLabel) {
      console.log(`formatDate(${debugLabel}):`, dateValue, 'Type:', typeof dateValue);
    }
    
    if (!dateValue) {
      // If showRecent is true and we don't have a purchase date, show "Recently added"
      return showRecent ? 'Recently added' : 'Not set';
    }
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        if (debugLabel) console.log(`${debugLabel} - Invalid date:`, dateValue);
        return showRecent ? 'Recently added' : 'Invalid Date';
      }
      const formatted = date.toLocaleDateString();
      if (debugLabel) console.log(`${debugLabel} - Formatted:`, formatted);
      return formatted;
    } catch (error) {
      if (debugLabel) console.log(`${debugLabel} - Error:`, error);
      return showRecent ? 'Recently added' : 'Invalid Date';
    }
  };
  
  // Helper function to format dates for HTML date inputs (YYYY-MM-DD)
  const formatDateForInput = (dateValue, supplyName = 'Unknown') => {
    console.log(`formatDateForInput(${supplyName}):`, dateValue, 'Type:', typeof dateValue);
    
    if (!dateValue) {
      console.log(`${supplyName} - No date value provided`);
      return '';
    }
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.log(`${supplyName} - Invalid date:`, dateValue);
        return '';
      }
      const formatted = date.toISOString().split('T')[0];
      console.log(`${supplyName} - Formatted for input:`, formatted);
      return formatted;
    } catch (error) {
      console.log(`${supplyName} - Error formatting date:`, error);
      return '';
    }
  };
  
  // Helper function to get default purchase date for edit form
  const getDefaultPurchaseDate = (supply) => {
    const existing = formatDateForInput(supply?.purchaseDate, supply?.name);
    if (existing) return existing;
    
    // If editing a supply without a purchase date, suggest today's date
    if (supply && !supply.purchaseDate) {
      console.log(`${supply.name} - No purchase date, suggesting today`);
      return new Date().toISOString().split('T')[0];
    }
    
    return '';
  };
  
  // Helper function to get supplier name (handles both string and object)
  const getSupplierName = (supplier) => {
    if (!supplier) return '';
    if (typeof supplier === 'string') return supplier;
    if (typeof supplier === 'object' && supplier.name) return supplier.name;
    return '';
  };
  
  // Helper function to get storage location (handles both string and object)
  const getStorageLocation = (supply) => {
    if (!supply) return '';
    
    // Check if location is directly on the supply object
    if (supply.location && typeof supply.location === 'string') {
      console.log(`${supply.name} - Direct location found:`, supply.location);
      return supply.location;
    }
    
    // Check if location is in storage object (backend format)
    if (supply.storage && supply.storage.location) {
      console.log(`${supply.name} - Storage object location found:`, supply.storage.location);
      return supply.storage.location;
    }
    
    console.log(`${supply.name} - No storage location found`);
    return '';
  };
  
  
  // Helper function to check if date is valid
  const isValidDate = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  };
  
  // Show field hints
  const showHint = (fieldName) => {
    const hints = {
      name: 'Use descriptive names like "Organic Tomato Seeds" or "NPK Fertilizer 10-10-10". Avoid test names or placeholders.',
      category: 'Choose the most appropriate category for this item. This affects expiry date validation and other business rules.',
      quantity: 'Enter the current amount you have in stock. Use whole numbers for tools/equipment, decimals allowed for seeds/fertilizers.',
      unit: 'Use standard units: pieces, kg, liters, bags, bottles, etc. This will be validated against common farming units.',
      price: 'Enter the unit price (price per single item/kg/liter). Category-specific validation will check reasonable price ranges.',
      minQuantity: 'Set a minimum stock level to get low-stock alerts. Should be less than maximum quantity.',
      maxQuantity: 'Set a maximum storage capacity for this item. Should be greater than minimum quantity.',
      supplier: 'Enter the supplier or vendor name for future reference. Use proper company names, avoid placeholders.',
      location: 'Specify where this item is stored (e.g., "Storage Room A", "Tool Shed"). Use descriptive location terms.',
      purchaseDate: 'Select the date when you bought this item. Cannot be in the future, affects expiry date validation.',
      expiryDate: 'Add expiry date for perishable items (seeds, fertilizers, chemicals). Tools typically don\'t need expiry dates.',
      notes: 'Add meaningful details about condition, quality, usage instructions, or maintenance requirements. Avoid placeholder text.'
    };
    
    if (hints[fieldName]) {
      showFieldHint(fieldName.charAt(0).toUpperCase() + fieldName.slice(1), hints[fieldName]);
    }
  };



  const getSupplyStatus = (quantity, minQuantity, expiryDate) => {
    const current = quantity || 0;
    const minimum = minQuantity || 5;
    const isExpired = isValidDate(expiryDate) && new Date(expiryDate) < new Date();

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
            return isValidDate(supply.expiryDate) && new Date(supply.expiryDate) < new Date();
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
      isValidDate(supply.expiryDate) && new Date(supply.expiryDate) < new Date()
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
    const isExpired = isValidDate(supply.expiryDate) && new Date(supply.expiryDate) < new Date();

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
        supplier: getSupplierName(supply.supplier) || 'N/A',
        status: getStatusInfo(supply).label,
        purchaseDate: formatDate(supply.purchaseDate || supply.createdAt)
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
        supplier: getSupplierName(supply.supplier) || 'N/A',
        status: getStatusInfo(supply).label,
        purchaseDate: formatDate(supply.purchaseDate || supply.createdAt)
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
                      {supply.quantity} {supply.unit}
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
                  <td colSpan="8" className="px-6 py-12 text-center">
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
                        Purchased: {formatDate(supply.purchaseDate, `Purchase-${supply.name}`, true)}
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
                          onClick={async () => {
                            const result = await showDeleteConfirm(supply.name);
                            if (result.isConfirmed) {
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
                          {isValidDate(supply.expiryDate) && (
                            <p className="text-sm text-gray-600">
                              Expires: {formatDate(supply.expiryDate)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Form Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSupply ? 'Edit Supply' : 'Add New Supply'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingSupply(null);
                  setFormErrors({});
                  setTouchedFields({});
                  setFormCategory('tools');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form 
                key={editingSupply?._id || 'new'} 
                className="space-y-4" 
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Supply Name *
                      <button
                        type="button"
                        onClick={() => showHint('name')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingSupply?.name || ''}
                      className={getFieldClasses('name', formErrors, touchedFields)}
                      placeholder="Enter supply name (e.g., Organic Tomato Seeds)"
                      required
                      onChange={(e) => {
                        if (formErrors.name) {
                          const newErrors = {...formErrors};
                          delete newErrors.name;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, name: true});
                        const form = e.target.form;
                        const allValues = {
                          name: e.target.value,
                          category: form.elements.category?.value,
                          quantity: form.elements.quantity?.value,
                          price: form.elements.price?.value
                        };
                        validateField('name', e.target.value, allValues);
                      }}
                    />
                    {formErrors.name && touchedFields.name && (
                      <div className="mt-1">
                        {formErrors.name.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Category *
                      <button
                        type="button"
                        onClick={() => showHint('category')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <select
                      name="category"
                      defaultValue={editingSupply?.category || 'tools'}
                      className={getFieldClasses('category', formErrors, touchedFields)}
                      required
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setFormCategory(newCategory);
                        
                        if (formErrors.category) {
                          const newErrors = {...formErrors};
                          delete newErrors.category;
                          setFormErrors(newErrors);
                        }
                        
                        // Clear date field errors when category changes
                        if (formErrors.purchaseDate || formErrors.expiryDate) {
                          const newErrors = {...formErrors};
                          delete newErrors.purchaseDate;
                          delete newErrors.expiryDate;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, category: true});
                        const allValues = {
                          category: e.target.value,
                          expiryDate: e.target.form.elements.expiryDate?.value
                        };
                        validateField('category', e.target.value, allValues);
                      }}
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && touchedFields.category && (
                      <div className="mt-1">
                        {formErrors.category.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Quantity *
                      <button
                        type="button"
                        onClick={() => showHint('quantity')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      defaultValue={editingSupply?.quantity || ''}
                      min="0"
                      step="0.1"
                      className={getFieldClasses('quantity', formErrors, touchedFields)}
                      placeholder="0"
                      required
                      onChange={(e) => {
                        if (formErrors.quantity) {
                          const newErrors = {...formErrors};
                          delete newErrors.quantity;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, quantity: true});
                        const form = e.target.form;
                        const allValues = {
                          quantity: e.target.value,
                          category: form.elements.category?.value,
                          minQuantity: form.elements.minQuantity?.value,
                          maxQuantity: form.elements.maxQuantity?.value,
                          price: form.elements.price?.value
                        };
                        validateField('quantity', e.target.value, allValues);
                      }}
                    />
                    {formErrors.quantity && touchedFields.quantity && (
                      <div className="mt-1">
                        {formErrors.quantity.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Unit *
                      <button
                        type="button"
                        onClick={() => showHint('unit')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="unit"
                      type="text"
                      defaultValue={editingSupply?.unit || ''}
                      className={getFieldClasses('unit', formErrors, touchedFields)}
                      placeholder="e.g., pieces, kg, liters, bags"
                      required
                      onChange={(e) => {
                        if (formErrors.unit) {
                          const newErrors = {...formErrors};
                          delete newErrors.unit;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, unit: true});
                        validateField('unit', e.target.value);
                      }}
                    />
                    {formErrors.unit && touchedFields.unit && (
                      <div className="mt-1">
                        {formErrors.unit.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Unit Price *
                      <button
                        type="button"
                        onClick={() => showHint('price')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="price"
                      type="number"
                      defaultValue={editingSupply?.price || ''}
                      min="0"
                      step="0.01"
                      className={getFieldClasses('price', formErrors, touchedFields)}
                      placeholder="0.00 (LKR per unit)"
                      required
                      onChange={(e) => {
                        if (formErrors.price) {
                          const newErrors = {...formErrors};
                          delete newErrors.price;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, price: true});
                        const form = e.target.form;
                        const allValues = {
                          price: e.target.value,
                          quantity: form.elements.quantity?.value,
                          category: form.elements.category?.value
                        };
                        validateField('price', e.target.value, allValues);
                      }}
                    />
                    {formErrors.price && touchedFields.price && (
                      <div className="mt-1">
                        {formErrors.price.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Minimum Quantity *
                      <button
                        type="button"
                        onClick={() => showHint('minQuantity')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="minQuantity"
                      type="number"
                      defaultValue={editingSupply?.minQuantity || ''}
                      min="0"
                      className={getFieldClasses('minQuantity', formErrors, touchedFields)}
                      placeholder="5 (low stock alert level)"
                      required
                      onChange={(e) => {
                        if (formErrors.minQuantity || formErrors.stockRange) {
                          const newErrors = {...formErrors};
                          delete newErrors.minQuantity;
                          delete newErrors.stockRange;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, minQuantity: true});
                        const form = e.target.form;
                        const allValues = {
                          minQuantity: e.target.value,
                          maxQuantity: form.elements.maxQuantity?.value
                        };
                        validateField('minQuantity', e.target.value, allValues);
                      }}
                    />
                    {formErrors.minQuantity && touchedFields.minQuantity && (
                      <div className="mt-1">
                        {formErrors.minQuantity.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Maximum Quantity (optional)
                      <button
                        type="button"
                        onClick={() => showHint('maxQuantity')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="maxQuantity"
                      type="number"
                      defaultValue={editingSupply?.maxQuantity || ''}
                      min="0"
                      className={getFieldClasses('maxQuantity', formErrors, touchedFields)}
                      placeholder="100 (storage capacity)"
                      onChange={(e) => {
                        if (formErrors.maxQuantity || formErrors.stockRange) {
                          const newErrors = {...formErrors};
                          delete newErrors.maxQuantity;
                          delete newErrors.stockRange;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, maxQuantity: true});
                        const form = e.target.form;
                        const allValues = {
                          minQuantity: form.elements.minQuantity?.value,
                          maxQuantity: e.target.value
                        };
                        validateField('maxQuantity', e.target.value, allValues);
                      }}
                    />
                    {formErrors.maxQuantity && touchedFields.maxQuantity && (
                      <div className="mt-1">
                        {formErrors.maxQuantity.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {formErrors.stockRange && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="text-sm text-red-700">{formErrors.stockRange[0]}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Supplier *
                      <button
                        type="button"
                        onClick={() => showHint('supplier')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="supplier"
                      type="text"
                      defaultValue={getSupplierName(editingSupply?.supplier)}
                      className={getFieldClasses('supplier', formErrors, touchedFields)}
                      placeholder="e.g., Green Farm Supplies, Agri Store"
                      required
                      onChange={(e) => {
                        if (formErrors.supplier) {
                          const newErrors = {...formErrors};
                          delete newErrors.supplier;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, supplier: true});
                        validateField('supplier', e.target.value);
                      }}
                    />
                    {formErrors.supplier && touchedFields.supplier && (
                      <div className="mt-1">
                        {formErrors.supplier.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Storage Location *
                      <button
                        type="button"
                        onClick={() => showHint('location')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="location"
                      type="text"
                      defaultValue={getStorageLocation(editingSupply)}
                      className={getFieldClasses('location', formErrors, touchedFields)}
                      placeholder="e.g., Storage Room A, Tool Shed, Warehouse"
                      required
                      onChange={(e) => {
                        if (formErrors.location) {
                          const newErrors = {...formErrors};
                          delete newErrors.location;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, location: true});
                        validateField('location', e.target.value);
                      }}
                    />
                    {formErrors.location && touchedFields.location && (
                      <div className="mt-1">
                        {formErrors.location.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Purchase Date {isDateRequiredForCategory(formCategory) ? '*' : '(optional)'}
                      <button
                        type="button"
                        onClick={() => showHint('purchaseDate')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="purchaseDate"
                      type="date"
                      defaultValue={getDefaultPurchaseDate(editingSupply)}
                      className={getFieldClasses('purchaseDate', formErrors, touchedFields)}
                      onChange={(e) => {
                        if (formErrors.purchaseDate) {
                          const newErrors = {...formErrors};
                          delete newErrors.purchaseDate;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, purchaseDate: true});
                        const form = e.target.form;
                        const allValues = {
                          purchaseDate: e.target.value,
                          expiryDate: form.elements.expiryDate?.value,
                          category: formCategory
                        };
                        validateField('purchaseDate', e.target.value, allValues);
                      }}
                    />
                    {formErrors.purchaseDate && touchedFields.purchaseDate && (
                      <div className="mt-1">
                        {formErrors.purchaseDate.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      Expiry Date {isDateRequiredForCategory(formCategory) ? '*' : '(optional)'}
                      <button
                        type="button"
                        onClick={() => showHint('expiryDate')}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Show help"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      name="expiryDate"
                      type="date"
                      defaultValue={formatDateForInput(editingSupply?.expiryDate, editingSupply?.name)}
                      className={getFieldClasses('expiryDate', formErrors, touchedFields)}
                      onChange={(e) => {
                        if (formErrors.expiryDate) {
                          const newErrors = {...formErrors};
                          delete newErrors.expiryDate;
                          setFormErrors(newErrors);
                        }
                      }}
                      onBlur={(e) => {
                        setTouchedFields({...touchedFields, expiryDate: true});
                        const form = e.target.form;
                        const allValues = {
                          expiryDate: e.target.value,
                          purchaseDate: form.elements.purchaseDate?.value,
                          category: formCategory
                        };
                        validateField('expiryDate', e.target.value, allValues);
                      }}
                    />
                    {formErrors.expiryDate && touchedFields.expiryDate && (
                      <div className="mt-1">
                        {formErrors.expiryDate.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Notes (optional)
                    <button
                      type="button"
                      onClick={() => showHint('notes')}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title="Show help"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={editingSupply?.notes || ''}
                    rows={3}
                    className={getFieldClasses('notes', formErrors, touchedFields)}
                    placeholder="Additional notes: quality, condition, usage instructions, maintenance requirements..."
                    onChange={(e) => {
                      if (formErrors.notes) {
                        const newErrors = {...formErrors};
                        delete newErrors.notes;
                        setFormErrors(newErrors);
                      }
                    }}
                    onBlur={(e) => {
                      setTouchedFields({...touchedFields, notes: true});
                      validateField('notes', e.target.value);
                    }}
                  />
                  {formErrors.notes && touchedFields.notes && (
                    <div className="mt-1">
                      {formErrors.notes.map((error, index) => (
                        <p key={index} className="text-sm text-red-600 flex items-start gap-1">
                          <span className="text-red-500 mt-0.5">•</span>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingSupply(null);
                  setFormErrors({});
                  setTouchedFields({});
                  setFormCategory('tools');
                }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    onClick={async (e) => {
                      e.preventDefault();
                      const form = e.target.form;
                      
                      // Mark all fields as touched for validation
                      const allFields = {
                        name: true, category: true, quantity: true, unit: true, price: true,
                        minQuantity: true, maxQuantity: true, supplier: true, location: true,
                        purchaseDate: true, expiryDate: true, notes: true
                      };
                      setTouchedFields(allFields);
                      
                      // Collect form data
                      const supplyData = {
                        name: form.elements.name.value,
                        notes: form.elements.notes.value || '',
                        category: form.elements.category.value,
                        quantity: form.elements.quantity.value,
                        unit: form.elements.unit.value,
                        price: form.elements.price.value,
                        minQuantity: form.elements.minQuantity.value,
                        maxQuantity: form.elements.maxQuantity.value || '100',
                        supplier: form.elements.supplier.value,
                        location: form.elements.location.value,
                        purchaseDate: form.elements.purchaseDate.value || new Date().toISOString().split('T')[0],
                        expiryDate: form.elements.expiryDate.value || null
                      };
                      
                      // Debug: Check what data we're submitting
                      console.log('Form submission data:', supplyData);
                      console.log('Purchase date value:', supplyData.purchaseDate, 'Type:', typeof supplyData.purchaseDate);
                      
                      // Validate the entire form
                      const validation = validateSupplyForm(supplyData);
                      setFormErrors(validation.errors);
                      
                      if (!validation.isValid) {
                        // Show enhanced validation errors with SweetAlert
                        await showValidationError(
                          validation.errors,
                          'Please Fix These Issues Before Submitting'
                        );
                        return;
                      }
                      
                      // Check for critical validations before final submission
                      const totalValue = (parseFloat(supplyData.price) || 0) * (parseInt(supplyData.quantity) || 0);
                      if (totalValue > 50000) {
                        const criticalResult = await showCriticalValidation(
                          `This supply has a total value of LKR ${totalValue.toFixed(2)}. Please confirm all details are correct before saving.`,
                          'High-Value Item - Final Confirmation'
                        );
                        
                        if (!criticalResult.isConfirmed) {
                          return;
                        }
                      }

                      // Submit form if validation passes
                      let success = false;
                      if (editingSupply) {
                        success = await updateSupply(editingSupply._id, supplyData);
                      } else {
                        success = await addSupply(supplyData);
                      }
                      
                      if (success) {
                        setShowAddForm(false);
                        setEditingSupply(null);
                        setFormErrors({});
                        setTouchedFields({});
                        setFormCategory('tools');
                      }
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        {editingSupply ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingSupply ? 'Update Supply' : 'Add Supply'
                    )}
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
