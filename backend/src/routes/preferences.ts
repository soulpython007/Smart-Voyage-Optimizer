import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getSupabaseClients } from '../utils/supabaseClient.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/api/preferences', async (req: AuthenticatedRequest, res) => {
  const { supabaseService } = await getSupabaseClients();
  const { data, error } = await supabaseService
    .from('user_preferences')
    .select('*')
    .eq('user_id', req.user!.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data) {
    const { data: newPrefs, error: insertError } = await supabaseService
      .from('user_preferences')
      .insert({ user_id: req.user!.id })
      .select()
      .single();

    if (insertError) { res.status(500).json({ error: insertError.message }); return; }
    res.json(newPrefs);
    return;
  }

  res.json(data);
});

router.put('/api/preferences', async (req: AuthenticatedRequest, res) => {
  const { supabaseService } = await getSupabaseClients();
  const updates: Record<string, unknown> = {};
  const allowedFields = ['dark_mode', 'preferred_optimization_mode', 'map_settings', 'selected_ship_type', 'show_weather', 'show_currents'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseService
    .from('user_preferences')
    .upsert({ user_id: req.user!.id, ...updates })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

export default router;
