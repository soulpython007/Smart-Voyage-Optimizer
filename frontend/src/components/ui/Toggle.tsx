import { motion } from 'framer-motion';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <motion.button
      onClick={() => onChange(!enabled)}
      whileTap={{ scale: 0.95 }}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200
        ${enabled ? 'bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-gray-700 border border-gray-600'}
        min-h-[44px] min-w-[44px]
      `}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <motion.span
        animate={{ x: enabled ? 20 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`
          inline-block h-4 w-4 rounded-full
          ${enabled ? 'bg-white' : 'bg-gray-300'}
        `}
      />
    </motion.button>
  );
}
