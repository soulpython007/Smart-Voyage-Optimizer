import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { tickMockShips, mockShipsFC, mockWeatherFC, mockCurrentsFC } from '../services/mockData';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false' && import.meta.env.VITE_DEMO_MODE !== '0';

let notifCounter = 0;

export function useDemoMode() {
  const setShips = useStore((s) => s.setShips);
  const setWeatherZones = useStore((s) => s.setWeatherZones);
  const setCurrents = useStore((s) => s.setCurrents);
  const addNotification = useStore((s) => s.addNotification);
  const ships = useStore((s) => s.ships);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickCountRef = useRef(0);

  useEffect(() => {
    if (!DEMO_MODE) return;

    intervalRef.current = setInterval(() => {
      tickMockShips();
      setShips(mockShipsFC());
      setWeatherZones(mockWeatherFC());
      setCurrents(mockCurrentsFC());

      tickCountRef.current++;

      if (tickCountRef.current % 6 === 0) {
        const maxSeverity = mockWeatherFC().features.reduce((max, f) => {
          const s = (f.properties as Record<string, unknown>)?.severity as number || 0;
          return Math.max(max, s);
        }, 0);

        if (maxSeverity >= 4.5) {
          addNotification({
            id: `storm-${++notifCounter}`,
            type: 'storm_warning',
            title: 'Storm Alert',
            message: `Severe weather detected (Severity: ${maxSeverity.toFixed(1)}). Route adjustments recommended.`,
            timestamp: Date.now(),
          });
        }

        const ships = mockShipsFC().features;
        for (const ship of ships.slice(0, 2)) {
          const props = ship.properties as Record<string, unknown>;
          const speed = props.speedKnots as number;
          if (speed < 3) {
            addNotification({
              id: `slow-${++notifCounter}`,
              type: 'congestion',
              title: 'Slow Vessel',
              message: `${props.name} is moving at ${speed.toFixed(1)} kn — possible congestion ahead.`,
              timestamp: Date.now(),
            });
          }
        }
      }

      if (tickCountRef.current % 12 === 0) {
        addNotification({
          id: `fuel-${++notifCounter}`,
          type: 'fuel_alert',
          title: 'Fuel Optimization',
          message: 'Eco route could save up to 18% fuel on current trajectory.',
          timestamp: Date.now(),
        });
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setShips, setWeatherZones, setCurrents, addNotification]);
}
