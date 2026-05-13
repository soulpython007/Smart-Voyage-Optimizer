import type { GeoJSONFeatureCollection, RouteInfo, OptimizeResponse } from '../types/maritime';

const PORTS = [
  { id: 'sg-sin', name: 'Port of Singapore', country: 'Singapore', lat: 1.2789, lon: 103.8389 },
  { id: 'lk-col', name: 'Port of Colombo', country: 'Sri Lanka', lat: 6.9418, lon: 79.8426 },
  { id: 'in-mum', name: 'Jawaharlal Nehru Port', country: 'India', lat: 18.95, lon: 72.95 },
  { id: 'in-chennai', name: 'Chennai Port', country: 'India', lat: 13.0827, lon: 80.2707 },
  { id: 'my-pkl', name: 'Port Klang', country: 'Malaysia', lat: 3.003, lon: 101.3917 },
  { id: 'dj-jib', name: 'Port of Djibouti', country: 'Djibouti', lat: 11.588, lon: 43.1499 },
  { id: 'eg-suez', name: 'Port of Suez', country: 'Egypt', lat: 29.9668, lon: 32.5496 },
  { id: 'sa-jed', name: 'Port of Jeddah', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1865 },
  { id: 'ke-mba', name: 'Port of Mombasa', country: 'Kenya', lat: -4.0435, lon: 39.6682 },
  { id: 'id-tjpriok', name: 'Tanjung Priok', country: 'Indonesia', lat: -6.1, lon: 106.8833 },
];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function gcInterp(lat1: number, lon1: number, lat2: number, lon2: number, f: number) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;

  if (Math.abs(dLon) < 0.0001) {
    const lat = lat1 + (lat2 - lat1) * f;
    return { latitude: lat, longitude: lon1 + (lon2 - lon1) * f };
  }

  const sinDLon = Math.sin(dLon);
  const a = Math.sin((1 - f) * dLon) / sinDLon;
  const b = Math.sin(f * dLon) / sinDLon;
  const x = a * Math.cos(rLat1) + b * Math.cos(rLat2);
  const y = a * Math.sin(rLat1) + b * Math.sin(rLat2);

  let rawLon = lon1 + f * ((lon2 - lon1 + 540) % 360 - 180);
  rawLon = ((rawLon % 360) + 540) % 360 - 180;

  return {
    latitude: (Math.atan2(y, x) * 180) / Math.PI,
    longitude: rawLon,
  };
}

function buildGreatCircleRoute(fromLat: number, fromLon: number, toLat: number, toLon: number): { latitude: number; longitude: number }[] {
  const steps = 30;
  const route = [];
  for (let i = 0; i <= steps; i++) {
    route.push(gcInterp(fromLat, fromLon, toLat, toLon, i / steps));
  }
  return route;
}

