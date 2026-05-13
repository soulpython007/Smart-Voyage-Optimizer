import type { GraphNode, StormZone, OceanCurrentCell, CostWeights, EdgeCostResult } from '../../types/index.js';
import { haversineDistance, initialBearing } from '../../utils/geo.js';
import type { OceanCurrentEngine } from '../../simulators/OceanCurrentEngine.js';

function pointInStorm(lat: number, lon: number, storms: StormZone[]): {
  severity: number;
  windSpeed: number;
  waveHeight: number;
} {
  let maxSeverity = 0;
  let windSpeed = 0;
  let waveHeight = 0;
  for (const storm of storms) {
    const dLat = (lat - storm.center[0]) * 111;
    const dLon = (lon - storm.center[1]) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < storm.radius) {
      const severity = storm.severity * (1 - dist / storm.radius);
      if (severity > maxSeverity) {
        maxSeverity = severity;
        windSpeed = storm.windSpeed * (1 - dist / storm.radius);
        waveHeight = storm.waveHeight * (1 - dist / storm.radius);
      }
    }
  }
  return { severity: maxSeverity, windSpeed, waveHeight };
}

function getCurrentAt(
  lat: number,
  lon: number,
  bearing: number,
  currentEngine: OceanCurrentEngine,
): { effect: number; speedKnots: number; direction: number } {
  let closest: OceanCurrentCell | null = null;
  let minDist = Infinity;
  for (const row of currentEngine.grid) {
    for (const cell of row) {
      const d = haversineDistance(lat, lon, cell.latitude, cell.longitude);
      if (d < minDist) {
        minDist = d;
        closest = cell;
      }
    }
  }
  if (!closest) return { effect: 0, speedKnots: 0, direction: 0 };

  const angleDiff = ((closest.direction - bearing + 540) % 360) - 180;
  const effect = -Math.cos((angleDiff * Math.PI) / 180) * closest.speedKnots;
  return { effect, speedKnots: closest.speedKnots, direction: closest.direction };
}

function computeFuelPenalty(stormSeverity: number, waveHeight: number, currentEffect: number): number {
  const headwindPenalty = 1 + stormSeverity * 0.5;
  const waveResistance = 1 + Math.max(0, waveHeight - 1) * 0.15;
  const opposingCurrent = Math.max(0, currentEffect);
  const currentResistance = 1 + opposingCurrent * 0.35;
  return headwindPenalty * waveResistance * currentResistance;
}

function computeSafetyPenalty(stormSeverity: number, waveHeight: number): number {
  if (stormSeverity <= 0) return 0;
  return stormSeverity * (3 + Math.max(0, waveHeight - 2) * 0.6);
}

function computeTimeFactor(currentEffect: number, stormSeverity: number): number {
  const assistingCurrent = Math.min(0, currentEffect);
  const currentAssist = 1 - assistingCurrent * 0.25;
  const weatherSlowdown = 1 + stormSeverity * 0.2;
  return currentAssist * weatherSlowdown;
}

export class CostEngine {
  constructor(
    private storms: StormZone[],
    private currentEngine: OceanCurrentEngine,
  ) {}

  evaluate(
    a: GraphNode,
    b: GraphNode,
    weights: CostWeights,
    destLat?: number,
    destLon?: number,
    biasMode?: 'eco' | 'fast' | 'safe',
  ): EdgeCostResult {
    const distKm = haversineDistance(a.lat, a.lon, b.lat, b.lon);
    const distNm = distKm / 1.852;

    const midLat = (a.lat + b.lat) / 2;
    const midLon = (a.lon + b.lon) / 2;

    const bearing = initialBearing(a.lat, a.lon, b.lat, b.lon);
    const storm = pointInStorm(midLat, midLon, this.storms);
    const current = getCurrentAt(midLat, midLon, bearing, this.currentEngine);

    const fuelPenalty = computeFuelPenalty(storm.severity, storm.waveHeight, current.effect);
    const safetyPenalty = computeSafetyPenalty(storm.severity, storm.waveHeight);
    const timeFactor = computeTimeFactor(current.effect, storm.severity);

    let modeBias = 1;
    if (biasMode === 'fast' && destLat !== undefined && destLon !== undefined) {
      const destBearing = initialBearing(a.lat, a.lon, destLat, destLon);
      const bearingDiff = (Math.abs(bearing - destBearing) + 540) % 360;
      const alignment = Math.max(0, 1 - Math.min(bearingDiff, 360 - bearingDiff) / 180);
      modeBias = 1.6 - alignment * 0.8;
    } else if (biasMode === 'eco' && current.effect !== 0) {
      const assist = -Math.min(0, current.effect);
      const oppose = Math.max(0, current.effect);
      modeBias = 1 - assist * 0.25 + oppose * 0.4;
    } else if (biasMode === 'safe') {
      if (storm.severity > 0) {
        modeBias = 1 + storm.severity * storm.severity * 2;
      }
    }

    const fuelCost = distNm * fuelPenalty;
    const safetyCost = distNm * (1 + safetyPenalty);
    const timeCost = distNm * timeFactor;

    const total = (weights.fuel * fuelCost + weights.time * timeCost + weights.safety * safetyCost) * modeBias;

    return {
      total,
      distanceNm: distNm,
      fuelPenalty,
      safetyPenalty,
      timeFactor,
    };
  }

  evaluateEdge(
    a: GraphNode,
    b: GraphNode,
    weights: CostWeights,
    destLat?: number,
    destLon?: number,
    biasMode?: 'eco' | 'fast' | 'safe',
  ): number {
    return this.evaluate(a, b, weights, destLat, destLon, biasMode).total;
  }
}
