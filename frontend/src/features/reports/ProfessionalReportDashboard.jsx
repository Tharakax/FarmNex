import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar, ScatterChart, Scatter
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart,
  Calendar, Download, FileText, FileSpreadsheet, Users, Truck, Activity,
  Zap, Target, Award, AlertTriangle, CheckCircle, ArrowUpRight,
  ArrowDownRight, RefreshCw, Filter, Search, MoreHorizontal,
  Leaf, Droplets, Sun, Wind, Eye, Settings, Clock, Share2,
  BarChart3, PieChart as PieChartIcon, TrendingUpIcon,
  Database, Calendar as CalendarIcon, MapPin, Star,
  Briefcase, Globe, Smartphone, Monitor, Tablet,
  MessageSquare, Bell, Heart, BookOpen, Layers, Grid
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faFilePdf, faChartLine, faDownload } from '@fortawesome/free-solid-svg-icons';
import { exportToPDF, exportToExcel, exportProductsToPDFWithImages, getProductsColumns, getInventoryColumns, getInventoryDetailedColumns } from '../../utils/exportUtils';
import { inventoryAPI } from '../../services/inventoryAPI';
import { productAPI } from '../../services/productAPI';
import { reportAPI } from '../../services/reportAPI';
import ExportSplitButton from './ExportSplitButton';
import OrderReport from './OrderReport';
import { formatLKR } from '../../utils/currencyUtils';

const ProfessionalReportDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportConfig, setReportConfig] = useState({
    dateRange: '30',
    category: 'all',
    includeOutOfStock: true,
    format: 'detailed',
    exportType: 'pdf'
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    inventoryTurnover: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const reportTypes = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Product Report',
      description: 'Complete analysis with all sections',
      icon: faFilePdf,
      color: 'bg-emerald-500',
      pages: '8-12 pages',
      sections: ['Executive Summary', 'Product Overview', 'Sales Performance', 'Inventory Analysis', 'Recommendations'],
      premium: false
    },
    {
      id: 'executive',
      name: 'Executive Summary Report',
      description: 'Key metrics and insights only',
      icon: faChartLine,
      color: 'bg-blue-500',
      pages: '3-4 pages',
      sections: ['Key Metrics', 'Performance Overview', 'Critical Alerts'],
      premium: false
    },
    {
      id: 'inventory',
      name: 'Inventory Analysis Report',
      description: 'Detailed stock and inventory insights',
      icon: Package,
      color: 'bg-purple-500',
      pages: '5-6 pages',
      sections: ['Stock Status', 'Category Breakdown', 'Reorder Recommendations'],
      premium: true
    },
  ];

  const quickStats = [
    {
      label: 'Total Products',
      value: dashboardMetrics.totalProducts,
      change: '+12%',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Inventory Value',
      value: formatLKR(dashboardMetrics.totalValue),
      change: `+${dashboardMetrics.revenueGrowth}%`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Active Products',
      value: dashboardMetrics.activeProducts,
      change: '+8%',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Low Stock Alerts',
      value: dashboardMetrics.lowStockItems,
      change: '-5%',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [reportConfig.dateRange]);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      setDataError(null);

      // Fetch overview data
      const overviewResponse = await reportAPI.getOverviewData(reportConfig.dateRange);
      let overviewData = null;
      if (overviewResponse.success) {
        overviewData = overviewResponse.data;
        setDashboardMetrics({
          totalProducts: overviewData.totalProducts || 0,
          activeProducts: overviewData.activeProducts || 0,
          totalValue: overviewData.inventoryValue || 0,
          lowStockItems: overviewData.lowStockItems || 0,
          outOfStockItems: overviewData.outOfStockItems || 0,
          revenueGrowth: overviewData.revenueChange || 0,
          ordersGrowth: overviewData.ordersChange || 0,
          inventoryTurnover: overviewData.inventoryTurnover || 4.2
        });
      }

      // Fetch inventory data for category breakdown
      const inventoryResponse = await reportAPI.getInventoryData(reportConfig.dateRange);
      let categoryData = [];
      if (inventoryResponse.success) {
        categoryData = inventoryResponse.data.categoryBreakdown || [];
        const colors = ['#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280', '#3B82F6'];
        
        setCategoryBreakdown(categoryData.map((cat, index) => ({
          name: cat.category || 'Unknown',
          value: cat.percentage || 0,
          amount: cat.value || 0,
          color: colors[index % colors.length]
        })));
      }

      // Generate recent reports list dynamically from fetched data
      const today = new Date();
      const reports = [];
      // Comprehensive analysis based on selected date range
      reports.push({
        id: 1,
        name: `${reportConfig.dateRange}-Day Analysis`,
        type: 'Comprehensive',
        date: today.toISOString().split('T')[0],
        size: `${(2.0 + Math.min(1.5, (categoryData.length || 4) * 0.2)).toFixed(1)} MB`,
        downloads: overviewData ? Math.max(5, Math.round((overviewData.totalProducts || 50) / 8)) : Math.floor(Math.random() * 20) + 10
      });

      // Inventory overview if we have inventory data
      if (categoryData && categoryData.length) {
        reports.push({
          id: 2,
          name: 'Inventory Overview',
          type: 'Inventory',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          size: `${(1.2 + Math.min(1.2, categoryData.length * 0.15)).toFixed(1)} MB`,
          downloads: overviewData ? Math.max(3, Math.round((overviewData.lowStockItems || 10) + (overviewData.outOfStockItems || 5))) : Math.floor(Math.random() * 12) + 5
        });
      }

      // Sales performance (approx based on overview revenue/orders if available)
      if (overviewData) {
        reports.push({
          id: 3,
          name: 'Sales Performance',
          type: 'Sales',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          size: `${(2.8 + Math.min(1.0, (overviewData.totalOrders || 30) / 200)).toFixed(1)} MB`,
          downloads: Math.max(8, Math.round((overviewData.totalOrders || 30) * 1.2))
        });
      }

      setRecentReports(reports);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError('Failed to load dashboard data. Please try again later.');
      
      // Set fallback default values on error
      setDashboardMetrics({
        totalProducts: 0,
        activeProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        inventoryTurnover: 0
      });
      setCategoryBreakdown([]);
      setRecentReports([]);
    } finally {
      setDataLoading(false);
    }
  };

