import React, { useState } from 'react';
import { FileText, FileSpreadsheet, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ExportDiagnostics = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async (testType) => {
    setIsRunning(true);
    const result = { status: 'running', message: 'Testing...' };
    setTestResults(prev => ({ ...prev, [testType]: result }));

    try {
      switch (testType) {
        case 'simpleDownload':
          await testSimpleDownload();
          setTestResults(prev => ({ ...prev, [testType]: { status: 'success', message: 'Simple download works!' } }));
          break;
          
        case 'pdfLibrary':
          await testPDFLibrary();
          setTestResults(prev => ({ ...prev, [testType]: { status: 'success', message: 'PDF library loaded successfully!' } }));
          break;
          
        case 'excelLibrary':
          await testExcelLibrary();
          setTestResults(prev => ({ ...prev, [testType]: { status: 'success', message: 'Excel library loaded successfully!' } }));
          break;
          
        case 'exportUtils':
          await testExportUtils();
          setTestResults(prev => ({ ...prev, [testType]: { status: 'success', message: 'Export utilities working!' } }));
          break;
          
        default:
          throw new Error('Unknown test type');
      }
    } catch (error) {
      console.error(`${testType} test failed:`, error);
      setTestResults(prev => ({ 
        ...prev, 
        [testType]: { 
          status: 'error', 
          message: `Failed: ${error.message}` 
        } 
      }));
    }
    
    setIsRunning(false);
  };

  const testSimpleDownload = () => {
    return new Promise((resolve) => {
      try {
        const testData = 'Export Test,Success\nThis is a test,file';
        const blob = new Blob([testData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'export_test.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success('Test CSV file downloaded!');
        resolve();
      } catch (error) {
        throw new Error(`Simple download failed: ${error.message}`);
      }
    });
  };

  const testPDFLibrary = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      const pdf = new jsPDF();
      pdf.text('Export Test - PDF Library Works!', 20, 20);
      pdf.autoTable({
        head: [['Test', 'Status']],
        body: [['PDF Library', 'Working'], ['Date', new Date().toLocaleDateString()]]
      });
      pdf.save('export_test.pdf');
      toast.success('Test PDF file generated!');
    } catch (error) {
      throw new Error(`PDF library test failed: ${error.message}`);
    }
  };

  const testExcelLibrary = async () => {
    try {
      const XLSX = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([
        ['Test', 'Status'],
        ['Excel Library', 'Working'],
        ['Date', new Date().toLocaleDateString()]
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'export_test.xlsx');
      toast.success('Test Excel file generated!');
    } catch (error) {
      throw new Error(`Excel library test failed: ${error.message}`);
    }
  };

  const testExportUtils = async () => {
    try {
      const { exportToPDF, exportToExcel, getProductsColumns } = await import('../utils/exportUtils');
      
      const testData = [
        {
          id: 'TEST001',
          name: 'Test Product',
          category: 'test',
          description: 'This is a test product for export functionality',
          price: 100,
          stockQuantity: 50,
          unit: 'pieces',
          status: 'In Stock',
          createdDate: new Date().toISOString().split('T')[0]
        }
      ];
      
      // Test PDF export
      await exportToPDF(
        testData,
        'Export Utilities Test - PDF',
        getProductsColumns(),
        'export_utils_test_pdf',
        'products'
      );
      
      // Test Excel export  
      await exportToExcel(
        testData,
        'Export Utilities Test - Excel',
        getProductsColumns(),
        'export_utils_test_excel'
      );
      
      toast.success('Export utilities test completed! Check your downloads.');
    } catch (error) {
      throw new Error(`Export utils test failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    const tests = ['simpleDownload', 'pdfLibrary', 'excelLibrary', 'exportUtils'];
    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
      await runDiagnostic(test);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <TestTube className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Export Diagnostics</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Run these tests to diagnose export functionality issues. Each test will generate a test file in your downloads folder.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Simple Download Test</h3>
            {getStatusIcon(testResults.simpleDownload?.status)}
          </div>
          <p className="text-sm text-gray-600 mb-3">Tests basic file download functionality</p>
          <button
            onClick={() => runDiagnostic('simpleDownload')}
            disabled={isRunning}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testResults.simpleDownload?.status === 'running' ? 'Testing...' : 'Test CSV Download'}
          </button>
          {testResults.simpleDownload && (
            <p className={`text-sm mt-2 ${
              testResults.simpleDownload.status === 'success' ? 'text-green-600' : 
              testResults.simpleDownload.status === 'error' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {testResults.simpleDownload.message}
            </p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <FileText className="h-4 w-4 mr-2" />PDF Library Test
            </h3>
            {getStatusIcon(testResults.pdfLibrary?.status)}
          </div>
          <p className="text-sm text-gray-600 mb-3">Tests jsPDF and autoTable libraries</p>
          <button
            onClick={() => runDiagnostic('pdfLibrary')}
            disabled={isRunning}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {testResults.pdfLibrary?.status === 'running' ? 'Testing...' : 'Test PDF Generation'}
          </button>
          {testResults.pdfLibrary && (
            <p className={`text-sm mt-2 ${
              testResults.pdfLibrary.status === 'success' ? 'text-green-600' : 
              testResults.pdfLibrary.status === 'error' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {testResults.pdfLibrary.message}
            </p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />Excel Library Test
            </h3>
            {getStatusIcon(testResults.excelLibrary?.status)}
          </div>
          <p className="text-sm text-gray-600 mb-3">Tests XLSX and file-saver libraries</p>
          <button
            onClick={() => runDiagnostic('excelLibrary')}
            disabled={isRunning}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {testResults.excelLibrary?.status === 'running' ? 'Testing...' : 'Test Excel Generation'}
          </button>
          {testResults.excelLibrary && (
            <p className={`text-sm mt-2 ${
              testResults.excelLibrary.status === 'success' ? 'text-green-600' : 
              testResults.excelLibrary.status === 'error' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {testResults.excelLibrary.message}
            </p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Export Utils Test</h3>
            {getStatusIcon(testResults.exportUtils?.status)}
          </div>
          <p className="text-sm text-gray-600 mb-3">Tests complete export utility functions</p>
          <button
            onClick={() => runDiagnostic('exportUtils')}
            disabled={isRunning}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {testResults.exportUtils?.status === 'running' ? 'Testing...' : 'Test Export Functions'}
          </button>
          {testResults.exportUtils && (
            <p className={`text-sm mt-2 ${
              testResults.exportUtils.status === 'success' ? 'text-green-600' : 
              testResults.exportUtils.status === 'error' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {testResults.exportUtils.message}
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
        >
          {isRunning ? 'Running All Tests...' : 'Run All Tests'}
        </button>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Browser Tips:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Allow pop-ups and downloads for this site</li>
          <li>• Check your downloads folder for test files</li>
          <li>• Open browser DevTools (F12) to see detailed error messages</li>
          <li>• If tests fail, try a different browser or incognito mode</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportDiagnostics;
