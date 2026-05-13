import { Router } from 'express';
import type { WeatherEngine } from '../simulators/WeatherEngine.js';

export default function weatherRoutes(engine: WeatherEngine): Router {
  const router = Router();

  router.get('/api/weather/zones', (_req, res) => {
    try {
      res.json(engine.getZones());
    } catch (err) {
      console.error('Error fetching weather zones:', err);
      res.status(500).json({ error: 'Failed to fetch weather zones' });
    }
  });

  return router;
}
