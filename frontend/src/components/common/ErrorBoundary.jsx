import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Component Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4">⚠️ Component Error</h2>
          <p className="text-red-600 mb-4">Something went wrong loading this component.</p>
          
          <details className="mb-4">
            <summary className="cursor-pointer text-red-700 font-semibold">View Error Details</summary>
            <div className="mt-2 p-3 bg-red-100 rounded text-sm">
              <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
              <p><strong>Component Stack:</strong></p>
              <pre className="text-xs overflow-x-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          </details>
          
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;