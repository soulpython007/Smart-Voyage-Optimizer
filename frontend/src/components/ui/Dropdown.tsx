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
      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="
          w-full px-3 py-2.5
          bg-white dark:bg-gray-700
          border-2 border-black dark:border-gray-600
          rounded-xl
          font-medium text-sm text-gray-900 dark:text-gray-100
          shadow-neobrutalist-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          min-h-[44px]
          appearance-none
          cursor-pointer
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
