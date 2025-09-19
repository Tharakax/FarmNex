import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Star,
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  Target,
  Filter,
  Download,
  Settings,
  Truck,
  Award,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { reportAPI } from '../../services/reportAPI';
import { productAPI } from '../../services/productAPI';
import toast from 'react-hot-toast';

const ProductManagementReport = ({ dateRange = '30' }) => {
  const [reportData, setReportData] = useState({
    performanceMetrics: {
      totalProducts: 0,
      activeProducts: 0,
      totalRevenue: 0,
      totalUnitsSold: 0,
      averageOrderValue: 0,
      averageRating: 0,
      totalReviews: 0,
      conversionRate: 0
    },
    
    bestSellers: [],
    worstPerformers: [],
    mostProfitable: [],
    fastestMoving: [],
    slowestMoving: [],
    
    inventoryStatus: {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      overStock: 0,
      totalValue: 0
    },
    lowStockItems: [],
    outOfStockItems: [],
    overStockItems: [],
    
    categoryPerformance: [],
    categoryTrends: [],
    
    topRatedProducts: [],
    lowRatedProducts: [],
    customerFeedback: [],
    
    profitabilityAnalysis: [],
    revenueByCategory: [],
    costAnalysis: [],
    
    stockTurnover: [],
    seasonalTrends: [],
    demandForecasting: [],
    
    alerts: [],
    recommendations: [],
    actionItems: []
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dataSource, setDataSource] = useState('loading'); // 'real', 'sample', 'loading'

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  // Generate report data from real products
  const generateRealReportData = async (products) => {
    console.log('🔄 Processing real products for report:', products.length);
    
    // Transform real products into report format
    const transformedProducts = products.map((product, index) => {
      // Calculate some metrics from real data
      const currentStock = product.stock?.current || product.stockQuantity || 0;
      const minimumStock = product.stock?.minimum || 5;
      const unitsSold = Math.floor(Math.random() * 200) + 50; // Mock sales data since we don't have real sales data yet
      const basePrice = parseFloat(product.price) || 0;
      const revenue = unitsSold * basePrice;
      
      // Determine stock level - transfer overstock to in-stock
      let stockLevel = 'good';
      if (currentStock === 0) stockLevel = 'out';
      else if (currentStock <= minimumStock) stockLevel = 'low';
      // Remove overstock category - all high stock items are now 'good' (in-stock)
      // else if (currentStock > minimumStock * 3) stockLevel = 'overstock';
      
      // Generate realistic ratings
      const rating = 3.5 + (Math.random() * 1.5);
      const reviews = Math.floor(Math.random() * 100) + 10;
      
      return {
        name: product.name,
        category: product.category,
        description: product.description || `Fresh ${product.category} from our farm`,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        price: basePrice,
        stockLevel: stockLevel,
        unitsSold: unitsSold,
        revenue: revenue,
        profitMargin: Math.random() * 40 + 10, // Mock profit margin 10-50%
        rating: parseFloat(rating.toFixed(1)),
        reviews: reviews,
        growth: (Math.random() - 0.5) * 40, // Growth between -20% to +20%
        unit: product.unit || 'kg',
        currentStock: currentStock,
        minimumStock: minimumStock
      };
    });
    
    // Sort products by revenue to determine best/worst performers
    const sortedByRevenue = [...transformedProducts].sort((a, b) => b.revenue - a.revenue);
    
    // Get top 5 and bottom 3 performers
    const bestSellers = sortedByRevenue.slice(0, 5);
    const worstPerformers = sortedByRevenue.slice(-3);
    
    // Calculate performance metrics
    const totalRevenue = transformedProducts.reduce((sum, product) => sum + product.revenue, 0);
    const totalUnitsSold = transformedProducts.reduce((sum, product) => sum + product.unitsSold, 0);
    const averageOrderValue = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0;
    const averageRating = transformedProducts.reduce((sum, product) => sum + product.rating, 0) / transformedProducts.length;
    const totalReviews = transformedProducts.reduce((sum, product) => sum + product.reviews, 0);
    
    // Calculate inventory status - overstock items are now counted as in-stock
    const inStock = transformedProducts.filter(p => p.stockLevel === 'good' || p.stockLevel === 'overstock').length;
    const lowStock = transformedProducts.filter(p => p.stockLevel === 'low').length;
    const outOfStock = transformedProducts.filter(p => p.stockLevel === 'out').length;
    const overStock = 0; // Remove overstock category completely
    const totalValue = transformedProducts.reduce((sum, product) => sum + (product.currentStock * product.price), 0);
    
    console.log('✅ Generated report data:', {
      totalProducts: transformedProducts.length,
      bestSellers: bestSellers.length,
      worstPerformers: worstPerformers.length,
      totalRevenue,
      averageRating
    });
    
    return {
      performanceMetrics: {
        totalProducts: transformedProducts.length,
        activeProducts: transformedProducts.filter(p => p.stockLevel !== 'out').length,
        totalRevenue: totalRevenue,
        totalUnitsSold: totalUnitsSold,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
        conversionRate: 3.2 // Mock conversion rate
      },
      
      bestSellers: bestSellers,
      worstPerformers: worstPerformers,
      
      inventoryStatus: {
        inStock: inStock,
        lowStock: lowStock,
        outOfStock: outOfStock,
        overStock: overStock,
        totalValue: Math.round(totalValue)
      },
      
      lowStockItems: transformedProducts
        .filter(p => p.stockLevel === 'low')
        .map(p => ({
          name: p.name,
          current: p.currentStock,
          minimum: p.minimumStock,
          category: p.category,
          value: Math.round(p.currentStock * p.price),
          reorderPoint: p.currentStock <= p.minimumStock / 2 ? 'immediate' : 'urgent'
        })),
      
      outOfStockItems: transformedProducts
        .filter(p => p.stockLevel === 'out')
        .map(p => ({
          name: p.name,
          category: p.category,
          lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysSinceStock: Math.floor(Math.random() * 30) + 1,
          lostRevenue: Math.floor(Math.random() * 1000) + 100
        })),
      
      // Group by category for category performance
      categoryPerformance: Object.values(
        transformedProducts.reduce((acc, product) => {
          const category = product.category || 'uncategorized';
          if (!acc[category]) {
            acc[category] = {
              category: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
              totalRevenue: 0,
              unitsSold: 0,
              ratings: [],
              count: 0
            };
          }
          acc[category].totalRevenue += product.revenue;
          acc[category].unitsSold += product.unitsSold;
          acc[category].ratings.push(product.rating);
          acc[category].count++;
          return acc;
        }, {})
      ).map(cat => ({
        ...cat,
        averageRating: parseFloat((cat.ratings.reduce((a, b) => a + b, 0) / cat.ratings.length).toFixed(1)),
        growthRate: (Math.random() - 0.3) * 40, // Mock growth rate
        profitability: Math.random() * 30 + 15, // Mock profitability
        marketShare: (cat.totalRevenue / totalRevenue * 100)
      })),
      
      topRatedProducts: [...transformedProducts]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          rating: p.rating,
          reviews: p.reviews,
          category: p.category
        })),
      
      profitabilityAnalysis: bestSellers.map(p => ({
        name: p.name,
        profitMargin: p.profitMargin,
        grossProfit: Math.round(p.revenue * p.profitMargin / 100),
        netProfit: Math.round(p.revenue * p.profitMargin / 100 * 0.8)
      })),
      
      alerts: [
        ...(outOfStock > 0 ? [{
          type: 'critical',
          message: `${outOfStock} products are out of stock`,
          count: outOfStock,
          priority: 'high',
          action: 'immediate_restock'
        }] : []),
        ...(lowStock > 0 ? [{
          type: 'warning',
          message: `${lowStock} products have low stock levels`,
          count: lowStock,
          priority: 'medium',
          action: 'schedule_restock'
        }] : []),
        // Remove overstock alerts - these items are now counted as in-stock
        // ...(overStock > 0 ? [{
        //   type: 'info',
        //   message: `${overStock} products are overstocked`,
        //   count: overStock,
        //   priority: 'low',
        //   action: 'promotion_needed'
        // }] : [])
      ],
      
      recommendations: [
        {
          title: 'Optimize High Performers',
          description: `Focus marketing on top ${bestSellers.length} performing products`,
          priority: 'high',
          impact: 'revenue_increase'
        },
        {
          title: 'Address Stock Issues',
          description: `${lowStock + outOfStock} products need inventory attention`,
          priority: outOfStock > 0 ? 'high' : 'medium',
          impact: 'cost_reduction'
        },
        {
          title: 'Improve Low Performers',
          description: 'Review pricing and marketing for underperforming products',
          priority: 'medium',
          impact: 'profit_increase'
        }
      ]
    };
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Try to get real products from the API
      const productsResponse = await productAPI.getAllProducts();
      
      if (productsResponse.success && productsResponse.data && productsResponse.data.length > 0) {
        console.log('✅ Loaded real products:', productsResponse.data.length);
        const realReportData = await generateRealReportData(productsResponse.data);
        setReportData(realReportData);
        setDataSource('real');
      } else {
        console.log('⚠️ No products found, using sample data');
        setReportData(generateMockData());
        setDataSource('sample');
        toast.info('No products found in database, showing sample data');
      }
    } catch (error) {
      console.error('Error loading product management report:', error);
      console.log('🔄 Falling back to sample data');
      setReportData(generateMockData());
      setDataSource('sample');
      toast.error('Failed to load real products - showing sample data');
    }
    setLoading(false);
  };

  const generateMockData = () => ({
    performanceMetrics: {
      totalProducts: 156,
      activeProducts: 142,
      totalRevenue: 125420,
      totalUnitsSold: 2847,
      averageOrderValue: 44.07,
      averageRating: 4.4,
      totalReviews: 892,
      conversionRate: 3.2
    },
    
    bestSellers: [
      { name: 'Organic Tomatoes', revenue: 15420, unitsSold: 245, profitMargin: 35.2, rating: 4.8, reviews: 89, growth: 22.5, category: 'vegetables', stockLevel: 'good', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=200&fit=crop', description: 'Fresh, organic tomatoes packed with nutrients and flavor' },
      { name: 'Fresh Spinach', revenue: 12890, unitsSold: 189, profitMargin: 42.1, rating: 4.6, reviews: 67, growth: 18.7, category: 'leafy-greens', stockLevel: 'low', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop', description: 'Crisp, fresh spinach leaves perfect for salads and cooking' },
      { name: 'Bell Peppers', revenue: 9650, unitsSold: 156, profitMargin: 28.9, rating: 4.4, reviews: 45, growth: 15.3, category: 'vegetables', stockLevel: 'good', image: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=300&h=200&fit=crop', description: 'Colorful bell peppers with sweet taste and crunchy texture' },
      { name: 'Organic Carrots', revenue: 8200, unitsSold: 134, profitMargin: 38.5, rating: 4.7, reviews: 56, growth: 12.8, category: 'root-vegetables', stockLevel: 'good', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop', description: 'Sweet, crunchy organic carrots rich in beta-carotene' },
      { name: 'Mixed Salad Greens', revenue: 7850, unitsSold: 112, profitMargin: 45.2, rating: 4.5, reviews: 38, growth: 20.1, category: 'leafy-greens', stockLevel: 'critical', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop', description: 'Premium mixed greens perfect for healthy salads' }
    ],
    
    worstPerformers: [
      { name: 'Exotic Mushrooms', revenue: 450, unitsSold: 8, profitMargin: 12.1, rating: 3.2, reviews: 5, growth: -15.2, category: 'vegetables', stockLevel: 'overstock', image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=300&h=200&fit=crop', description: 'Specialty exotic mushrooms with unique flavors' },
      { name: 'Dragon Fruit', revenue: 320, unitsSold: 6, profitMargin: 8.5, rating: 3.8, reviews: 3, growth: -8.7, category: 'fruits', stockLevel: 'overstock', image: 'https://images.unsplash.com/photo-1565281845370-1381c1b62181?w=300&h=200&fit=crop', description: 'Tropical dragon fruit with mild sweet taste' },
      { name: 'Purple Cabbage', revenue: 280, unitsSold: 12, profitMargin: 15.3, rating: 3.5, reviews: 8, growth: -5.2, category: 'vegetables', stockLevel: 'good', image: 'https://images.unsplash.com/photo-1594736797933-d0e3c6b6db42?w=300&h=200&fit=crop', description: 'Nutrient-dense purple cabbage with vibrant color' }
    ],
    
    inventoryStatus: {
      inStock: 107, // 89 + 18 (transferred from overstock)
      lowStock: 23,
      outOfStock: 12,
      overStock: 0, // Removed overstock category
      totalValue: 67850
    },
    
    lowStockItems: [
      { name: 'Fresh Spinach', current: 8, minimum: 15, category: 'leafy-greens', value: 240, reorderPoint: 'immediate' },
      { name: 'Bell Peppers', current: 5, minimum: 10, category: 'vegetables', value: 125, reorderPoint: 'urgent' },
      { name: 'Strawberries', current: 3, minimum: 8, category: 'berries', value: 45, reorderPoint: 'immediate' }
    ],
    
    outOfStockItems: [
      { name: 'Organic Lettuce', category: 'leafy-greens', lastRestocked: '2025-08-20', daysSinceStock: 14, lostRevenue: 890 },
      { name: 'Cherry Tomatoes', category: 'vegetables', lastRestocked: '2025-08-18', daysSinceStock: 16, lostRevenue: 650 },
      { name: 'Blueberries', category: 'berries', lastRestocked: '2025-08-19', daysSinceStock: 15, lostRevenue: 420 }
    ],
    
    categoryPerformance: [
      { category: 'Vegetables', totalRevenue: 45200, unitsSold: 567, averageRating: 4.5, growthRate: 18.5, profitability: 32.1, marketShare: 35.2 },
      { category: 'Leafy Greens', totalRevenue: 28900, unitsSold: 389, averageRating: 4.6, growthRate: 25.2, profitability: 41.8, marketShare: 22.8 },
      { category: 'Fruits', totalRevenue: 22100, unitsSold: 234, averageRating: 4.3, growthRate: 12.8, profitability: 28.9, marketShare: 17.6 },
      { category: 'Root Vegetables', totalRevenue: 15600, unitsSold: 178, averageRating: 4.4, growthRate: 15.7, profitability: 35.4, marketShare: 12.4 },
      { category: 'Berries', totalRevenue: 8900, unitsSold: 145, averageRating: 4.2, growthRate: 8.3, profitability: 22.1, marketShare: 7.1 },
      { category: 'Dairy Products', totalRevenue: 4720, unitsSold: 89, averageRating: 4.1, growthRate: 5.2, profitability: 18.7, marketShare: 3.8 }
    ],
    
    topRatedProducts: [
      { name: 'Organic Tomatoes', rating: 4.8, reviews: 89, category: 'vegetables' },
      { name: 'Organic Carrots', rating: 4.7, reviews: 56, category: 'root-vegetables' },
      { name: 'Fresh Spinach', rating: 4.6, reviews: 67, category: 'leafy-greens' },
      { name: 'Mixed Salad Greens', rating: 4.5, reviews: 38, category: 'leafy-greens' },
      { name: 'Bell Peppers', rating: 4.4, reviews: 45, category: 'vegetables' }
    ],
    
    profitabilityAnalysis: [
      { name: 'Mixed Salad Greens', profitMargin: 45.2, grossProfit: 3548, netProfit: 2835 },
      { name: 'Fresh Spinach', profitMargin: 42.1, grossProfit: 5427, netProfit: 4341 },
      { name: 'Organic Carrots', profitMargin: 38.5, grossProfit: 3157, netProfit: 2526 },
      { name: 'Organic Tomatoes', profitMargin: 35.2, grossProfit: 5428, netProfit: 4342 },
      { name: 'Bell Peppers', profitMargin: 28.9, grossProfit: 2789, netProfit: 2231 }
    ],
    
    alerts: [
      { type: 'critical', message: '12 products are out of stock', count: 12, priority: 'high', action: 'immediate_restock' },
      { type: 'warning', message: '23 products have low stock levels', count: 23, priority: 'medium', action: 'schedule_restock' },
      // Removed overstock alert - these items are now counted as in-stock
      // { type: 'info', message: '18 products are overstocked', count: 18, priority: 'low', action: 'promotion_needed' },
      { type: 'success', message: '5 products exceeded sales targets', count: 5, priority: 'info', action: 'celebrate' }
    ],
    
    recommendations: [
      { title: 'Focus Marketing on Leafy Greens', description: 'Highest profit margin category with growing demand', priority: 'high', impact: 'revenue_increase' },
      { title: 'Optimize Exotic Product Pricing', description: 'Low-performing exotic items need price adjustment or bundling', priority: 'medium', impact: 'cost_reduction' },
      { title: 'Implement Dynamic Pricing', description: 'Seasonal pricing for better profit optimization', priority: 'medium', impact: 'profit_increase' },
      { title: 'Expand Organic Product Line', description: 'High customer satisfaction and premium pricing potential', priority: 'high', impact: 'market_expansion' }
    ]
  });

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'categories', label: 'Categories', icon: PieChart },
    { id: 'quality', label: 'Quality', icon: Star },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'insights', label: 'Insights', icon: Target }
  ];

  const handleExport = async (format) => {
    // Show loading toast
    const loadingToast = toast.loading(`Generating ${format.toUpperCase()} report...`);
    
    try {
      // Validate report data
      if (!reportData || !reportData.bestSellers || !reportData.worstPerformers) {
        throw new Error('No report data available');
      }
      
      const allProducts = [...reportData.bestSellers, ...reportData.worstPerformers];
      
      if (allProducts.length === 0) {
        throw new Error('No products to export');
      }
      const exportData = allProducts.map(product => {
        const unitsSold = product.unitsSold || 1; // Avoid division by zero
        const revenue = product.revenue || 0;
        const pricePerUnit = unitsSold > 0 ? (revenue / unitsSold) : 0;
        
        const description = product.description || getProductDescription(product.category);
        
        return {
          id: (product.name || 'Unknown').replace(/\s/g, '').slice(-6) || 'N/A',
          name: (product.name || 'Unknown Product').substring(0, 255), // Limit name length
          category: (product.category || 'uncategorized').substring(0, 50),
          description: description.length > 1000 ? description.substring(0, 997) + '...' : description, // Limit description
          price: `LKR ${pricePerUnit.toFixed(2)}`,
          stockQuantity: unitsSold,
          unit: (product.unit || (product.category === 'dairy-products' ? 'pack' : 'kg')).substring(0, 20),
          status: getStatusText(product.stockLevel),
          image: product.image || null, // Keep original image URL for PDF embedding
          imageUrl: (product.image || 'No image available').substring(0, 500), // Limit URL length
          revenue: revenue, // Keep as number for PDF
          rating: product.rating || 0, // Keep as number for PDF
          reviews: product.reviews || 0
        };
      });

      const fileName = `product_management_report_${dateRange}days_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'pdf') {
        // Use simple PDF export with optimized columns for Status visibility
        const columns = [
          { header: 'ID', key: 'id' },
          { header: 'Product Name', key: 'name' },
          { header: 'Category', key: 'category' },
          { header: 'Price', key: 'price' },
          { header: 'Stock Qty', key: 'stockQuantity' },
          { header: 'Unit', key: 'unit' },
          { header: 'Stock Status', key: 'status' }, // Changed header to be more descriptive
          { header: 'Revenue', key: 'revenue' },
          { header: 'Rating', key: 'rating' }
        ];
        
        // Format data for simple PDF export
        const pdfData = exportData.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          stockQuantity: product.stockQuantity,
          unit: product.unit,
          status: product.status,
          revenue: `LKR ${(product.revenue || 0).toLocaleString()}`,
          rating: `${(product.rating || 0).toFixed(1)}/5.0 (${product.reviews || 0} reviews)`
        }));
        
        exportToPDF(
          pdfData,
          'Product Management Report',
          columns,
          fileName,
          'products'
        );
      } else {
        // For Excel, use the traditional export with columns
        console.log('📈 Starting Excel export...');
        console.log('📈 Export data sample:', exportData[0]);
        
        const columns = [
          { header: 'ID', key: 'id' },
          { header: 'Product Name', key: 'name' },
          { header: 'Category', key: 'category' },
          { header: 'Description', key: 'description' },
          { header: 'Price', key: 'price' },
          { header: 'Revenue', key: 'revenue' },
          { header: 'Stock Quantity', key: 'stockQuantity' },
          { header: 'Unit', key: 'unit' },
          { header: 'Status', key: 'status' },
          { header: 'Rating', key: 'rating' },
          { header: 'Reviews', key: 'reviews' },
          { header: 'Image URL', key: 'imageUrl' }
        ];
        
        const excelData = exportData.map(item => {
          try {
            return {
              ...item,
              revenue: `LKR ${(item.revenue || 0).toLocaleString()}`,
              rating: `${(item.rating || 0)}/5.0 (${item.reviews || 0} reviews)`
            };
          } catch (err) {
            console.error('Error processing item for Excel:', item, err);
            return item; // Return original item if formatting fails
          }
        });
        
        console.log('📈 Excel data ready:', excelData.length, 'rows');
        console.log('📈 Excel data sample:', excelData[0]);
        
        await exportToExcel(excelData, 'Product Management Report', columns, fileName);
        console.log('✅ Excel export completed successfully');
      }
      
      toast.dismiss(loadingToast);
      toast.success(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to export report as ${format.toUpperCase()}: ${error.message}`);
    }
  };

  const getProductDescription = (category) => {
    const descriptions = {
      'vegetables': 'Fresh, ripe vegetables - perfect for salads, cooking, and daily nutrition',
      'fruits': 'Premium quality fruits - sweet, nutritious, and perfectly ripened',
      'leafy-greens': 'Fresh leafy greens - rich in vitamins and perfect for healthy meals',
      'root-vegetables': 'Farm-fresh root vegetables - essential for cooking and nutrition',
      'dairy-products': 'Pure, fresh dairy products - rich in calcium and essential nutrients',
      'animal-products': 'Fresh farm products - rich in protein and essential nutrients'
    };
    return descriptions[category] || 'High-quality farm product';
  };

  const getStatusText = (stockLevel) => {
    const statusMap = {
      'good': 'Available',
      'low': 'Low Stock', 
      'critical': 'Critical',
      'overstock': 'Available', // Map overstock to available
      'out': 'Out of Stock'
    };
    return statusMap[stockLevel] || 'Unknown';
  };

  const MetricCard = ({ title, value, icon: Icon, color, change, description }) => (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${color || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center text-sm mt-2 ${
              change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : 
               change.startsWith('-') ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
              <span>{change}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-full bg-gray-100">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={reportData.performanceMetrics.totalProducts}
          icon={Package}
          description={`${reportData.performanceMetrics.activeProducts} active`}
        />
        <MetricCard
          title="Total Revenue"
          value={`LKR ${reportData.performanceMetrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+12.5%"
        />
        <MetricCard
          title="Units Sold"
          value={reportData.performanceMetrics.totalUnitsSold.toLocaleString()}
          icon={ShoppingCart}
          change="+8.3%"
        />
        <MetricCard
          title="Average Rating"
          value={reportData.performanceMetrics.averageRating}
          icon={Star}
          description={`${reportData.performanceMetrics.totalReviews} reviews`}
        />
      </div>

      {/* Inventory Status Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{reportData.inventoryStatus.inStock}</p>
            <p className="text-sm text-green-600">In Stock</p>
            <p className="text-xs text-green-500 mt-1">Including high-stock items</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-700">{reportData.inventoryStatus.lowStock}</p>
            <p className="text-sm text-yellow-600">Low Stock</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-700">{reportData.inventoryStatus.outOfStock}</p>
            <p className="text-sm text-red-600">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {reportData.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center p-3 rounded-lg border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className={`p-1 rounded-full mr-3 ${
                  alert.type === 'critical' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'info' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-600">Priority: {alert.priority}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            Key Recommendations
          </h3>
          <div className="space-y-3">
            {reportData.recommendations.slice(0, 4).map((rec, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">{rec.title}</h4>
                <p className="text-xs text-blue-700 mt-1">{rec.description}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Comprehensive Product Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-t-xl border-b-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">📊 Complete Product Inventory Report</h3>
              <p className="text-gray-600">Comprehensive overview of all products with detailed information and status</p>
              <div className="flex items-center mt-3 space-x-4">
                <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  Total Records: {reportData.bestSellers.length + reportData.worstPerformers.length}
                </span>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  Generated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FileText className="h-4 w-4 mr-2" />
                📄 Export Compact PDF Table
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                📈 Export Excel Spreadsheet
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Responsive Table Container */}
        <div className="overflow-hidden shadow-lg border-2 border-green-200 rounded-xl bg-white">
          {/* Mobile Card View - Hidden on larger screens */}
          <div className="block lg:hidden">
            <div className="p-4 space-y-4">
              {reportData.bestSellers.concat(reportData.worstPerformers).map((product, index) => {
                const stockStatus = product.stockLevel || 'unknown';
                const statusColor = 
                  (stockStatus === 'good' || stockStatus === 'overstock') ? 'bg-green-100 text-green-800 border-green-300' :
                  stockStatus === 'low' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  stockStatus === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                  'bg-gray-100 text-gray-800 border-gray-300';
                
                const defaultImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
                
                return (
                  <div key={`mobile-${product.name}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-300 shadow-sm flex-shrink-0">
                        <img 
                          src={product.image || defaultImage}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.target.src = defaultImage; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">ID: ...{(product.name || 'Unknown').replace(/\s/g, '').slice(-6)}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 border border-green-300 rounded-md capitalize">
                            {(product.category?.replace('-', ' ') || 'N/A').substring(0, 12)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-lg border ${statusColor}`}>
                            {(stockStatus === 'good' || stockStatus === 'overstock') && '✅'}
                            {stockStatus === 'low' && '⚠️'}
                            {stockStatus === 'critical' && '🚨'}
                            {stockStatus === 'unknown' && '❓'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <p className="font-bold text-green-700">LKR {product.revenue ? (product.revenue / product.unitsSold).toFixed(0) : '100'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Stock:</span>
                            <p className="font-bold text-gray-900">{product.unitsSold || Math.floor(Math.random() * 100) + 20} {product.category === 'dairy-products' || product.category === 'animal-products' ? 'packs' : 'kg'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Desktop Table View - Hidden on smaller screens */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full divide-y-2 divide-gray-200" style={{fontSize: '12px'}}>
              <thead className="bg-gradient-to-r from-green-600 to-green-700">
                <tr>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-green-500 w-16">
                    <div className="flex items-center">
                      📷
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-green-500">
                    <div className="flex items-center">
                      📦 Product Name
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-green-500">
                    <div className="flex items-center">
                      🏷️ Category
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-green-500">
                    <div className="flex items-center">
                      💰 Price
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-green-500">
                    <div className="flex items-center">
                      📊 Stock Qty
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center">
                      🔍 Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-100">
                {reportData.bestSellers.concat(reportData.worstPerformers).map((product, index) => {
                  const stockStatus = product.stockLevel || 'unknown';
                  const statusColor = 
                    (stockStatus === 'good' || stockStatus === 'overstock') ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-900 font-bold border border-green-300' :
                    stockStatus === 'low' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 font-bold border border-yellow-300' :
                    stockStatus === 'critical' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 font-bold border border-red-300' :
                    'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 font-bold border border-gray-300';
                  
                  const defaultImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
                  const rowBgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                  
                  return (
                    <tr key={`${product.name}-${index}`} className={`${rowBgColor} hover:bg-green-50 transition-colors duration-200 border-b border-gray-200`}>
                      <td className="px-3 py-4 whitespace-nowrap border-r border-gray-200">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                          <img 
                            src={product.image || defaultImage}
                            alt={product.name}
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = defaultImage;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4 border-r border-gray-200">
                        <div className="max-w-[200px]" title={product.name}>
                          <div className="text-sm font-bold text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-600 mt-1">ID: ...{(product.name || 'Unknown').replace(/\s/g, '').slice(-6)}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 border-r border-gray-200">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 border border-green-300 rounded-md capitalize">
                          {(product.category?.replace('-', ' ') || 'N/A').substring(0, 15)}
                        </span>
                      </td>
                      <td className="px-3 py-4 border-r border-gray-200">
                        <div className="text-lg font-bold text-green-700">
                          LKR {product.revenue ? (product.revenue / product.unitsSold).toFixed(0) : '100'}
                        </div>
                      </td>
                      <td className="px-3 py-4 border-r border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {product.unitsSold || Math.floor(Math.random() * 100) + 20}
                          </div>
                          <div className="text-xs text-gray-500">{product.category === 'dairy-products' || product.category === 'animal-products' ? 'packs' : 'kg'}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-lg shadow-sm ${statusColor}`}>
                          {(stockStatus === 'good' || stockStatus === 'overstock') && '✅ In Stock'}
                          {stockStatus === 'low' && '⚠️ Low Stock'}
                          {stockStatus === 'critical' && '🚨 Critical'}
                          {stockStatus === 'unknown' && '❓ Unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Enhanced Table Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-b-xl border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-gray-800">
                📊 Showing {reportData.bestSellers.length + reportData.worstPerformers.length} products
              </span>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                🔄 Live Data
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                📅 Last Updated: {new Date().toLocaleString()}
              </span>
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                ✅ System Active
              </span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              🌱 FarmNex Agricultural Management System - Product Inventory Report
            </p>
          </div>
        </div>
      </div>

      {/* Profitability Analysis */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-0">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-700">Product</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-700">Margin</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-700">Gross</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-700">Net</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-gray-700">Progress</th>
              </tr>
            </thead>
            <tbody>
              {reportData.profitabilityAnalysis.map((item) => (
                <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2 text-xs font-medium text-gray-900 truncate max-w-32" title={item.name}>{item.name}</td>
                  <td className="py-2 px-2 text-xs text-gray-900">{item.profitMargin}%</td>
                  <td className="py-2 px-2 text-xs text-gray-900">{item.grossProfit.toLocaleString()}</td>
                  <td className="py-2 px-2 text-xs text-gray-900">{item.netProfit.toLocaleString()}</td>
                  <td className="py-2 px-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(item.profitMargin / 50) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-6">
      {/* Inventory Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Inventory Value"
          value={`LKR ${reportData.inventoryStatus.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-50 to-blue-100"
        />
        <MetricCard
          title="In Stock"
          value={reportData.inventoryStatus.inStock}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-50 to-green-100"
          description="Including high-stock items"
        />
        <MetricCard
          title="Low Stock"
          value={reportData.inventoryStatus.lowStock}
          icon={AlertTriangle}
          color="bg-gradient-to-r from-yellow-50 to-yellow-100"
        />
        <MetricCard
          title="Out of Stock"
          value={reportData.inventoryStatus.outOfStock}
          icon={XCircle}
          color="bg-gradient-to-r from-red-50 to-red-100"
        />
      </div>

      {/* Critical Inventory Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            Low Stock Items ({reportData.lowStockItems.length})
          </h3>
          <div className="space-y-3">
            {reportData.lowStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</p>
                  <p className="text-xs text-yellow-700">Stock: {item.current} / Min: {item.minimum}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-700">LKR {item.value}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.reorderPoint === 'immediate' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.reorderPoint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            Out of Stock Items ({reportData.outOfStockItems.length})
          </h3>
          <div className="space-y-3">
            {reportData.outOfStockItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</p>
                  <p className="text-xs text-red-700">Out for {item.daysSinceStock} days</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-700">-LKR {item.lostRevenue}</p>
                  <p className="text-xs text-gray-600">Lost revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      {/* Category Performance Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Revenue</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Units Sold</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Avg Rating</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Growth Rate</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Profitability</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {reportData.categoryPerformance.map((category) => (
                <tr key={category.category} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 text-sm font-medium text-gray-900">{category.category}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">LKR {category.totalRevenue.toLocaleString()}</td>
                  <td className="py-3 px-3 text-sm text-gray-900">{category.unitsSold.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm text-gray-900">{category.averageRating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className={`inline-flex items-center text-sm ${
                      category.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {category.growthRate >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      <span>{category.growthRate > 0 ? '+' : ''}{category.growthRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(category.profitability / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{category.profitability}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(category.marketShare / 40) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{category.marketShare}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderQualityTab = () => (
    <div className="space-y-6">
      {/* Top Rated Products */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-600 mr-2" />
          Top Rated Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportData.topRatedProducts.map((product, index) => (
            <div key={product.name} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-yellow-700">#{index + 1}</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-bold text-yellow-700">{product.rating}</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{product.category.replace('-', ' ')}</p>
              <p className="text-xs text-yellow-600 mt-1">{product.reviews} reviews</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Overall Rating"
          value={reportData.performanceMetrics.averageRating}
          icon={Star}
          change="+0.2 from last period"
          description="Across all products"
        />
        <MetricCard
          title="Total Reviews"
          value={reportData.performanceMetrics.totalReviews}
          icon={Users}
          change="+145 new reviews"
          description="Customer feedback"
        />
        <MetricCard
          title="Customer Satisfaction"
          value="94.2%"
          icon={ThumbsUp}
          change="+2.1% improvement"
          description="Positive feedback rate"
        />
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            Success Factors
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Organic products show 35% higher profit margins
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Leafy greens have highest customer satisfaction (4.6★)
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Fresh vegetables drive 68% of repeat purchases
            </div>
            <div className="flex items-center text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Premium pricing accepted for quality products
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            Areas for Improvement
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Exotic products underperforming (avg 3.5★)
            </div>
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Stock management needs optimization
            </div>
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Seasonal demand forecasting gaps
            </div>
            <div className="flex items-center text-yellow-700">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Price optimization needed for slow movers
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            Strategic Recommendations
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Expand organic product portfolio by 40%
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Implement dynamic pricing strategies
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Bundle slow-moving with bestsellers
            </div>
            <div className="flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Enhance customer education programs
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Action Items</h3>
        <div className="space-y-4">
          {reportData.recommendations.map((rec, index) => (
            <div key={index} className={`flex items-start p-4 rounded-lg border ${
              rec.priority === 'high' ? 'bg-red-50 border-red-200' :
              rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className={`p-1 rounded-full mr-3 mt-1 ${
                rec.priority === 'high' ? 'bg-red-500' :
                rec.priority === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.priority} priority
                  </span>
                  <span className="text-xs text-gray-500">Impact: {rec.impact.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading comprehensive product management report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management Report</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of product performance, inventory status, and strategic insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="pdf">PDF Format</option>
            <option value="excel">Excel Format</option>
          </select>
          
          <button
            onClick={() => handleExport(exportFormat)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          
          <button
            onClick={loadReportData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabOptions.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'quality' && renderQualityTab()}
        {activeTab === 'financial' && renderPerformanceTab()}
        {activeTab === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

export default ProductManagementReport;
