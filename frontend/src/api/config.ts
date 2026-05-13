export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || '',
  wsUrl: import.meta.env.VITE_WS_URL || '',
  timeout: 15000,
  retryAttempts: 3,
  refetchInterval: 60000,
  staleTime: 30000,
};

export const AUTH_CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};
