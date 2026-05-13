import { Router } from 'express';
import type { OceanCurrentEngine } from '../simulators/OceanCurrentEngine.js';

export default function currentRoutes(engine: OceanCurrentEngine): Router {
  const router = Router();

  router.get('/api/currents', (_req, res) => {
    try {
      res.json(engine.getCurrents());
    } catch (err) {
      console.error('Error fetching currents:', err);
      res.status(500).json({ error: 'Failed to fetch currents' });
    }
  });

  return router;
}
