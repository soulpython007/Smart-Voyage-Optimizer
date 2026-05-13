export type ConnectionState = 'live' | 'reconnecting' | 'offline';

interface ConnectionStatusProps {
  state: ConnectionState;
}

const config: Record<ConnectionState, { dot: string; label: string; textClass: string }> = {
  live: { dot: 'bg-green-500', label: 'Live', textClass: 'text-green-400' },
  reconnecting: { dot: 'bg-yellow-500 animate-pulse', label: 'Reconnecting...', textClass: 'text-yellow-400' },
  offline: { dot: 'bg-red-500', label: 'Offline', textClass: 'text-red-400' },
};

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const c = config[state];
  return (
    <div className="flex items-center gap-1.5" title={`WebSocket: ${c.label}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} shadow-[0_0_4px_currentColor]`} />
      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${c.textClass}`}>
        {c.label}
      </span>
    </div>
  );
}
