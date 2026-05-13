import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getSupabaseClients } from '../utils/supabaseClient.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/api/voyage-history', async (req: AuthenticatedRequest, res) => {
  const { supabaseService } = await getSupabaseClients();
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const { data, error } = await supabaseService
    .from('voyage_history')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/api/voyage-history', async (req: AuthenticatedRequest, res) => {
  const { supabaseService } = await getSupabaseClients();
  const { departure_port_id, departure_port_name, destination_port_id, destination_port_name, mode, distance_nm, eta_hours, fuel_estimate_tonnes, risk_score, optimization_result } = req.body;

  if (!departure_port_id || !destination_port_id) {
    res.status(400).json({ error: 'departure_port_id and destination_port_id are required' });
    return;
  }

  const { data, error } = await supabaseService
    .from('voyage_history')
    .insert({
      user_id: req.user!.id,
      departure_port_id,
      departure_port_name,
      destination_port_id,
      destination_port_name,
      mode: mode || 'eco',
      distance_nm,
      eta_hours,
      fuel_estimate_tonnes,
      risk_score,
      optimization_result,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

export default router;