function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SHIP_DATA = [
  { id: 'shp-001', name: 'MV Maersk Chennai', type: 'Container Ship', draft: 14.5, maxSpeed: 22, fuel: 185, fromPort: 'sg-sin', toPort: 'in-mum' },
  { id: 'shp-002', name: 'MV Ever Given', type: 'Container Ship', draft: 15.7, maxSpeed: 20, fuel: 210, fromPort: 'dj-jib', toPort: 'eg-suez' },
  { id: 'shp-003', name: 'MT Marlin Luanda', type: 'Crude Oil Tanker', draft: 20.5, maxSpeed: 14, fuel: 140, fromPort: 'my-pkl', toPort: 'in-mum' },
  { id: 'shp-004', name: 'MV APL Southampton', type: 'Container Ship', draft: 13.8, maxSpeed: 24, fuel: 195, fromPort: 'lk-col', toPort: 'sg-sin' },
  { id: 'shp-005', name: 'MT BW Tulip', type: 'LNG Tanker', draft: 11.2, maxSpeed: 18, fuel: 160, fromPort: 'ke-mba', toPort: 'dj-jib' },
  { id: 'shp-006', name: 'MV COSCO Shipping Virgo', type: 'Container Ship', draft: 15.0, maxSpeed: 21, fuel: 200, fromPort: 'in-chennai', toPort: 'my-pkl' },
  { id: 'shp-007', name: 'MV Hyundai Together', type: 'Container Ship', draft: 14.2, maxSpeed: 23, fuel: 190, fromPort: 'my-pkl', toPort: 'sa-jed' },
  { id: 'shp-008', name: 'MT Suezmax Pride', type: 'Crude Oil Tanker', draft: 18.8, maxSpeed: 13, fuel: 130, fromPort: 'eg-suez', toPort: 'sa-jed' },
  { id: 'shp-009', name: 'MV MSC Diana', type: 'Container Ship', draft: 14.9, maxSpeed: 22, fuel: 180, fromPort: 'sa-jed', toPort: 'lk-col' },
  { id: 'shp-010', name: 'MV Safeen Prime', type: 'Bulk Carrier', draft: 16.5, maxSpeed: 15, fuel: 120, fromPort: 'id-tjpriok', toPort: 'in-mum' },
];

interface ShipState {
  id: string;
  name: string;
  type: string;
  draft: number;
  fuelConsumptionRate: number;
  route: { latitude: number; longitude: number }[];
  waypointIndex: number;
  currentPos: { latitude: number; longitude: number };
  heading: number;
  speedKnots: number;
  maxSpeed: number;
  eta: number;
  destination: string;
}

let shipStates: ShipState[] = [];
let weatherTick = 0;

export function initMockShips(): ShipState[] {
  shipStates = SHIP_DATA.map((s) => {
    const from = PORTS.find((p) => p.id === s.fromPort)!;
    const to = PORTS.find((p) => p.id === s.toPort)!;
    const route = buildGreatCircleRoute(from.lat, from.lon, to.lat, to.lon);
    const progress = rand(0.05, 0.85);
    const idx = Math.floor(progress * (route.length - 1));
    const pos = route[idx] || route[0];
    const totalNm = haversine(from.lat, from.lon, to.lat, to.lon);
    const remainingNm = haversine(pos.latitude, pos.longitude, to.lat, to.lon);
    const speed = s.maxSpeed * rand(0.65, 0.9);

    return {
      id: s.id,
      name: s.name,
      type: s.type,
      draft: s.draft,
      fuelConsumptionRate: s.fuel,
      route,
      waypointIndex: idx,
      currentPos: pos,
      heading: 0,
      speedKnots: speed,
      maxSpeed: s.maxSpeed,
      eta: remainingNm / speed,
      destination: s.toPort,
    };
  });
  return shipStates;
}

export function tickMockShips(): ShipState[] {
  for (const ship of shipStates) {
    const idx = ship.waypointIndex;
    if (idx >= ship.route.length - 1) continue;

    const from = ship.route[idx];
    const to = ship.route[idx + 1];
    const segKm = haversine(from.latitude, from.longitude, to.latitude, to.longitude);
    const speedKmh = ship.speedKnots * 1.852;
    const travelKm = speedKmh * (5 / 3600);
    const fraction = segKm > 0 ? travelKm / segKm : 1;
    const clamped = Math.min(fraction, 1);

    const moved = gcInterp(from.latitude, from.longitude, to.latitude, to.longitude, clamped);
    moved.latitude += rand(-0.002, 0.002);
    moved.longitude += rand(-0.002, 0.002);

    ship.currentPos = moved;
    ship.heading = bearing(from.latitude, from.longitude, to.latitude, to.longitude);

    if (clamped >= 0.99 && idx < ship.route.length - 1) {
      ship.waypointIndex++;
    }

    const dest = ship.route[ship.route.length - 1];
    const remainingNm = haversine(moved.latitude, moved.longitude, dest.latitude, dest.longitude);
    ship.eta = remainingNm / ship.speedKnots;
    ship.speedKnots += rand(-0.15, 0.15);
    ship.speedKnots = Math.max(2, Math.min(ship.maxSpeed, ship.speedKnots));
  }
  return shipStates;
}

