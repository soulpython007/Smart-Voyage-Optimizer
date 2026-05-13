import { Router } from 'express';
import type { RouteRequest } from '../types/index.js';
import type { RouteOptimizer } from '../services/routeOptimizer.js';

export default function optimizeRoutes(optimizer: RouteOptimizer): Router {
  const router = Router();

  router.post('/api/optimize-route', (req, res) => {
    try {
      const body = req.body as RouteRequest;

      if (!body.from || !body.to) {
        res.status(400).json({ error: 'from and to are required' });
        return;
      }

      if (body.mode === 'custom' && !body.weights) {
        res.status(400).json({ error: 'weights object is required for custom mode' });
        return;
      }

      const result = optimizer.optimize(body);

      if ('error' in result) {
        res.status(400).json(result);
        return;
      }

      res.json(result);
    } catch (err) {
      console.error('Route optimization error:', err);
      res.status(500).json({ error: 'Route optimization failed' });
    }
  });

  return router;
}
