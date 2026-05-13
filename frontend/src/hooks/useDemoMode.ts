import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { tickMockShips, mockShipsFC, mockWeatherFC, mockCurrentsFC } from '../services/mockData';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false' && import.meta.env.VITE_DEMO_MODE !== '0';

export function useDemoMode() {
  const setShips = useStore((s) => s.setShips);
  const setWeatherZones = useStore((s) => s.setWeatherZones);
  const setCurrents = useStore((s) => s.setCurrents);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!DEMO_MODE) return;

    intervalRef.current = setInterval(() => {
      tickMockShips();
      setShips(mockShipsFC());
      setWeatherZones(mockWeatherFC());
      setCurrents(mockCurrentsFC());
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setShips, setWeatherZones, setCurrents]);
}