const handleGenerateReport = async (reportType, format = 'pdf') => {
    setLoading(true);
    try {
      // Fetch products
      const result = await productAPI.getAllProducts();
      const products = result && result.success ? (result.data || []) : [];

      // Fallback sample data if none
      const sample = products.length > 0 ? [] : [
        { id: 'TOM-001', name: 'Organic Tomatoes', category: 'vegetables', description: 'Fresh, organic tomatoes', price: 350, stockQuantity: 120, unit: 'kg', status: 'In Stock', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=200&fit=crop' },
        { id: 'CAR-002', name: 'Organic Carrots', category: 'vegetables', description: 'Sweet, crunchy carrots', price: 280, stockQuantity: 80, unit: 'kg', status: 'In Stock', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop' },
        { id: 'SPN-003', name: 'Fresh Spinach', category: 'leafy-greens', description: 'Crisp spinach leaves', price: 200, stockQuantity: 45, unit: 'kg', status: 'Low Stock', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop' },
      ];

      const baseProducts = products.length > 0 ? products : sample;

      // Normalize to a simple export shape
      const imageExportData = baseProducts.map((p) => {
        const currentStock = p.stock?.current ?? p.stockQuantity ?? 0;
        const price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
        const minStock = p.stock?.minimum ?? 5;
        const maxStock = p.stock?.maximum ?? 100;
        const status = currentStock === 0 ? 'Out of Stock' : (currentStock <= minStock ? 'Low Stock' : 'In Stock');
        return {
          id: (p.id || p._id || (p.name || 'PRD').replace(/\s/g, '').slice(-6)),
          name: p.name || 'Unknown',
          category: (p.category || 'uncategorized'),
          description: p.description || `Fresh ${p.category || 'product'}`,
          price,
          stockQuantity: currentStock,
          unit: p.unit || 'kg',
          minStock,
          maxStock,
          supplierName: (p.supplier?.name || p.supplier || ''),
          location: p.location || '',
          createdAt: p.createdAt || '',
          updatedAt: p.updatedAt || '',
          status,
          image: p.images?.[0] || p.image || null,
          revenue: price * Math.max(currentStock / 2, 1),
          rating: 4.3,
          reviews: 12,
        };
      });

      const today = new Date().toISOString().split('T')[0];
      const filenameBase = `products_report_${reportConfig.dateRange}days_${today}`;

      // Build a summary from current data
      const total = imageExportData.length;
      const low = imageExportData.filter(p => p.status === 'Low Stock').length;
      const out = imageExportData.filter(p => p.status === 'Out of Stock').length;
      const inStock = total - low - out;
      const inventoryValue = imageExportData.reduce((s,p)=> s + (p.price * (p.stockQuantity || 0)), 0);
      const summary = {
        title: 'Report Summary',
        metrics: [
          { label: 'Total Products', value: total },
          { label: 'In Stock', value: inStock },
          { label: 'Low Stock', value: low },
          { label: 'Out of Stock', value: out },
          { label: 'Inventory Value', value: `LKR ${Math.round(inventoryValue).toLocaleString()}` },
          { label: 'Active Categories', value: new Set(imageExportData.map(p=>p.category)).size },
        ],
        sections: ['Executive Summary','Inventory Overview','Category Breakdown','Analytics Snapshots']
      };

      if (format === 'excel') {
        // Excel exports
        if (reportType === 'inventory') {
          const invCols = getInventoryDetailedColumns();

          // Fetch farm supplies to include in inventory analysis
          const suppliesRes = await inventoryAPI.getSupplies();
          const supplies = suppliesRes && suppliesRes.success ? (suppliesRes.data || []) : [];

          const productRows = imageExportData.map(p => ({
            productName: p.name,
            type: 'Product',
            category: p.category,
            quantity: p.stockQuantity,
            unit: p.unit,
            min: p.minStock,
            max: p.maxStock,
            pricePerUnit: `LKR ${p.price.toFixed(2)}`,
            totalValue: `LKR ${(p.price * p.stockQuantity).toFixed(2)}`,
            status: p.status,
            supplier: p.supplierName || '',
            location: p.location || '',
            purchaseDate: '',
            expiryDate: '',
            lastUpdated: p.updatedAt || p.createdAt || ''
          }));

          const supplyRows = supplies.map(s => {
            const qty = s.quantity || 0;
            const unitPrice = typeof s.unitPrice === 'number' ? s.unitPrice : (typeof s.price === 'number' ? s.price : parseFloat(s.price) || 0);
            const minQty = s.minQuantity || 5;
            const status = s.status === 'maintenance' ? 'Maintenance Required'
              : (s.expiryDate && new Date(s.expiryDate) < new Date() ? 'Expired'
              : (qty === 0 ? 'Out of Stock' : (qty <= minQty ? 'Low Stock' : 'In Stock')));
            return {
              productName: s.name,
              type: 'Supply',
              category: s.category,
              quantity: qty,
              unit: s.unit || '',
              min: minQty,
              max: s.maxQuantity || '',
              pricePerUnit: `LKR ${unitPrice.toFixed(2)}`,
              totalValue: `LKR ${(qty * unitPrice).toFixed(2)}`,
              status,
              supplier: s.supplier || s.supplier?.name || '',
              location: s.location || '',
              purchaseDate: s.purchaseDate || '',
              expiryDate: s.expiryDate || '',
              lastUpdated: s.updatedAt || s.createdAt || ''
            };
          });

          const rows = [...productRows, ...supplyRows];

          await exportToExcel(rows, 'Inventory Analysis Report', invCols, filenameBase);
          showNotification('Inventory Excel generated', 'success');
        } else {
          // For comprehensive, executive, sales -> use products columns
          const cols = getProductsColumns();
          const rows = imageExportData.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description,
            price: `LKR ${p.price.toFixed(2)}`,
            stockQuantity: p.stockQuantity,
            unit: p.unit,
            status: p.status,
            createdDate: today
          }));
          const titleMap = {
            comprehensive: 'Comprehensive Product Report',
            executive: 'Executive Summary Report',
            sales: 'Sales Performance Report',
          };
          await exportToExcel(rows, titleMap[reportType] || 'Products Report', cols, filenameBase);
          showNotification('Excel report generated', 'success');
        }
      } else if (reportType === 'comprehensive') {
        // Rich report with embedded images
        await exportProductsToPDFWithImages(
          imageExportData,
          'Comprehensive Product Report',
          [],
          filenameBase,
          'products',
          { charts: { bar: categoryBreakdown, pie: categoryBreakdown }, summary }
        );
        showNotification('Comprehensive report generated', 'success');
      } else if (reportType === 'executive') {
        // Compact executive table (top 30)
        const cols = getProductsColumns();
        const tableRows = imageExportData.slice(0, 30).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          price: `LKR ${p.price.toFixed(2)}`,
          stockQuantity: p.stockQuantity,
          unit: p.unit,
          status: p.status,
          createdDate: today
        }));
        await exportToPDF(tableRows, 'Executive Summary Report', cols, filenameBase, 'default', { charts: { bar: categoryBreakdown, pie: categoryBreakdown }, summary });
        showNotification('Executive summary generated', 'success');
      } else if (reportType === 'inventory') {
        // Inventory-focused table including farm supplies
        const invCols = getInventoryDetailedColumns();

        // Fetch farm supplies to include
        const suppliesRes = await inventoryAPI.getSupplies();
        const supplies = suppliesRes && suppliesRes.success ? (suppliesRes.data || []) : [];

        const productRows = imageExportData.map(p => ({
          productName: p.name,
          type: 'Product',
          category: p.category,
          quantity: p.stockQuantity,
          unit: p.unit,
          min: p.minStock,
          max: p.maxStock,
          pricePerUnit: `LKR ${p.price.toFixed(2)}`,
          totalValue: `LKR ${(p.price * p.stockQuantity).toFixed(2)}`,
          status: p.status,
          supplier: p.supplierName || '',
          location: p.location || '',
          purchaseDate: '',
          expiryDate: '',
          lastUpdated: p.updatedAt || p.createdAt || ''
        }));

        const supplyRows = supplies.map(s => {
          const qty = s.quantity || 0;
          const unitPrice = typeof s.unitPrice === 'number' ? s.unitPrice : (typeof s.price === 'number' ? s.price : parseFloat(s.price) || 0);
          const minQty = s.minQuantity || 5;
          const status = s.status === 'maintenance' ? 'Maintenance Required'
            : (s.expiryDate && new Date(s.expiryDate) < new Date() ? 'Expired'
            : (qty === 0 ? 'Out of Stock' : (qty <= minQty ? 'Low Stock' : 'In Stock')));
          return {
            productName: s.name,
            type: 'Supply',
            category: s.category,
            quantity: qty,
            unit: s.unit || '',
            min: minQty,
            max: s.maxQuantity || '',
            pricePerUnit: `LKR ${unitPrice.toFixed(2)}`,
            totalValue: `LKR ${(qty * unitPrice).toFixed(2)}`,
            status,
            supplier: s.supplier || s.supplier?.name || '',
            location: s.location || '',
            purchaseDate: s.purchaseDate || '',
            expiryDate: s.expiryDate || '',
            lastUpdated: s.updatedAt || s.createdAt || ''
          };
        });

        const rows = [...productRows, ...supplyRows];

        // Build an inventory-specific summary including supplies
        const totalItems = rows.length;
        const lowItems = rows.filter(r => r.status === 'Low Stock').length;
        const outItems = rows.filter(r => r.status === 'Out of Stock').length;
        const inItems = totalItems - lowItems - outItems;
        const totalValueAll = rows.reduce((s, r) => s + (Number((r.totalValue || '').toString().replace(/[^\d.]/g, '')) || 0), 0);
        const inventorySummary = {
          title: 'Inventory Summary',
          metrics: [
            { label: 'Total Items', value: totalItems },
            { label: 'In Stock', value: inItems },
            { label: 'Low Stock', value: lowItems },
            { label: 'Out of Stock', value: outItems },
            { label: 'Total Value', value: `LKR ${Math.round(totalValueAll).toLocaleString()}` },
          ],
          sections: ['Summary','Inventory Table','Analytics Snapshots']
        };

        await exportToPDF(rows, 'Inventory Analysis Report', invCols, filenameBase, 'inventory', { charts: { bar: categoryBreakdown, pie: categoryBreakdown }, summary: inventorySummary });
        showNotification('Inventory analysis generated', 'success');
      } else if (reportType === 'sales') {
        // Sales-style overview using the same image data but title adjusted
        await exportProductsToPDFWithImages(
          imageExportData,
          'Sales Performance Report',
          [],
          filenameBase,
          'sales',
          { charts: { bar: categoryBreakdown, pie: categoryBreakdown }, summary }
        );
        showNotification('Sales performance report generated', 'success');
      } else {
        // Default fallback
        await exportProductsToPDFWithImages(imageExportData, 'Products Report', [], filenameBase, 'products');
        showNotification('Report generated', 'success');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Failed to generate report. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    // Implementation for toast notifications
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const renderReportConfiguration = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Settings className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Report Configuration</h2>
            <p className="text-gray-600 mt-1">Customize your report parameters</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Time Period</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 3 months' },
                { value: '365', label: 'Last year' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReportConfig(prev => ({ ...prev, dateRange: option.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    reportConfig.dateRange === option.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Product Category</label>
            <select
              value={reportConfig.category}
              onChange={(e) => setReportConfig(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy Products</option>
              <option value="herbs">Herbs & Spices</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Report Options</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeOutOfStock}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, includeOutOfStock: e.target.checked }))}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Include out-of-stock products</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Estimated pages:</span>
              <span className="text-sm font-bold text-emerald-600">8-12 pages</span>
            </div>
            
            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Products included:</span>
              <span className="text-sm font-bold text-emerald-600">
                {reportConfig.includeOutOfStock ? dashboardMetrics.totalProducts : dashboardMetrics.activeProducts}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Time range:</span>
              <span className="text-sm font-bold text-emerald-600">
                {reportConfig.dateRange === '7' ? 'Last 7 days' :
                 reportConfig.dateRange === '30' ? 'Last 30 days' :
                 reportConfig.dateRange === '90' ? 'Last 3 months' : 'Last year'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Sections Included:</h4>
            <div className="space-y-2">
              {[
                'Executive Summary',
                'Product Overview',
                'Inventory Analysis', 
                'Sales Performance',
                'Category Breakdown',
                'Recommendations'
              ].map((section, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-600">{section}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportTypes = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {reportTypes.map((report) => {
        const IconComponent = report.icon;
        return (
          <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`${report.color} p-3 rounded-xl shadow-lg`}>
                  {typeof IconComponent === 'function' ? (
                    <IconComponent className="h-8 w-8 text-white" />
                  ) : (
                    <FontAwesomeIcon icon={IconComponent} className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{report.name}</h3>
                  <p className="text-gray-600 mt-1">{report.description}</p>
                </div>
              </div>
              {report.premium && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  PREMIUM
                </span>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Estimated: {report.pages}</span>
                <span>{report.sections.length} sections</span>
              </div>
              <div className="space-y-2">
                {report.sections.map((section, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{section}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inline analytics preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Mini Bar Chart */}
              <div className="h-44 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown.map(c => ({ name: c.name, value: c.value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6b7280" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'rgba(16,185,129,0.08)' }} formatter={(v) => [v + '%', 'Share']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Pie Chart */}
              <div className="h-44 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(v, n) => [v + '%', n]} />
                    <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 11 }} />
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-mini-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-end">
              <ExportSplitButton
                loading={loading}
                onGenerate={(format) => handleGenerateReport(report.id, format)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDashboardOverview = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    if (dataError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{dataError}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <FontAwesomeIcon icon={faLeaf} className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">FarmNex Reports</h1>
                <p className="text-emerald-100 text-lg mt-2">Professional Agricultural Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-3xl font-bold">{dashboardMetrics.totalProducts.toLocaleString()}</div>
                <div className="text-emerald-200">Total Products</div>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={dataLoading}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`h-5 w-5 text-white ${dataLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm font-medium text-green-600">{stat.change}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Distribution</h2>
            <p className="text-gray-600 mt-1">Value breakdown by product categories</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <PieChartIcon className="h-5 w-5" />
            <span className="text-sm">Category Analysis</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (${formatLKR(props.payload.amount)})`,
                    'Share'
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
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <div>
                    <div className="font-semibold text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600">{category.value}% of inventory</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatLKR(category.amount)}</div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
            <p className="text-gray-600 mt-1">Your report generation history</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all">
            <Eye className="h-4 w-4" />
            <span className="font-medium">View All</span>
          </button>
        </div>

        <div className="space-y-4">
          {recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faFilePdf} className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">{report.type} Report</span>
                    <span className="text-sm text-gray-600">{report.date}</span>
                    <span className="text-sm text-gray-600">{report.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{report.downloads} downloads</div>
                  <div className="text-xs text-gray-600">Success rate: 100%</div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  };

  const renderReportHistory = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report History</h2>
          <p className="text-gray-600 mt-1">All your generated reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Report Name</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Generated</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Size</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">Downloads</th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map((report) => (
              <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faFilePdf} className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{report.name}</div>
                      <div className="text-sm text-gray-600">Professional Report</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {report.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-900">{report.date}</td>
                <td className="py-4 px-6 text-gray-900">{report.size}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{report.downloads}</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'orders', name: 'Order Reports', icon: ShoppingCart },
              { id: 'generate', name: 'Generate Reports', icon: FileText },
              { id: 'configure', name: 'Configuration', icon: Settings },
              { id: 'history', name: 'History', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && renderDashboardOverview()}
          {activeTab === 'orders' && <OrderReport />}
          {activeTab === 'generate' && renderReportTypes()}
          {activeTab === 'configure' && renderReportConfiguration()}
          {activeTab === 'history' && renderReportHistory()}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalReportDashboard;