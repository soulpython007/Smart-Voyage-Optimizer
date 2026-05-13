import { createClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from '../api/config';

export const supabase = createClient(
  AUTH_CONFIG.supabaseUrl,
  AUTH_CONFIG.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export function getAccessToken(): string | null {
  return localStorage.getItem('sb-access-token');
}
