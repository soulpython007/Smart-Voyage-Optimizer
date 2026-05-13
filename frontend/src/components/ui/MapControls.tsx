import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export function MapControls() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const followShip = useStore((s) => s.followShip);
  const setFollowShip = useStore((s) => s.setFollowShip);
  const showWeather = useStore((s) => s.showWeather);
  const showCurrents = useStore((s) => s.showCurrents);
  const setShowWeather = useStore((s) => s.setShowWeather);
  const setShowCurrents = useStore((s) => s.setShowCurrents);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleFollowToggle = useCallback(() => {
    setFollowShip(followShip ? null : 'auto');
  }, [followShip, setFollowShip]);

  const resetView = useCallback(() => {
    const mapEl = document.querySelector('.leaflet-container') as any;
    if (mapEl?._leaflet_map) {
      mapEl._leaflet_map.setView([15, 60], 3, { animate: true, duration: 1.5 });
    }
    setFollowShip(null);
  }, [setFollowShip]);

  const buttons = [
    {
      label: 'Fullscreen',
      icon: isFullscreen ? '⛶' : '⛶',
      onClick: toggleFullscreen,
      active: isFullscreen,
    },
    {
      label: 'Follow Mode',
      icon: '◎',
      onClick: handleFollowToggle,
      active: !!followShip,
    },
    {
      label: 'Reset View',
      icon: '⌖',
      onClick: resetView,
      active: false,
    },
    {
      label: 'Weather',
      icon: '☁',
      onClick: () => setShowWeather(!showWeather),
      active: showWeather,
    },
    {
      label: 'Currents',
      icon: '〰',
      onClick: () => setShowCurrents(!showCurrents),
      active: showCurrents,
    },
  ];

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1.5">
      {buttons.map((btn) => (
        <motion.button
          key={btn.label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={btn.onClick}
          title={btn.label}
          className={`
            w-10 h-10 flex items-center justify-center rounded-xl text-sm
            border-2 transition-all duration-200 min-h-[40px] min-w-[40px]
            ${btn.active
              ? 'bg-blue-600/80 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
              : 'bg-gray-900/70 border-gray-600/50 text-gray-300 hover:bg-gray-800/80 hover:border-gray-500'
            }
            backdrop-blur-md
          `}
        >
          {btn.icon}
        </motion.button>
      ))}
    </div>
  );
}
