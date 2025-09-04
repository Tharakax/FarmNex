import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';

const TrainingManagementSimple = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Test function for Excel export
  const handleTestExport = async () => {
    setIsExporting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Simulate export process
      setTimeout(() => {
        setSuccessMessage('Excel export functionality is ready! (This is a demo)');
        setIsExporting(false);
      }, 2000);
    } catch (error) {
      setErrorMessage('Export failed: ' + error.message);
      setIsExporting(false);
    }
  };

  // Auto-hide messages
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-8 w-8 text-green-600 mr-3" />
              Training Management
            </h2>
            <p className="text-gray-600 mt-1">Manage your agricultural training materials</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Excel Export Button */}
            <button
              onClick={handleTestExport}
              disabled={isExporting}
              className={`
                bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg 
                transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
                disabled:transform-none ${isExporting ? 'animate-pulse' : ''}
              `}
              title="Export training materials to Excel"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Export Excel</span>
                </>
              )}
            </button>
            
            {/* Add Material Button */}
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Add Material</span>
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Total Materials</h3>
            <p className="text-2xl font-bold text-blue-600">24</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">Active Materials</h3>
            <p className="text-2xl font-bold text-green-600">21</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800">Categories</h3>
            <p className="text-2xl font-bold text-yellow-600">6</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800">Total Views</h3>
            <p className="text-2xl font-bold text-purple-600">1,247</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainingManagementSimple;
