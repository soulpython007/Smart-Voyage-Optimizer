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

export interface ShipState extends Ship {
  heading: number;
  speedKnots: number;
  route: Waypoint[];
  waypointIndex: number;
  eta: number;
}

export interface StormZone {
  id: string;
  center: [number, number];
  radius: number;
  severity: number;
  windSpeed: number;
  waveHeight: number;
  movementVector: [number, number];
  lifecycle: 'growing' | 'stable' | 'dying';
}

export interface OceanCurrentCell {
  latitude: number;
  longitude: number;
  direction: number;
  speedKnots: number;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
}

export interface GraphNode {
  id: number;
  lat: number;
  lon: number;
  row: number;
  col: number;
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

export interface SimulationSnapshot {
  ships: GeoJSONFeatureCollection;
  weather: GeoJSONFeatureCollection;
  currents: GeoJSONFeatureCollection;
}

export interface CostWeights {
  fuel: number;
  time: number;
  safety: number;
}

export interface EdgeCostResult {
  total: number;
  distanceNm: number;
  fuelPenalty: number;
  safetyPenalty: number;
  timeFactor: number;
}

export interface ModeProfile {
  label: string;
  description: string;
  weights: CostWeights;
}

export interface SavedRoute {
  id: string;
  user_id: string;
  name: string;
  departure_port_id: string;
  departure_port_name: string;
  destination_port_id: string;
  destination_port_name: string;
  mode: string;
  waypoints: Waypoint[];
  distance_nm: number | null;
  eta_hours: number | null;
  fuel_estimate_tonnes: number | null;
  risk_score: number | null;
  route_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface VoyageHistoryEntry {
  id: string;
  user_id: string;
  route_id: string | null;
  departure_port_id: string;
  departure_port_name: string;
  destination_port_id: string;
  destination_port_name: string;
  mode: string;
  distance_nm: number | null;
  eta_hours: number | null;
  fuel_estimate_tonnes: number | null;
  risk_score: number | null;
  optimization_result: Record<string, unknown> | null;
  started_at: string;
  completed_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  dark_mode: boolean;
  preferred_optimization_mode: string;
  map_settings: { zoom: number; center: [number, number] };
  selected_ship_type: string;
  show_weather: boolean;
  show_currents: boolean;
  created_at: string;
  updated_at: string;
}
