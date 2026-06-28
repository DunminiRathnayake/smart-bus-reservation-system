import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Catches JavaScript errors anywhere in child component tree.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
          <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl shadow-emerald-950/10">
            <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Something went wrong</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              An unexpected error occurred. Please click the button below to reload the application.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-slate-950 p-4 rounded-lg overflow-x-auto text-red-300/80 border border-red-950/40">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-slate-950 transition-all shadow-md shadow-emerald-500/10"
            >
              <RotateCcw className="h-4 w-4" /> Reload SmartGo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
