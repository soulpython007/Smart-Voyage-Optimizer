import { Router } from 'express';
import type { ShipTracker } from '../simulators/ShipTracker.js';

export default function shipRoutes(tracker: ShipTracker): Router {
  const router = Router();

  router.get('/api/ships', (_req, res) => {
    try {
      res.json(tracker.getShips());
    } catch (err) {
      console.error('Error fetching ships:', err);
      res.status(500).json({ error: 'Failed to fetch ships' });
    }
  });

  return router;
}
