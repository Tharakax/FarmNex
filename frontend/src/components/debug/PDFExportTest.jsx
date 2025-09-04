import React from 'react';
import { exportToPDF, getProductsColumns, processDataForExport } from '../../utils/exportUtils';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const PDFExportTest = () => {
  const sampleProducts = [
    {
      id: '1',
      name: 'Fresh Tomatoes',
      category: 'vegetables',
      description: 'Organic red tomatoes, freshly harvested',
      price: 1250,
      stockQuantity: 100,
      unit: 'kg',
      status: 'In Stock',
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Green Apples',
      category: 'fruits',
      description: 'Crisp green apples, perfect for snacking',
      price: 800,
      stockQuantity: 5,
      unit: 'kg',
      status: 'Low Stock',
      createdDate: '2024-01-20'
    },
    {
      id: '3',
      name: 'Fresh Milk',
      category: 'dairy-products',
      description: 'Farm fresh organic milk',
      price: 450,
      stockQuantity: 0,
      unit: 'liter',
      status: 'Out of Stock',
      createdDate: '2024-01-25'
    }
  ];

  const handleTestExport = async () => {
    console.log('Starting PDF export test...');
    const loadingToast = toast.loading('Testing PDF export...');
    
    try {
      // Process the sample data
      const processedData = processDataForExport(
        sampleProducts,
        ['price'],
        ['createdDate']
      );

      console.log('Processed data:', processedData);
      console.log('Columns:', getProductsColumns());

      // Test the export
      const success = exportToPDF(
        processedData,
        'Products Test Report',
        getProductsColumns(),
        'test_products_report'
      );

      toast.dismiss(loadingToast);

      if (success) {
        toast.success('PDF export test successful!');
      } else {
        toast.error('PDF export test failed');
      }
    } catch (error) {
      console.error('PDF export test error:', error);
      toast.dismiss(loadingToast);
      toast.error(`Test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">PDF Export Test</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Sample Data:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-auto">
          {JSON.stringify(sampleProducts, null, 2)}
        </pre>
      </div>

      <button
        onClick={handleTestExport}
        className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <FileText className="h-5 w-5 mr-2" />
        Test PDF Export
      </button>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> This component tests the PDF export functionality with sample data.</p>
        <p>If the export works, the issue might be with the actual product data from the API.</p>
        <p>If it fails, the issue is with the PDF export implementation itself.</p>
      </div>
    </div>
  );
};

export default PDFExportTest;
