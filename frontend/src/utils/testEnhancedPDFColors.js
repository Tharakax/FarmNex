import { exportToPDF, getInventoryColumns, getSuppliesColumns, getProductsColumns } from './exportUtils.js';

/**
 * Test function to showcase all the enhanced PDF color schemes
 * This demonstrates the vibrant colors for each farmer dashboard section
 */
export const testAllSectionColors = () => {
  // Sample data for testing
  const sampleInventoryData = [
    {
      id: 'INV001',
      productName: 'Organic Tomatoes',
      category: 'vegetables',
      quantity: 25,
      unit: 'kg',
      pricePerUnit: 'LKR 350.00',
      totalValue: 'LKR 8,750.00',
      location: 'Greenhouse A',
      status: 'In Stock',
      lastUpdated: '2025-01-08'
    },
    {
      id: 'INV002', 
      productName: 'Bell Peppers',
      category: 'vegetables',
      quantity: 3,
      unit: 'kg',
      pricePerUnit: 'LKR 425.00',
      totalValue: 'LKR 1,275.00',
      location: 'Field B',
      status: 'Low Stock',
      lastUpdated: '2025-01-07'
    },
    {
      id: 'INV003',
      productName: 'Spinach',
      category: 'leafy-greens', 
      quantity: 0,
      unit: 'bunches',
      pricePerUnit: 'LKR 85.00',
      totalValue: 'LKR 0.00',
      location: 'Field C',
      status: 'Out of Stock',
      lastUpdated: '2025-01-06'
    }
  ];

  const sampleSuppliesData = [
    {
      id: 'SUP001',
      name: 'Organic Fertilizer NPK 10-10-10',
      type: 'fertilizers',
      quantity: 15,
      unit: 'bags (25kg)',
      costPerUnit: 'LKR 2,850.00',
      totalCost: 'LKR 42,750.00',
      supplier: 'EcoFarm Supplies Ltd',
      status: 'In Stock',
      purchaseDate: '2025-01-01'
    },
    {
      id: 'SUP002',
      name: 'Irrigation Drip System',
      type: 'tools',
      quantity: 2,
      unit: 'sets',
      costPerUnit: 'LKR 15,500.00', 
      totalCost: 'LKR 31,000.00',
      supplier: 'AgroTech Solutions',
      status: 'Maintenance Required',
      purchaseDate: '2024-12-15'
    },
    {
      id: 'SUP003',
      name: 'Tomato Seeds (Hybrid)',
      type: 'seeds',
      quantity: 8,
      unit: 'packets',
      costPerUnit: 'LKR 750.00',
      totalCost: 'LKR 6,000.00',
      supplier: 'Premium Seeds Co',
      status: 'Low Stock',
      purchaseDate: '2024-12-20'
    }
  ];

  const sampleProductsData = [
    {
      id: 'PRD001',
      name: 'Premium Organic Tomatoes',
      category: 'vegetables',
      description: 'Fresh, organically grown tomatoes from our sustainable farm',
      price: 'LKR 450.00',
      stockQuantity: 125,
      unit: 'kg',
      status: 'In Stock',
      createdDate: '2024-11-15'
    },
    {
      id: 'PRD002',
      name: 'Free-Range Chicken Eggs',
      category: 'animal-products',
      description: 'Fresh eggs from free-range chickens, collected daily',
      price: 'LKR 35.00',
      stockQuantity: 5,
      unit: 'pieces',
      status: 'Low Stock', 
      createdDate: '2024-12-01'
    },
    {
      id: 'PRD003',
      name: 'Organic Strawberries',
      category: 'berries',
      description: 'Sweet, juicy strawberries grown without pesticides',
      price: 'LKR 1,200.00',
      stockQuantity: 0,
      unit: 'kg',
      status: 'Out of Stock',
      createdDate: '2024-10-20'
    }
  ];

  // Test all sections with vibrant colors
  const sections = [
    {
      name: 'inventory',
      title: 'Inventory Management Report - Enhanced Colors',
      data: sampleInventoryData,
      columns: getInventoryColumns(),
      icon: '📦'
    },
    {
      name: 'supplies', 
      title: 'Farm Supplies Report - Vibrant Design',
      data: sampleSuppliesData,
      columns: getSuppliesColumns(),
      icon: '🛠️'
    },
    {
      name: 'products',
      title: 'Products Catalog - Colorful Layout', 
      data: sampleProductsData,
      columns: getProductsColumns(),
      icon: '🌱'
    },
    {
      name: 'reports',
      title: 'Analytics & Reports - Dynamic Styling',
      data: sampleInventoryData, // Reuse inventory data
      columns: getInventoryColumns(),
      icon: '📊'
    },
    {
      name: 'training',
      title: 'Training & Education Resources',
      data: sampleSuppliesData, // Reuse supplies data 
      columns: getSuppliesColumns(),
      icon: '🎓'
    },
    {
      name: 'sales',
      title: 'Sales & Revenue Dashboard',
      data: sampleProductsData, // Reuse products data
      columns: getProductsColumns(),
      icon: '💰'
    },
    {
      name: 'analytics',
      title: 'Performance Analytics Overview', 
      data: sampleInventoryData, // Reuse inventory data
      columns: getInventoryColumns(),
      icon: '📈'
    },
    {
      name: 'home',
      title: 'Farm Dashboard Overview',
      data: sampleProductsData, // Reuse products data
      columns: getProductsColumns(), 
      icon: '🏠'
    }
  ];

  console.log('🎨 Testing Enhanced PDF Colors for All Farmer Dashboard Sections!');
  console.log('📝 This will generate colorful PDFs showcasing the new vibrant design...');

  // Generate a PDF for each section to showcase different color schemes
  sections.forEach((section, index) => {
    setTimeout(() => {
      try {
        const filename = `enhanced_${section.name}_demo_${new Date().toISOString().split('T')[0]}`;
        
        console.log(`🎨 Generating ${section.icon} ${section.name.toUpperCase()} PDF with vibrant colors...`);
        
        exportToPDF(
          section.data,
          section.title,
          section.columns,
          filename,
          section.name
        );
        
        console.log(`✅ ${section.name.toUpperCase()} PDF generated with enhanced colors!`);
        
        if (index === sections.length - 1) {
          console.log('🎉 All enhanced PDFs generated successfully!');
          console.log('📋 Each PDF features:');
          console.log('   • Vibrant section-specific color schemes');
          console.log('   • Gradient header backgrounds');
          console.log('   • Enhanced table styling with colors');
          console.log('   • Status-based cell highlighting');  
          console.log('   • Colorful icons and decorations');
          console.log('   • Professional footer with branding');
          console.log('   • Section-specific styling elements');
        }
        
      } catch (error) {
        console.error(`❌ Error generating ${section.name} PDF:`, error);
      }
    }, index * 1000); // Stagger the generation to avoid overwhelming the browser
  });
};

/**
 * Test individual section color
 */
export const testSectionColor = (sectionName) => {
  const testData = [
    {
      id: 'TEST001',
      name: `Sample ${sectionName} Item`,
      category: 'test-category',
      quantity: 10,
      status: 'Active',
      value: 'LKR 1,000.00',
      date: new Date().toISOString().split('T')[0]
    }
  ];

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Name', key: 'name' },
    { header: 'Category', key: 'category' },
    { header: 'Quantity', key: 'quantity' },
    { header: 'Status', key: 'status' },
    { header: 'Value', key: 'value' },
    { header: 'Date', key: 'date' }
  ];

  const filename = `test_${sectionName}_colors_${new Date().toISOString().split('T')[0]}`;
  
  console.log(`🎨 Testing ${sectionName.toUpperCase()} section colors...`);
  
  exportToPDF(
    testData,
    `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} Color Test`,
    columns,
    filename,
    sectionName
  );
  
  console.log(`✅ ${sectionName.toUpperCase()} color test PDF generated!`);
};

// Export the test functions for use in browser console
export default {
  testAllSectionColors,
  testSectionColor
};
