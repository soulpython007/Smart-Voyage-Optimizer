export interface Port {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Ship {
  id: string;
  name: string;
  type: string;
  draft: number;
  maxSpeedKnots: number;
  fuelConsumptionRate: number;
  currentPosition: { latitude: number; longitude: number };
  destination: string;
}

export interface ShipProperties {
  id: string;
  name: string;
  type: string;
  heading: number;
  speedKnots: number;
  eta: number;
  destination: string;
  draft: number;
}

export type OptimizationMode = 'eco' | 'fast' | 'safe' | 'custom';

export interface RouteRequest {
  from: string;
  to: string;
  shipId?: string;
  mode: OptimizationMode;
  weights: {
    fuel: number;
    time: number;
    safety: number;
  };
}

export interface RouteInfo {
  mode: OptimizationMode;
  waypoints: Waypoint[];
  geojson: GeoJSONFeature;
  distanceNm: number;
  etaHours: number;
  fuelEstimateTonnes: number;
  riskScore: number;
  avgSpeedKnots: number;
}

export interface OptimizeResponse {
  routes: RouteInfo[];
  from: string;
  to: string;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface WeatherProperties {
  id: string;
  severity: number;
  windSpeed: number;
  waveHeight: number;
  lifecycle: string;
}

export interface CurrentProperties {
  direction: number;
  speedKnots: number;
}

export interface WebSocketState {
  ships: GeoJSONFeatureCollection;
  weather: GeoJSONFeatureCollection;
}

export const MODE_PROFILES: Record<OptimizationMode, { label: string; description: string; fuel: number; time: number; safety: number }> = {
  eco: { label: 'Eco', description: 'Minimum fuel consumption', fuel: 80, time: 15, safety: 5 },
  fast: { label: 'Fast', description: 'Shortest transit time', fuel: 10, time: 80, safety: 10 },
  safe: { label: 'Safe', description: 'Safest passage', fuel: 20, time: 20, safety: 60 },
  custom: { label: 'Custom', description: 'Manual weight tuning', fuel: 33, time: 33, safety: 34 },
};

export const ROUTE_COLORS: Record<OptimizationMode, { color: string; dash: string }> = {
  eco: { color: '#22c55e', dash: '10, 8' },
  fast: { color: '#3b82f6', dash: '1, 0' },
  safe: { color: '#f97316', dash: '2, 6' },
  custom: { color: '#8b5cf6', dash: '8, 4' },
};
