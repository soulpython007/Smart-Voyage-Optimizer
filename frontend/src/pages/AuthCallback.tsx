import { useEffect } from 'react';
import { Card } from '../components/ui';
import { useAuth } from '../auth/useAuth';

export function AuthCallback() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      window.location.pathname = '/';
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="text-center p-6">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold">Completing sign in...</p>
      </Card>
    </div>
  );
}
