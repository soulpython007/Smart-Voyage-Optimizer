import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ROUTE_COLORS, MODE_PROFILES } from '../../types/maritime';

const statVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function RouteDetailPanel() {
  const routes = useStore((s) => s.routes);
  const selectedIndex = useStore((s) => s.selectedRouteIndex);
  const selectedRoute = selectedIndex !== null ? routes[selectedIndex] : null;

  if (!selectedRoute) return null;

  const style = ROUTE_COLORS[selectedRoute.mode];
  const profile = MODE_PROFILES[selectedRoute.mode];
  const safetyScore = 100 - selectedRoute.riskScore;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="border-t border-gray-700/50 pt-3 mt-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="4" viewBox="0 0 16 4">
            <line x1="0" y1="2" x2="16" y2="2"
              stroke={style.color} strokeWidth="2"
              strokeDasharray={style.dash} />
          </svg>
          <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: style.color }}>
            {selectedRoute.mode} Route
          </span>
          <span className="text-[10px] text-gray-400 ml-auto">{profile.description}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`dist-${selectedRoute.mode}`}
              variants={statVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/30"
            >
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Distance</div>
              <div className="text-sm font-bold text-white">{selectedRoute.distanceNm.toFixed(0)} <span className="text-xs text-gray-400">nm</span></div>
            </motion.div>

            <motion.div
              key={`eta-${selectedRoute.mode}`}
              variants={statVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, delay: 0.05 }}
              className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/30"
            >
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">ETA</div>
              <div className="text-sm font-bold text-white">{selectedRoute.etaHours.toFixed(1)} <span className="text-xs text-gray-400">h</span></div>
            </motion.div>

            <motion.div
              key={`fuel-${selectedRoute.mode}`}
              variants={statVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, delay: 0.1 }}
              className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/30"
            >
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Fuel</div>
              <div className="text-sm font-bold text-white">{selectedRoute.fuelEstimateTonnes.toFixed(0)} <span className="text-xs text-gray-400">t</span></div>
            </motion.div>

            <motion.div
              key={`risk-${selectedRoute.mode}`}
              variants={statVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, delay: 0.15 }}
              className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/30"
            >
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Safety</div>
              <div className="text-sm font-bold text-white">{safetyScore.toFixed(0)} <span className="text-xs text-gray-400">%</span></div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Optimization Score</span>
            <span className="font-bold text-white">{Math.round((safetyScore + (100 - (selectedRoute.fuelEstimateTonnes / 200) * 100) + (100 - (selectedRoute.etaHours / 100) * 100)) / 3)}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${style.color}, ${style.color}88)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((safetyScore + (100 - (selectedRoute.fuelEstimateTonnes / 200) * 100) + (100 - (selectedRoute.etaHours / 100) * 100)) / 3)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1">
          <span>Speed: {selectedRoute.avgSpeedKnots.toFixed(1)} kn</span>
          <span>Waypoints: {selectedRoute.waypoints.length}</span>
        </div>
      </div>
    </motion.div>
  );
}
