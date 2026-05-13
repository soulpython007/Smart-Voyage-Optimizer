import shipsData from '../data/ships.json' with { type: 'json' };
import portsData from '../data/ports.json' with { type: 'json' };
import type { Ship, ShipState, Port, GeoJSONFeatureCollection } from '../types/index.js';
import {
  haversineDistance,
  initialBearing,
  greatCircleInterpolation,
  knotsToKmh,
  etaHours,
  featureCollection,
  pointFeature,
} from '../utils/geo.js';

const TICK_INTERVAL_HOURS = 5 / 3600;

const DRIFT_NOISE = 0.002;

const ports: Port[] = portsData;
const portMap = new Map(ports.map((p) => [p.id, p]));

function buildInitialRoute(ship: Ship): { latitude: number; longitude: number }[] {
  const dest = portMap.get(ship.destination);
  if (!dest) return [];
  const steps = 20;
  const route: { latitude: number; longitude: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    route.push(
      greatCircleInterpolation(
        ship.currentPosition.latitude,
        ship.currentPosition.longitude,
        dest.latitude,
        dest.longitude,
        f,
      ),
    );
  }
  return route;
}

export class ShipTracker {
  ships: ShipState[];

  constructor() {
    this.ships = (shipsData as Ship[]).map((s) => {
      const route = buildInitialRoute(s);
      const dest = route[route.length - 1];
      const distanceKm = haversineDistance(
        s.currentPosition.latitude,
        s.currentPosition.longitude,
        dest.latitude,
        dest.longitude,
      );
      return {
        ...s,
        heading: 0,
        speedKnots: s.maxSpeedKnots * (0.6 + Math.random() * 0.3),
        route,
        waypointIndex: 0,
        eta: etaHours(distanceKm, s.maxSpeedKnots * 0.8),
      };
    });
  }

  tick(): void {
    for (const ship of this.ships) {
      const idx = ship.waypointIndex;
      if (idx >= ship.route.length - 1) {
        const dest = ship.route[ship.route.length - 1];
        ship.currentPosition = { ...dest };
        continue;
      }

      const from = ship.route[idx];
      const to = ship.route[idx + 1];
      const segmentKm = haversineDistance(
        from.latitude, from.longitude,
        to.latitude, to.longitude,
      );
      const speedKmh = knotsToKmh(ship.speedKnots);
      const travelKm = speedKmh * TICK_INTERVAL_HOURS;

      const fraction = segmentKm > 0 ? travelKm / segmentKm : 1;
      const clamped = Math.min(fraction, 1);

      const interpolated = greatCircleInterpolation(
        from.latitude, from.longitude,
        to.latitude, to.longitude,
        clamped,
      );

      const noise = DRIFT_NOISE * (Math.random() - 0.5);
      ship.currentPosition = {
        latitude: interpolated.latitude + noise,
        longitude: interpolated.longitude + noise,
      };

      if (clamped >= 0.99 && idx < ship.route.length - 1) {
        ship.waypointIndex++;
      }

      ship.heading = initialBearing(
        from.latitude, from.longitude,
        to.latitude, to.longitude,
      );

      const remaining = this.remainingDistance(ship);
      ship.eta = etaHours(remaining, ship.speedKnots);

      ship.speedKnots += (Math.random() - 0.5) * 0.3;
      ship.speedKnots = Math.max(2, Math.min(ship.maxSpeedKnots, ship.speedKnots));
    }
  }

  private remainingDistance(ship: ShipState): number {
    let total = 0;
    for (let i = ship.waypointIndex; i < ship.route.length - 1; i++) {
      const a = ship.route[i];
      const b = ship.route[i + 1];
      total += haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
    }
    return total;
  }

  getShips(): GeoJSONFeatureCollection {
    return featureCollection(
      this.ships.map((s) =>
        pointFeature(s.currentPosition.longitude, s.currentPosition.latitude, {
          id: s.id,
          name: s.name,
          type: s.type,
          heading: Math.round(s.heading * 10) / 10,
          speedKnots: Math.round(s.speedKnots * 10) / 10,
          eta: Math.round(s.eta * 10) / 10,
          destination: s.destination,
          draft: s.draft,
        }),
      ),
    );
  }
}
