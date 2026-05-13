import type { ReactNode } from 'react';

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl shadow-neobrutalist">
      <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
