import { useEffect, useState, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { useStore } from '../store/useStore';
import type { GeoJSONFeatureCollection } from '../types/maritime';
import type { ConnectionState } from '../components/ui/ConnectionStatus';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false' && import.meta.env.VITE_DEMO_MODE !== '0';

export function useWebSocket() {
  const setShips = useStore((s) => s.setShips);
  const setWeatherZones = useStore((s) => s.setWeatherZones);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    DEMO_MODE ? 'live' : 'offline',
  );

  const handleRetry = useCallback(() => {
    if (!DEMO_MODE) {
      wsService.disconnect();
      wsService.connect();
    }
  }, []);

  useEffect(() => {
    if (DEMO_MODE) {
      setConnectionState('live');
      return;
    }

    wsService.connect();

    const unsubInitial = wsService.on('initialState', (data) => {
      const state = data as { ships: GeoJSONFeatureCollection; weather: GeoJSONFeatureCollection };
      if (state.ships) setShips(state.ships);
      if (state.weather) setWeatherZones(state.weather);
    });

    const unsubShips = wsService.on('shipPositionUpdate', (data) => {
      setShips(data as GeoJSONFeatureCollection);
    });

    const unsubWeather = wsService.on('weatherUpdate', (data) => {
      setWeatherZones(data as GeoJSONFeatureCollection);
    });

    const unsubConnection = wsService.onConnectionState((state) => {
      setConnectionState(state);
    });

    return () => {
      unsubInitial();
      unsubShips();
      unsubWeather();
      unsubConnection();
      wsService.disconnect();
    };
  }, [setShips, setWeatherZones, DEMO_MODE]);

  return { connectionState, handleRetry, isDemoMode: DEMO_MODE };
}
