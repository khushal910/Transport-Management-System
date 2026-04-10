import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

const variantStyles = {
  default: 'border border-slate-200 bg-slate-100 text-slate-700',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border border-rose-200 bg-rose-50 text-rose-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700',
  info: 'border border-sky-200 bg-sky-50 text-sky-700',
};

const dotStyles = {
  default: 'bg-slate-500',
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  showDot = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {showDot ? <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} /> : null}
      {children}
    </span>
  );
};
