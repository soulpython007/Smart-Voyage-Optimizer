import { Router } from 'express';
import portsData from '../data/ports.json' with { type: 'json' };
import type { Port, GeoJSONFeatureCollection } from '../types/index.js';
import { featureCollection, pointFeature } from '../utils/geo.js';

const router = Router();

router.get('/api/ports', (_req, res) => {
  try {
    const ports: Port[] = portsData;
    const fc: GeoJSONFeatureCollection = featureCollection(
      ports.map((p) =>
        pointFeature(p.longitude, p.latitude, {
          id: p.id,
          name: p.name,
          country: p.country,
        }),
      ),
    );
    res.json(fc);
  } catch (err) {
    console.error('Error fetching ports:', err);
    res.status(500).json({ error: 'Failed to fetch ports' });
  }
});

export default router;
