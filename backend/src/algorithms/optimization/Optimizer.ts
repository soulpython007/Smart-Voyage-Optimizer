import type {
  OptimizationMode,
  CostWeights,
  RouteInfo,
  Waypoint,
  ModeProfile,
  GeoJSONFeature,
  StormZone,
} from '../../types/index.js';
import type { WaypointGraph } from '../graph/WaypointGraph.js';
import { AStarRouter } from '../astar/AStarRouter.js';
import type { CostEngine } from '../costs/CostEngine.js';
import { haversineDistance, kmToNauticalMiles } from '../../utils/geo.js';

const MODE_PROFILES: Record<Exclude<OptimizationMode, 'custom'>, ModeProfile> = {
  eco: {
    label: 'Eco',
    description: 'Fuel-efficient route minimizing consumption',
    weights: { fuel: 0.7, time: 0.15, safety: 0.15 },
  },
  fast: {
    label: 'Fast',
    description: 'Shortest travel time route',
    weights: { fuel: 0.1, time: 0.8, safety: 0.1 },
  },
  safe: {
    label: 'Safe',
    description: 'Storm-avoidance prioritized route',
    weights: { fuel: 0.1, time: 0.15, safety: 0.75 },
  },
};

function computeRiskScore(waypoints: Waypoint[], storms: StormZone[]): number {
  let totalRisk = 0;
  for (const wp of waypoints) {
    for (const storm of storms) {
      const dLat = (wp.latitude - storm.center[0]) * 111;
      const dLon = (wp.longitude - storm.center[1]) * 111 * Math.cos((wp.latitude * Math.PI) / 180);
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      if (dist < storm.radius) {
        totalRisk += storm.severity * (1 - dist / storm.radius);
      }
    }
  }
  return waypoints.length > 0 ? totalRisk / waypoints.length : 0;
}

function convertToWaypoints(graph: WaypointGraph, nodeIds: number[]): Waypoint[] {
  return nodeIds.map((id) => {
    const n = graph.getNode(id)!;
    return { latitude: n.lat, longitude: n.lon };
  });
}

function buildGeoJSON(waypoints: Waypoint[], mode: string, metrics: Record<string, unknown>): GeoJSONFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: waypoints.map((wp) => [wp.longitude, wp.latitude]),
    },
    properties: { mode, ...metrics },
  };
}

export interface OptimizerInput {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  shipSpeedKnots: number;
  shipFuelRate: number;
  mode: OptimizationMode;
  customWeights?: CostWeights;
}

export class RouteOptimizerEngine {
  private router = new AStarRouter();

  constructor(
    private graph: WaypointGraph,
    private costEngine: CostEngine,
    private storms: StormZone[],
  ) {}

  computeRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    weights: CostWeights,
    shipSpeedKnots: number,
    shipFuelRate: number,
    mode: OptimizationMode,
  ): RouteInfo | null {
    const costFn = (fromId: number, toId: number): number => {
      const a = this.graph.getNode(fromId)!;
      const b = this.graph.getNode(toId)!;
      return this.costEngine.evaluateEdge(a, b, weights, endLat, endLon, mode as 'eco' | 'fast' | 'safe');
    };

    const result = this.router.findPath(this.graph, startLat, startLon, endLat, endLon, costFn);
    if (!result.found || result.path.length < 2) return null;

    const waypoints = convertToWaypoints(this.graph, result.path);

    let totalDistanceKm = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistanceKm += haversineDistance(
        waypoints[i].latitude, waypoints[i].longitude,
        waypoints[i + 1].latitude, waypoints[i + 1].longitude,
      );
    }
    const distanceNm = kmToNauticalMiles(totalDistanceKm);

    const fuelRateNm = shipFuelRate / 1.852;
    const baseFuel = distanceNm * fuelRateNm;
    const fuelEfficiencyFactor = 1 - (weights.fuel - 0.33) * 0.4;
    const fuelEstimate = baseFuel * fuelEfficiencyFactor;

    const effectiveSpeed = shipSpeedKnots * (0.85 + weights.time * 0.15);
    const etaHours = distanceNm / Math.max(2, effectiveSpeed);

    const riskScore = computeRiskScore(waypoints, this.storms);

    const geoJSON = buildGeoJSON(waypoints, mode, {
      distanceNm: Math.round(distanceNm * 100) / 100,
      etaHours: Math.round(etaHours * 10) / 10,
      fuelEstimate: Math.round(fuelEstimate * 100) / 100,
      riskScore: Math.round(riskScore * 100) / 100,
    });

    return {
      mode,
      waypoints,
      geojson: geoJSON,
      distanceNm: Math.round(distanceNm * 100) / 100,
      etaHours: Math.round(etaHours * 10) / 10,
      fuelEstimateTonnes: Math.round(fuelEstimate * 100) / 100,
      riskScore: Math.round(riskScore * 100) / 100,
      avgSpeedKnots: Math.round(effectiveSpeed * 10) / 10,
    };
  }

  computeAllModes(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    shipSpeedKnots: number,
    shipFuelRate: number,
    mode: OptimizationMode,
    customWeights?: CostWeights,
  ): RouteInfo[] {
    const modesToRun: { mode: OptimizationMode; weights: CostWeights }[] = [];

    if (mode === 'custom' && customWeights) {
      const w = {
        fuel: Math.max(0, Math.min(1, customWeights.fuel)),
        time: Math.max(0, Math.min(1, customWeights.time)),
        safety: Math.max(0, Math.min(1, customWeights.safety)),
      };
      modesToRun.push({ mode: 'eco', weights: MODE_PROFILES.eco.weights });
      modesToRun.push({ mode: 'fast', weights: MODE_PROFILES.fast.weights });
      modesToRun.push({ mode: 'safe', weights: MODE_PROFILES.safe.weights });
      modesToRun.push({ mode: 'custom', weights: w });
    } else if (mode === 'eco' || mode === 'fast' || mode === 'safe') {
      modesToRun.push({ mode: 'eco', weights: MODE_PROFILES.eco.weights });
      modesToRun.push({ mode: 'fast', weights: MODE_PROFILES.fast.weights });
      modesToRun.push({ mode: 'safe', weights: MODE_PROFILES.safe.weights });
    }

    const results: RouteInfo[] = [];
    for (const { mode: m, weights } of modesToRun) {
      const route = this.computeRoute(
        startLat, startLon,
        endLat, endLon,
        weights,
        shipSpeedKnots,
        shipFuelRate,
        m,
      );
      if (route) results.push(route);
    }

    return results;
  }
}
