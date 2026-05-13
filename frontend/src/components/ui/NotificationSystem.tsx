import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { Notification } from '../../types/maritime';

const typeConfig: Record<Notification['type'], { bg: string; border: string; icon: string }> = {
  storm_warning: {
    bg: 'bg-red-900/40',
    border: 'border-red-500/50',
    icon: '⚠️',
  },
  route_optimized: {
    bg: 'bg-blue-900/40',
    border: 'border-blue-500/50',
    icon: '✅',
  },
  ship_danger: {
    bg: 'bg-orange-900/40',
    border: 'border-orange-500/50',
    icon: '🚨',
  },
  reconnect: {
    bg: 'bg-green-900/40',
    border: 'border-green-500/50',
    icon: '🔗',
  },
  fuel_alert: {
    bg: 'bg-yellow-900/40',
    border: 'border-yellow-500/50',
    icon: '⛽',
  },
  congestion: {
    bg: 'bg-purple-900/40',
    border: 'border-purple-500/50',
    icon: '🚢',
  },
};

export function NotificationSystem() {
  const notifications = useStore((s) => s.notifications);
  const dismissNotification = useStore((s) => s.dismissNotification);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 5).map((notif) => {
          const config = typeConfig[notif.type];
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto ${config.bg} ${config.border} border rounded-xl p-3 shadow-lg backdrop-blur-md cursor-pointer`}
              onClick={() => dismissNotification(notif.id)}
            >
              <div className="flex items-start gap-2">
                <span className="text-base mt-0.5">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{notif.title}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{notif.message}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                  className="text-gray-400 hover:text-white text-xs min-h-[24px] min-w-[24px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
