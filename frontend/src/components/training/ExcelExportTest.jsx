import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { trainingAPIReal } from '../../services/trainingAPIReal';
import toast from 'react-hot-toast';

const ExcelExportTest = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState(null);
  const [error, setError] = useState(null);

  const handleTestExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setError(null);
    toast.loading('Testing Excel export...', { id: 'test-export' });

    try {
      const result = await trainingAPIReal.exportToExcel();
      
      setLastExport({
        filename: result.filename,
        timestamp: new Date().toLocaleString(),
        success: true
      });

      toast.success(
        `Test successful! File: ${result.filename}`,
        { 
          id: 'test-export',
          duration: 5000
        }
      );

    } catch (error) {
      console.error('Test export failed:', error);
      setError(error.message);
      
      toast.error(
        `Test failed: ${error.message}`,
        { 
          id: 'test-export',
          duration: 5000
        }
      );
      
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <FileSpreadsheet className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Excel Export Test</h2>
        <p className="text-gray-600 mt-1">Test the training materials Excel export functionality</p>
      </div>

      {/* Test Button */}
      <button
        onClick={handleTestExport}
        disabled={isExporting}
        className={`
          w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 
          transition-colors flex items-center justify-center space-x-2 
          shadow-md hover:shadow-lg transform hover:scale-105 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${isExporting ? 'animate-pulse' : ''}
        `}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            <span>Test Excel Export</span>
          </>
        )}
      </button>

      {/* Results Section */}
      <div className="mt-6 space-y-4">
        {/* Success Message */}
        {lastExport && lastExport.success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-1">Export Successful!</h4>
                <p className="text-sm text-green-700">
                  File: <code className="bg-green-100 px-1 rounded text-xs">{lastExport.filename}</code>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Exported at: {lastExport.timestamp}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Export Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  Check console for more details
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Expected Features:</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Training Materials Overview sheet</li>
          <li>• Statistics by Type sheet</li>
          <li>• Statistics by Category sheet</li>
          <li>• Statistics by Difficulty sheet</li>
          <li>• Popular Tags sheet</li>
          <li>• Summary Report sheet</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelExportTest;
