import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

const paddingMap = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'lg',
  onClick,
}) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${paddingMap[padding]} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
