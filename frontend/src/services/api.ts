import type { GeoJSONFeatureCollection, RouteRequest, OptimizeResponse } from '../types/maritime';

const BASE_URL = 'http://localhost:4000';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getPorts(): Promise<GeoJSONFeatureCollection> {
    return fetchJSON('/api/ports');
  },

  getShips(): Promise<GeoJSONFeatureCollection> {
    return fetchJSON('/api/ships');
  },

  getWeatherZones(): Promise<GeoJSONFeatureCollection> {
    return fetchJSON('/api/weather/zones');
  },

  getCurrents(): Promise<GeoJSONFeatureCollection> {
    return fetchJSON('/api/currents');
  },

  optimizeRoute(data: RouteRequest): Promise<OptimizeResponse> {
    return fetchJSON('/api/optimize-route', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
