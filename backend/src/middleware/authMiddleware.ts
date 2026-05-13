import type { Request, Response, NextFunction } from 'express';
import { getSupabaseClients } from '../utils/supabaseClient.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const { supabaseAnon } = await getSupabaseClients();
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = {
      id: data.user.id,
      email: data.user.email,
    };
    next();
  } catch {
    res.status(500).json({ error: 'Authentication verification failed' });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  getSupabaseClients()
    .then(async ({ supabaseAnon }) => {
      try {
        const { data } = await supabaseAnon.auth.getUser(token);
        if (data?.user) {
          req.user = { id: data.user.id, email: data.user.email };
        }
      } catch {
        // Token invalid, proceed without auth
      }
      next();
    })
    .catch(() => next());
}
