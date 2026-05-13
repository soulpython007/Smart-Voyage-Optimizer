import { motion } from 'framer-motion';
import type { RouteInfo } from '../../types/maritime';
import { ROUTE_COLORS } from '../../types/maritime';

interface RouteCardProps {
  route: RouteInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export function RouteCard({ route, isSelected, onSelect }: RouteCardProps) {
  const colors = ROUTE_COLORS[route.mode];

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full text-left p-3 rounded-xl border-2 transition-colors duration-150
        min-h-[44px]
        ${isSelected
          ? 'bg-blue-900/20 border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
          : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50'
        }
      `}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <svg width="20" height="6" viewBox="0 0 20 6">
            <line
              x1="0" y1="3" x2="20" y2="3"
              stroke={colors.color}
              strokeWidth="2"
              strokeDasharray={colors.dash}
            />
          </svg>
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-300">
            {route.mode}
          </span>
        </div>
        {isSelected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-blue-400 text-[10px] font-bold"
          >
            Selected
          </motion.span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Distance</span>
          <p className="font-bold text-gray-100">{route.distanceNm.toFixed(0)} nm</p>
        </div>
        <div>
          <span className="text-gray-500">ETA</span>
          <p className="font-bold text-gray-100">{route.etaHours.toFixed(1)}h</p>
        </div>
        <div>
          <span className="text-gray-500">Fuel</span>
          <p className="font-bold text-gray-100">{route.fuelEstimateTonnes.toFixed(0)}t</p>
        </div>
      </div>
    </motion.button>
  );
}
