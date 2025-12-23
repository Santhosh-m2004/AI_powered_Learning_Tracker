import { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      resetKey: 0
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      errorInfo: null,
      resetKey: prev.resetKey + 1
    }));
  };

  goBackSafe = () => {
    if (window.history.length > 1) window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full text-center">

            <div className="inline-flex items-center justify-center w-16 h-16 
                            bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The application encountered an unexpected error.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 
                            dark:border-red-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Error Details:
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 font-mono break-all">
                {this.state.error?.toString() || "Unknown error"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-4 py-2 
                           bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Restart Component
              </button>

              <button
                onClick={this.goBackSafe}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 
                           text-gray-800 dark:text-gray-300 rounded-lg 
                           hover:bg-gray-300 dark:hover:bg-gray-600 
                           transition-colors"
              >
                Go Back
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              If the issue continues, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div key={this.state.resetKey}>
        {this.props.children}
      </div>
    );
  }
}

export const withErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;
