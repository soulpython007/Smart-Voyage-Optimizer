import { useStore } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { useAuth } from '../../auth/useAuth';
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
  const { user, signOut } = useAuth();

  const shipCount = ships?.features?.length ?? 0;
  const routeCount = routes.length;

  return (
    <header className="bg-white dark:bg-gray-800 border-b-2 border-black dark:border-gray-600 shadow-neobrutalist">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 border-2 border-black dark:border-gray-600 rounded-xl flex items-center justify-center shadow-neobrutalist">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M12 2 L4 20 L12 16 L20 20 Z" />
            </svg>
          </div>
          <h1 className="text-lg font-extrabold tracking-tight dark:text-white">Smart Voyage</h1>
          {DEMO_MODE && (
            <span className="text-[10px] font-extrabold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-500 px-2 py-0.5 rounded-lg uppercase tracking-wider">
              Demo
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="info">
            {shipCount} ship{shipCount !== 1 ? 's' : ''} tracked
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

        <div className="flex items-center gap-3">
          {connectionState && <ConnectionStatus state={connectionState} />}
          <DarkModeToggle />
          {user && (
            <button
              onClick={signOut}
              className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 underline min-h-[44px] flex items-center"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
