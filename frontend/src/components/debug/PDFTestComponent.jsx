import React from 'react';
import { exportToPDF, getProductsColumns } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

const PDFTestComponent = () => {
  const testPDFExport = async () => {
    const loadingToast = toast.loading('Testing PDF export...');
    
    try {
      // Sample test data
      const testData = [
        {
          id: '1',
          name: 'Fresh Tomatoes',
          category: 'vegetables',
          description: 'Organic red tomatoes grown locally',
          price: 3.99,
          stockQuantity: 50,
          unit: 'kg',
          status: 'In Stock',
          createdDate: '2024-01-15'
        },
        {
          id: '2',
          name: 'Green Lettuce',
          category: 'leafy-greens',
          description: 'Fresh crispy lettuce leaves',
          price: 2.49,
          stockQuantity: 25,
          unit: 'bunches',
          status: 'Low Stock',
          createdDate: '2024-01-10'
        }
      ];

      const success = await exportToPDF(
        testData,
        'Test Products Report',
        getProductsColumns(),
        'test_products_export'
      );
      
      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success('PDF test export successful!');
      } else {
        toast.error('PDF test export failed');
      }
    } catch (error) {
      console.error('PDF Test Error:', error);
      toast.dismiss(loadingToast);
      toast.error(`Test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">PDF Export Debug Test</h3>
      <p className="text-yellow-700 text-sm mb-4">
        Click the button below to test PDF export with sample data.
      </p>
      <button 
        onClick={testPDFExport}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Test PDF Export
      </button>
    </div>
  );
};

export default PDFTestComponent;
