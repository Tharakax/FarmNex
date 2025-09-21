import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const ErrorFallback = ({ 
  error = null, 
  componentName = 'Component',
  onRetry = null,
  onGoHome = null 
}) => {
  return (
    <div className="min-h-96 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        
        <h2 className="text-xl font-bold text-red-800 mb-2">
          Error Loading {componentName}
        </h2>
        
        <p className="text-red-600 mb-4">
          There was an error loading the {componentName.toLowerCase()} component. 
          Please try refreshing or contact support if the problem persists.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 rounded text-left">
            <p className="text-xs text-red-800 font-mono break-all">
              {error.message || error.toString()}
            </p>
          </div>
        )}
        
        <div className="flex justify-center space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          )}
          
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          If this error persists, check the browser console for more details.
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;