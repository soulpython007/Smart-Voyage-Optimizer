import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stats';
  noShadow?: boolean;
}

export function Card({ variant = 'default', noShadow = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-xl p-4
        ${noShadow ? '' : 'shadow-neobrutalist'}
        ${variant === 'stats' ? 'p-5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
