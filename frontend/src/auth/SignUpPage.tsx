import { useState } from 'react';
import { Card } from '../components/ui';
import { useAuth } from './useAuth';

export function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-500 border-2 border-black dark:border-gray-600 rounded-xl flex items-center justify-center shadow-neobrutalist">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold dark:text-white mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We've sent a confirmation link to <strong>{email}</strong>
          </p>
          <a
            href="/"
            className="inline-block mt-4 text-blue-600 dark:text-blue-400 font-bold underline"
          >
            Back to sign in
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-blue-600 border-2 border-black dark:border-gray-600 rounded-xl flex items-center justify-center shadow-neobrutalist">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path d="M12 2 L4 20 L12 16 L20 20 Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold dark:text-white">Create Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign up for Smart Voyage</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-xl text-red-700 dark:text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-black dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold border-2 border-black dark:border-gray-600 rounded-xl shadow-neobrutalist active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 min-h-[44px] disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <a href="/" className="text-blue-600 dark:text-blue-400 font-bold underline">Sign In</a>
        </p>
      </Card>
    </div>
  );
}
