import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { SignUpPage } from './auth/SignUpPage';

function AppContent() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (path === '/signup') {
    return <SignUpPage />;
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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
