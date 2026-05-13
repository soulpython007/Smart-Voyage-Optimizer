import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { useAuth } from '../../auth/useAuth';
import { useClock } from '../../hooks/useClock';
import type { ConnectionState } from '../ui/ConnectionStatus';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false' && import.meta.env.VITE_DEMO_MODE !== '0';

interface NavbarProps {
  connectionState?: ConnectionState;
  onRetryConnection?: () => void;
}

export function Navbar({ connectionState, onRetryConnection }: NavbarProps) {
  const ships = useStore((s) => s.ships);
  const routes = useStore((s) => s.routes);
  const isOptimizing = useStore((s) => s.isOptimizing);
  const weatherZones = useStore((s) => s.weatherZones);
  const { user, signOut } = useAuth();
  const clock = useClock();

  const shipCount = ships?.features?.length ?? 0;
  const routeCount = routes.length;

  const maxSeverity = weatherZones?.features?.reduce((max, f) => {
    const s = (f.properties as Record<string, unknown>)?.severity as number || 0;
    return Math.max(max, s);
  }, 0) ?? 0;

  const severityLabel = maxSeverity < 2 ? 'Calm' : maxSeverity < 4 ? 'Moderate' : 'Severe';
  const severityColor = maxSeverity < 2 ? '#22c55e' : maxSeverity < 4 ? '#eab308' : '#ef4444';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b-2 border-black/10 dark:border-blue-900/30 shadow-neobrutalist dark:shadow-[0_2px_0_0_rgba(30,58,95,0.5)]"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-black/20 dark:border-blue-400/30 rounded-xl flex items-center justify-center shadow-neobrutalist dark:shadow-[0_2px_0_0_rgba(59,130,246,0.3)]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M12 2 L4 20 L12 16 L20 20 Z" />
            </svg>
          </motion.div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight dark:text-white">Smart Voyage</h1>
            <span className="text-[10px] text-gray-400 dark:text-blue-400/60 font-mono">
              {clock.toUTCString().split('GMT')[0].trim()} UTC
            </span>
          </div>
          {DEMO_MODE && (
            <span className="text-[10px] font-extrabold text-yellow-700 bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-500/50 px-2 py-0.5 rounded-lg uppercase tracking-wider backdrop-blur-sm">
              Demo
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden sm:flex items-center gap-2"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100/80 dark:bg-gray-800/40 rounded-lg border border-gray-200/50 dark:border-gray-700/30">
              <div
                className="connection-pulse"
                style={{
                  background: `${severityColor}`,
                  boxShadow: `0 0 6px ${severityColor}66`,
                }}
              />
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{severityLabel}</span>
            </div>
          </motion.div>

          <Badge variant="info">
            {shipCount} ship{shipCount !== 1 ? 's' : ''}
          </Badge>
          {routeCount > 0 && (
            <Badge variant="success">
              {routeCount} route{routeCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {isOptimizing && (
            <Badge variant="warning">Optimizing...</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {connectionState && (
            <div className="flex items-center gap-1.5">
              <div className={`connection-pulse ${connectionState}`} />
              <ConnectionStatus state={connectionState} />
            </div>
          )}
          <DarkModeToggle />
          {user && (
            <button
              onClick={signOut}
              className="text-[11px] font-bold text-gray-400 hover:text-red-400 transition-colors min-h-[44px] flex items-center px-2"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
