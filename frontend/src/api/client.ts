import { API_CONFIG } from './config';
import type {
  GeoJSONFeatureCollection,
  RouteRequest,
  OptimizeResponse,
} from '../types/maritime';

export interface SavedRoute {
  id: string;
  user_id: string;
  name: string;
  departure_port_id: string;
  departure_port_name: string;
  destination_port_id: string;
  destination_port_name: string;
  mode: string;
  waypoints: { latitude: number; longitude: number }[];
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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('sb-access-token')
      : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: this.getAuthHeaders(),
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  }

  getPorts(): Promise<GeoJSONFeatureCollection> {
    return this.request('/api/ports');
  }

  getShips(): Promise<GeoJSONFeatureCollection> {
    return this.request('/api/ships');
  }

  getWeatherZones(): Promise<GeoJSONFeatureCollection> {
    return this.request('/api/weather/zones');
  }

  getCurrents(): Promise<GeoJSONFeatureCollection> {
    return this.request('/api/currents');
  }

  optimizeRoute(data: RouteRequest): Promise<OptimizeResponse> {
    return this.request('/api/optimize-route', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getSavedRoutes(): Promise<SavedRoute[]> {
    return this.request('/api/saved-routes');
  }

  saveRoute(data: Partial<SavedRoute>): Promise<SavedRoute> {
    return this.request('/api/saved-routes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  deleteSavedRoute(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/saved-routes/${id}`, { method: 'DELETE' });
  }

  getVoyageHistory(limit = 20): Promise<VoyageHistoryEntry[]> {
    return this.request(`/api/voyage-history?limit=${limit}`);
  }

  saveVoyageHistory(data: Partial<VoyageHistoryEntry>): Promise<VoyageHistoryEntry> {
    return this.request('/api/voyage-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getPreferences(): Promise<UserPreferences> {
    return this.request('/api/preferences');
  }

  updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.request('/api/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_CONFIG.baseUrl);
