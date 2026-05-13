import type { StormZone, GeoJSONFeatureCollection } from '../types/index.js';
import { featureCollection, polygonFeature } from '../utils/geo.js';

const STORM_COUNT = 6;
const BOUNDS = { minLat: -10, maxLat: 32, minLon: 30, maxLon: 110 };

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

const STORM_CORRIDORS: { lat: [number, number]; lon: [number, number]; count: number }[] = [
  { lat: [-2, 6], lon: [75, 90], count: 1 },
  { lat: [5, 12], lon: [55, 70], count: 1 },
  { lat: [-8, 0], lon: [85, 100], count: 1 },
  { lat: [10, 18], lon: [60, 75], count: 1 },
  { lat: [-5, 3], lon: [45, 60], count: 1 },
  { lat: [0, 8], lon: [100, 108], count: 1 },
];

function generateStorms(): StormZone[] {
  const storms: StormZone[] = [];
  let id = 0;
  for (const corridor of STORM_CORRIDORS) {
    for (let i = 0; i < corridor.count; i++) {
      storms.push({
        id: `storm-${id}`,
        center: [rand(corridor.lat[0], corridor.lat[1]), rand(corridor.lon[0], corridor.lon[1])],
        radius: rand(100, 250),
        severity: rand(3, 6),
        windSpeed: rand(40, 80),
        waveHeight: rand(4, 12),
        movementVector: [rand(-0.2, 0.2), rand(-0.2, 0.2)],
        lifecycle: 'stable',
      });
      id++;
    }
  }
  return storms;
}

export class WeatherEngine {
  private storms: StormZone[];
  private time = 0;

  getStorms(): StormZone[] {
    return this.storms;
  }

  constructor() {
    this.storms = generateStorms();
  }

  tick(): void {
    this.time++;

    for (const storm of this.storms) {
      const [dLat, dLon] = storm.movementVector;

      storm.center[0] += dLat + rand(-0.05, 0.05);
      storm.center[1] += dLon + rand(-0.05, 0.05);

      storm.center[0] = Math.max(BOUNDS.minLat, Math.min(BOUNDS.maxLat, storm.center[0]));
      storm.center[1] = Math.max(BOUNDS.minLon, Math.min(BOUNDS.maxLon, storm.center[1]));

      const severityDrift = rand(-0.3, 0.3);
      storm.severity = Math.max(0.5, Math.min(6, storm.severity + severityDrift));

      storm.windSpeed = 10 + storm.severity * 12 + rand(-3, 3);
      storm.waveHeight = 1 + storm.severity * 1.8 + rand(-0.5, 0.5);
      storm.radius = 60 + storm.severity * 30 + rand(-10, 10);

      const theta = this.time * 0.02 + Math.random() * 0.1;
      storm.movementVector[0] += Math.cos(theta) * 0.02;
      storm.movementVector[1] += Math.sin(theta) * 0.02;
      const speed = Math.sqrt(
        storm.movementVector[0] ** 2 + storm.movementVector[1] ** 2,
      );
      if (speed > 0.5) {
        storm.movementVector[0] = (storm.movementVector[0] / speed) * 0.5;
        storm.movementVector[1] = (storm.movementVector[1] / speed) * 0.5;
      }

      if (storm.severity < 0.8) storm.lifecycle = 'dying';
      else if (storm.severity > 4) storm.lifecycle = 'growing';
      else storm.lifecycle = 'stable';
    }
  }

  getZones(): GeoJSONFeatureCollection {
    const features = this.storms.map((storm) => {
      const [lat, lon] = storm.center;
      const r = storm.radius;
      const pts: number[][] = [];
      const segments = 20;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const dLat = (r / 111) * Math.cos(angle);
        const dLon = (r / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
        pts.push([lon + dLon, lat + dLat]);
      }
      return polygonFeature([pts], {
        id: storm.id,
        severity: Math.round(storm.severity * 10) / 10,
        windSpeed: Math.round(storm.windSpeed * 10) / 10,
        waveHeight: Math.round(storm.waveHeight * 10) / 10,
        lifecycle: storm.lifecycle,
      });
    });

    return featureCollection(features);
  }
}
