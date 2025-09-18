import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              There was an error loading this component.
            </p>
            
            {this.props.showDetails && this.state.error && (
              <div className="mb-6 text-left">
                <details className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Error Details
                  </summary>
                  <div className="text-sm text-red-700">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                    <br />
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-2 text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>

            {this.props.children && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  Reload Page
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;