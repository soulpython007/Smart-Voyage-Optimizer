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
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-3 rounded-xl border-2 transition-all duration-150
        min-h-[44px]
        ${isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-neobrutalist-sm'
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <svg width="20" height="6" viewBox="0 0 20 6">
            <line
              x1="0" y1="3" x2="20" y2="3"
              stroke={colors.color}
              strokeWidth="2"
              strokeDasharray={colors.dash}
            />
          </svg>
          <span className="text-xs font-extrabold uppercase text-gray-600 dark:text-gray-300">
            {route.mode}
          </span>
        </div>
        {isSelected && (
          <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">Selected</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-gray-400 dark:text-gray-500">Distance</span>
          <p className="font-bold text-gray-900 dark:text-gray-100">{route.distanceNm.toFixed(0)} nm</p>
        </div>
        <div>
          <span className="text-gray-400 dark:text-gray-500">ETA</span>
          <p className="font-bold text-gray-900 dark:text-gray-100">{route.etaHours.toFixed(1)}h</p>
        </div>
        <div>
          <span className="text-gray-400 dark:text-gray-500">Fuel</span>
          <p className="font-bold text-gray-900 dark:text-gray-100">{route.fuelEstimateTonnes.toFixed(0)}t</p>
        </div>
      </div>
    </button>
  );
}
