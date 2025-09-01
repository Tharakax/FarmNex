// Test file for PDF export functionality
import { exportToPDF, getProductsColumns } from './exportUtils.js';

// Sample test data
const sampleData = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    description: 'Fresh organic tomatoes grown locally',
    price: 5.99,
    stockQuantity: 100,
    unit: 'kg',
    status: 'Available',
    createdDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Premium Wheat',
    category: 'Grains',
    description: 'High-quality wheat for baking',
    price: 2.50,
    stockQuantity: 500,
    unit: 'kg',
    status: 'Available',
    createdDate: '2024-01-10'
  },
  {
    id: '3',
    name: 'Free-Range Eggs',
    category: 'Dairy',
    description: 'Farm-fresh eggs from free-range chickens',
    price: 4.99,
    stockQuantity: 200,
    unit: 'dozen',
    status: 'Low Stock',
    createdDate: '2024-01-20'
  }
];

// Test function to export sample data
export const testPDFExport = () => {
  try {
    console.log('Testing PDF export functionality...');
    
    const columns = getProductsColumns();
    const result = exportToPDF(sampleData, 'Product Inventory Report', columns, 'test-products');
    
    if (result) {
      console.log('✅ PDF export test passed!');
      return true;
    } else {
      console.log('❌ PDF export test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ PDF export test error:', error);
    return false;
  }
};

// Run test if this file is executed directly
if (import.meta.url === window.location.href) {
  testPDFExport();
}

export default testPDFExport;
