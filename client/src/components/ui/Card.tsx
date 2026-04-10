import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'elevated';
  onClick?: () => void;
}

const paddingMap = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

const variantMap = {
  default: 'bg-white border border-slate-200 shadow-sm',
  muted: 'bg-slate-50/90 border border-slate-200 shadow-sm',
  elevated: 'bg-white border border-slate-100 shadow-lg shadow-slate-900/10',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'lg',
  variant = 'default',
  onClick,
}) => {
  return (
    <div
      className={`${variantMap[variant]} rounded-2xl ${paddingMap[padding]} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 transition-all duration-200' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