export function mockPortsFC(): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: PORTS.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: { id: p.id, name: p.name, country: p.country },
    })),
  };
}

export function mockShipsFC(ships?: ShipState[]): GeoJSONFeatureCollection {
  const list = ships || shipStates;
  return {
    type: 'FeatureCollection',
    features: list.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.currentPos.longitude, s.currentPos.latitude] },
      properties: {
        id: s.id,
        name: s.name,
        type: s.type,
        heading: Math.round(s.heading * 10) / 10,
        speedKnots: Math.round(s.speedKnots * 10) / 10,
        eta: Math.round(s.eta * 10) / 10,
        destination: s.destination,
        draft: s.draft,
      },
    })),
  };
}

export function mockWeatherFC(): GeoJSONFeatureCollection {
  weatherTick++;
  const drift = weatherTick * 0.005;
  const storms = [
    { lat: 0 + drift, lon: 82 + drift * 0.5, radius: 200, severity: 1.2 + Math.sin(weatherTick * 0.1) * 0.3 },
    { lat: 8 - drift, lon: 62 + drift, radius: 180, severity: 3.5 + Math.sin(weatherTick * 0.08) * 0.4 },
    { lat: -4 + drift * 0.7, lon: 92 - drift * 0.3, radius: 150, severity: 5.2 + Math.sin(weatherTick * 0.12) * 0.3 },
    { lat: 14 + drift * 0.3, lon: 68 - drift * 0.5, radius: 160, severity: 2.8 + Math.sin(weatherTick * 0.09) * 0.5 },
    { lat: -2 - drift * 0.4, lon: 50 + drift * 0.8, radius: 220, severity: 5.8 + Math.sin(weatherTick * 0.11) * 0.4 },
    { lat: 5 + drift * 0.6, lon: 104 - drift * 0.2, radius: 140, severity: 1.8 + Math.sin(weatherTick * 0.07) * 0.3 },
    { lat: 22 - drift * 0.2, lon: 58 + drift * 0.6, radius: 120, severity: 4.2 + Math.sin(weatherTick * 0.13) * 0.5 },
    { lat: -7 + drift * 0.5, lon: 70 + drift * 0.4, radius: 170, severity: 0.8 + Math.sin(weatherTick * 0.06) * 0.4 },
  ];

  return {
    type: 'FeatureCollection',
    features: storms.map((s, i) => {
      const pts: number[][] = [];
      const segments = 20;
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * 2 * Math.PI;
        const dLat = (s.radius / 111) * Math.cos(angle);
        const dLon = (s.radius / (111 * Math.cos((s.lat * Math.PI) / 180))) * Math.sin(angle);
        pts.push([s.lon + dLon, s.lat + dLat]);
      }
      return {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [pts] },
        properties: {
          id: `storm-${i}`,
          severity: Math.round(s.severity * 10) / 10,
          windSpeed: Math.round((10 + s.severity * 12 + rand(-3, 3)) * 10) / 10,
          waveHeight: Math.round((1 + s.severity * 1.8 + rand(-0.5, 0.5)) * 10) / 10,
          lifecycle: s.severity > 4 ? 'growing' : s.severity > 2 ? 'stable' : 'dying',
        },
      };
    }),
  };
}

let currentTick = 0;

