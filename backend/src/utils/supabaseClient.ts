import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _anonClient: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _serviceClient: any = null;

export async function getSupabaseClients() {
  if (_anonClient && _serviceClient) {
    return { supabaseAnon: _anonClient, supabaseService: _serviceClient };
  }

  if (typeof WebSocket === 'undefined') {
    try {
      const ws = await import('ws');
      const WS = ws.default || ws.WebSocket;
      if (WS) {
        (globalThis as Record<string, unknown>).WebSocket = WS as never;
      }
    } catch {
      // Node 22+ has native WebSocket
    }
  }

  _anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  _serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  return { supabaseAnon: _anonClient, supabaseService: _serviceClient };
}
