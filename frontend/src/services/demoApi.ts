import type { GeoJSONFeatureCollection, RouteRequest, OptimizeResponse } from '../types/maritime';
import { initMockShips, mockPortsFC, mockShipsFC, mockWeatherFC, mockCurrentsFC, mockRoutesFC } from './mockData';

let initialized = false;

function ensureInit() {
  if (!initialized) {
    initMockShips();
    initialized = true;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const demoApi = {
  async getPorts(): Promise<GeoJSONFeatureCollection> {
    ensureInit();
    await delay(200);
    return mockPortsFC();
  },

  async getShips(): Promise<GeoJSONFeatureCollection> {
    ensureInit();
    await delay(150);
    return mockShipsFC();
  },

  async getWeatherZones(): Promise<GeoJSONFeatureCollection> {
    ensureInit();
    await delay(250);
    return mockWeatherFC();
  },

  async getCurrents(): Promise<GeoJSONFeatureCollection> {
    ensureInit();
    await delay(200);
    return mockCurrentsFC();
  },

  async optimizeRoute(data: RouteRequest): Promise<OptimizeResponse> {
    ensureInit();
    await delay(800);
    return mockRoutesFC(data.from, data.to, data.mode);
  },
};