export function mockCurrentsFC(): GeoJSONFeatureCollection {
  currentTick++;
  const features: GeoJSONFeatureCollection['features'] = [];
  const GRID = 8;
  const tide = Math.sin(currentTick * 0.05) * 0.3;
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const lat = -8 + (r / (GRID - 1)) * 38;
      const lon = 32 + (c / (GRID - 1)) * 76;
      const timeOffset = currentTick * 0.02;
      const dir = (90
        + Math.sin((lat + 8) / 38 * Math.PI * 2 + timeOffset) * 40
        + Math.sin(lon / 76 * Math.PI * 2 + timeOffset * 0.7) * 30
        + tide * 10
        + 360) % 360;
      const speed = Math.max(0.2, 0.5 + Math.sin((lat + 8) / 38 * Math.PI * 2 + timeOffset * 1.3) * 1 + Math.random() * 1.5 + tide);
      features.push({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [lon, lat] },
        properties: {
          direction: Math.round(dir * 10) / 10,
          speedKnots: Math.round(speed * 100) / 100,
        },
      });
    }
  }
  return { type: 'FeatureCollection', features };
}

export function mockRoutesFC(fromId: string, toId: string, mode: string): OptimizeResponse {
  const from = PORTS.find((p) => p.id === fromId) || PORTS[0];
  const to = PORTS.find((p) => p.id === toId) || PORTS[1];

  const baseRoute = buildGreatCircleRoute(from.lat, from.lon, to.lat, to.lon);
  const totalNm = haversine(from.lat, from.lon, to.lat, to.lon);

  function offsetRoute(route: { latitude: number; longitude: number }[], latOff: number, lonOff: number): { latitude: number; longitude: number }[] {
    const result = route.map((p, i) => {
      if (i === 0) return { latitude: from.lat, longitude: from.lon };
      if (i === route.length - 1) return { latitude: to.lat, longitude: to.lon };
      return {
        latitude: p.latitude + latOff,
        longitude: p.longitude + lonOff,
      };
    });
    return result;
  }

  function toGeoJSON(waypoints: { latitude: number; longitude: number }[]): GeoJSONFeatureCollection['features'][0] {
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map((p) => [p.longitude, p.latitude]),
      },
      properties: {},
    };
  }

  const ecoWaypoints = offsetRoute(baseRoute, rand(-0.3, 0.3), rand(-0.3, 0.3));
  const fastWaypoints = offsetRoute(baseRoute, rand(-0.2, 0.2), rand(-0.2, 0.2));
  const safeWaypoints = offsetRoute(baseRoute, rand(-0.5, 0.5), rand(-0.5, 0.5));

  const routes: RouteInfo[] = [
    {
      mode: 'eco',
      waypoints: ecoWaypoints,
      geojson: toGeoJSON(ecoWaypoints),
      distanceNm: Math.round(totalNm * rand(1.02, 1.08)),
      etaHours: Math.round((totalNm / 14) * rand(1, 1.05) * 10) / 10,
      fuelEstimateTonnes: Math.round(totalNm * rand(0.12, 0.15)),
      riskScore: Math.round(rand(15, 25)),
      avgSpeedKnots: Math.round(rand(13, 15) * 10) / 10,
    },
    {
      mode: 'fast',
      waypoints: fastWaypoints,
      geojson: toGeoJSON(fastWaypoints),
      distanceNm: Math.round(totalNm * rand(0.98, 1.02)),
      etaHours: Math.round((totalNm / 22) * rand(0.95, 1) * 10) / 10,
      fuelEstimateTonnes: Math.round(totalNm * rand(0.18, 0.22)),
      riskScore: Math.round(rand(35, 50)),
      avgSpeedKnots: Math.round(rand(20, 23) * 10) / 10,
    },
    {
      mode: 'safe',
      waypoints: safeWaypoints,
      geojson: toGeoJSON(safeWaypoints),
      distanceNm: Math.round(totalNm * rand(1.12, 1.25)),
      etaHours: Math.round((totalNm / 16) * rand(1.1, 1.2) * 10) / 10,
      fuelEstimateTonnes: Math.round(totalNm * rand(0.14, 0.17)),
      riskScore: Math.round(rand(5, 12)),
      avgSpeedKnots: Math.round(rand(15, 17) * 10) / 10,
    },
  ];

  return { routes, from: fromId, to: toId };
}
