import { create } from 'zustand';
import type { GeoJSONFeatureCollection, RouteInfo, OptimizationMode } from '../types/maritime';
import { api } from '../services/api';
import { demoApi } from '../services/demoApi';
import { initMockShips } from '../services/mockData';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false' && import.meta.env.VITE_DEMO_MODE !== '0';

interface OptimizationSettings {
  departure: string;
  destination: string;
  selectedShip: string;
  mode: OptimizationMode;
  weights: { fuel: number; time: number; safety: number };
}

interface AppState {
  ships: GeoJSONFeatureCollection;
  weatherZones: GeoJSONFeatureCollection;
  currents: GeoJSONFeatureCollection;
  ports: GeoJSONFeatureCollection;

  routes: RouteInfo[];
  selectedRouteIndex: number | null;

  showCurrents: boolean;
  showWeather: boolean;
  isOptimizing: boolean;
  error: string | null;
  loading: boolean;

  settings: OptimizationSettings;

  setShips: (ships: GeoJSONFeatureCollection) => void;
  setWeatherZones: (zones: GeoJSONFeatureCollection) => void;
  setCurrents: (currents: GeoJSONFeatureCollection) => void;
  setPorts: (ports: GeoJSONFeatureCollection) => void;

  setRoutes: (routes: RouteInfo[]) => void;
  selectRoute: (index: number | null) => void;

  setShowCurrents: (show: boolean) => void;
  setShowWeather: (show: boolean) => void;

  updateSettings: (partial: Partial<OptimizationSettings>) => void;
  updateWeights: (weights: { fuel?: number; time?: number; safety?: number }) => void;

  optimize: () => Promise<void>;
  fetchInitialData: () => Promise<void>;
}

async function tryWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await primary();
  } catch {
    return fallback();
  }
}

export const useStore = create<AppState>((set, get) => ({
  ships: { type: 'FeatureCollection', features: [] },
  weatherZones: { type: 'FeatureCollection', features: [] },
  currents: { type: 'FeatureCollection', features: [] },
  ports: { type: 'FeatureCollection', features: [] },

  routes: [],
  selectedRouteIndex: null,

  showCurrents: false,
  showWeather: true,
  isOptimizing: false,
  error: null,
  loading: true,

  settings: {
    departure: '',
    destination: '',
    selectedShip: '',
    mode: 'eco',
    weights: { fuel: 33, time: 33, safety: 34 },
  },

  setShips: (ships) => set({ ships }),
  setWeatherZones: (weatherZones) => set({ weatherZones }),
  setCurrents: (currents) => set({ currents }),
  setPorts: (ports) => set({ ports }),

  setRoutes: (routes) => set({ routes, selectedRouteIndex: routes.length > 0 ? 0 : null }),
  selectRoute: (selectedRouteIndex) => set({ selectedRouteIndex }),

  setShowCurrents: (showCurrents) => set({ showCurrents }),
  setShowWeather: (showWeather) => set({ showWeather }),

  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  updateWeights: (partial) =>
    set((state) => ({
      settings: {
        ...state.settings,
        weights: { ...state.settings.weights, ...partial },
      },
    })),

  optimize: async () => {
    const { settings } = get();
    if (!settings.departure || !settings.destination) {
      set({ error: 'Select departure and destination ports', isOptimizing: false });
      return;
    }

    set({ isOptimizing: true, error: null });
    try {
      const apiCall = DEMO_MODE ? demoApi : api;
      const result = await apiCall.optimizeRoute({
        from: settings.departure,
        to: settings.destination,
        shipId: settings.selectedShip || undefined,
        mode: settings.mode,
        weights: settings.weights,
      });
      set({ routes: result.routes, selectedRouteIndex: 0, isOptimizing: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Optimization failed', isOptimizing: false });
    }
  },

  fetchInitialData: async () => {
    set({ loading: true, error: null });
    try {
      const apiCall = DEMO_MODE ? demoApi : api;

      const primary = async () => {
        const [ports, ships, weatherZones, currents] = await Promise.all([
          api.getPorts(),
          api.getShips(),
          api.getWeatherZones(),
          api.getCurrents(),
        ]);
        return { ports, ships, weatherZones, currents };
      };

      const fallback = async () => {
        initMockShips();
        const [ports, ships, weatherZones, currents] = await Promise.all([
          demoApi.getPorts(),
          demoApi.getShips(),
          demoApi.getWeatherZones(),
          demoApi.getCurrents(),
        ]);
        return { ports, ships, weatherZones, currents };
      };

      const data = DEMO_MODE ? await fallback() : await tryWithFallback(primary, fallback);
      set({ ...data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load data', loading: false });
    }
  },
}));
