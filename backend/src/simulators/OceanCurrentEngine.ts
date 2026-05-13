import type { OceanCurrentCell, GeoJSONFeatureCollection } from '../types/index.js';
import { featureCollection, pointFeature } from '../utils/geo.js';

const GRID_SIZE = 20;
const BOUNDS = { minLat: -10, maxLat: 32, minLon: 30, maxLon: 110 };

export class OceanCurrentEngine {
  grid: OceanCurrentCell[][] = [];
  private time = 0;

  constructor() {
    this.regenerate();
  }

  private regenerate(): void {
    this.grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      this.grid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const lat = BOUNDS.minLat + (r / (GRID_SIZE - 1)) * (BOUNDS.maxLat - BOUNDS.minLat);
        const lon = BOUNDS.minLon + (c / (GRID_SIZE - 1)) * (BOUNDS.maxLon - BOUNDS.minLon);
        const baseDirection = this.baseCurrent(lat, lon);
        this.grid[r][c] = {
          latitude: lat,
          longitude: lon,
          direction: baseDirection + (Math.random() - 0.5) * 30,
          speedKnots: 1 + Math.random() * 3,
        };
      }
    }
  }

  private baseCurrent(lat: number, lon: number): number {
    const latNorm = (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat);
    const lonNorm = (lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon);

    const monsoon = Math.sin(lonNorm * Math.PI * 2) * 30;
    const gyre = Math.sin(latNorm * Math.PI) * 40;
    const agulhas = Math.max(0, Math.sin((latNorm - 0.1) * Math.PI * 2)) * 25;
    return (90 + monsoon + gyre + agulhas + 360) % 360;
  }

  tick(): void {
    this.time++;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = this.grid[r][c];

        const latNorm = (cell.latitude - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat);
        const lonNorm = (cell.longitude - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon);

        const tide = Math.sin(this.time * 0.05 + latNorm * Math.PI * 4) * 8;
        const seasonal = Math.sin(this.time * 0.02 + lonNorm * Math.PI * 2) * 12;
        const noise = (Math.random() - 0.5) * 5;

        cell.direction = (this.baseCurrent(cell.latitude, cell.longitude) + tide + seasonal + noise + 360) % 360;

        const speedTide = Math.sin(this.time * 0.04 + latNorm * Math.PI * 3) * 0.6 + 1.2;
        cell.speedKnots = Math.max(0.2, 1.5 + speedTide + (Math.random() - 0.5) * 0.5);
      }
    }
  }

  getCurrents(): GeoJSONFeatureCollection {
    const features = this.grid.flat().map((cell) =>
      pointFeature(cell.longitude, cell.latitude, {
        direction: Math.round(cell.direction * 10) / 10,
        speedKnots: Math.round(cell.speedKnots * 100) / 100,
      }),
    );
    return featureCollection(features);
  }
}
