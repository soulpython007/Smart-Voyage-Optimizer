import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { SignUpPage } from './auth/SignUpPage';
import { AuthCallback } from './pages/AuthCallback';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-off-white dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md p-6 bg-white dark:bg-gray-800 border-2 border-red-500 rounded-xl">
            <h1 className="text-xl font-extrabold text-red-600 dark:text-red-400 mb-3">
              Failed to initialize application
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {this.state.error.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Check that all environment variables are set correctly in Vercel dashboard and redeploy.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (path === '/signup') {
    return <SignUpPage />;
  }

  if (path === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ErrorBoundary>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ErrorBoundary>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
