import { motion } from 'framer-motion';
import { Toggle } from './Toggle';

interface LayerToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  color: string;
}

export function LayerToggle({ label, enabled, onChange, color }: LayerToggleProps) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center justify-between min-h-[44px]"
    >
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full border border-black/20 dark:border-blue-400/30"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}66` }}
        />
        <label className="text-xs font-bold text-gray-600 dark:text-blue-300/80 uppercase tracking-wider">
          {label}
        </label>
      </div>
      <Toggle enabled={enabled} onChange={onChange} label={label} />
    </motion.div>
  );
}
