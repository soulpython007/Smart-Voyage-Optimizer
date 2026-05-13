import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getSupabaseClients } from '../utils/supabaseClient.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/api/saved-routes', async (req: AuthenticatedRequest, res) => {
  const { supabaseService } = await getSupabaseClients();
  const { data, error } = await supabaseService
    .from('saved_routes')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

router.post('/api/saved-routes', async (req: AuthenticatedRequest, res) => {
  const { supabaseService } = await getSupabaseClients();
  const { name, departure_port_id, departure_port_name, destination_port_id, destination_port_name, mode, waypoints, distance_nm, eta_hours, fuel_estimate_tonnes, risk_score, route_data } = req.body;

  if (!name || !departure_port_id || !destination_port_id) {
    res.status(400).json({ error: 'name, departure_port_id, and destination_port_id are required' });
    return;
  }

  const { data, error } = await supabaseService
    .from('saved_routes')
    .insert({
      user_id: req.user!.id,
      name,
      departure_port_id,
      departure_port_name,
      destination_port_id,
      destination_port_name,
      mode: mode || 'eco',
      waypoints: waypoints || [],
      distance_nm,
      eta_hours,
      fuel_estimate_tonnes,
      risk_score,
      route_data,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.delete('/api/saved-routes/:id', async (req: AuthenticatedRequest, res) => {
  const { supabaseService } = await getSupabaseClients();
  const { id } = req.params;
  const { error } = await supabaseService
    .from('saved_routes')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user!.id);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ success: true });
});

export default router;
