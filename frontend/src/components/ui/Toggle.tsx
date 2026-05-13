interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200
        ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
        border-2 border-black dark:border-gray-600
        min-h-[44px] min-w-[44px]
      `}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white border-2 border-black
          transition-transform duration-200
          ${enabled ? 'translate-x-5' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
