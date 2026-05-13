function requireEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}.\n` +
      `Ensure it is set in Vercel dashboard (Production scope) ` +
      `and redeploy after setting it.`,
    );
  }
  return value;
}

export const API_CONFIG = {
  baseUrl: requireEnv('VITE_API_URL'),
  wsUrl: requireEnv('VITE_WS_URL'),
  timeout: 15000,
  retryAttempts: 3,
  refetchInterval: 60000,
  staleTime: 30000,
};

export const AUTH_CONFIG = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY'),
};
