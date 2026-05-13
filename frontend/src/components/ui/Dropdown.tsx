import { type ChangeEvent } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Dropdown({ label, value, options, onChange, placeholder }: DropdownProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 dark:text-blue-300/70 mb-1 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="
          w-full px-3 py-2.5
          bg-white dark:bg-gray-800/60
          border-2 border-black/10 dark:border-blue-900/40
          rounded-xl
          font-medium text-sm text-gray-900 dark:text-gray-100
          shadow-neobrutalist-sm dark:shadow-[0_2px_0_0_rgba(30,58,95,0.5)]
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          min-h-[44px]
          appearance-none
          cursor-pointer
          backdrop-blur-sm
        "
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
