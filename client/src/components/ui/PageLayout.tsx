import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Professional page header with consistent spacing and typography
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{title}</h1>
        {description && <p className="text-base text-gray-600">{description}</p>}
      </div>
      {action && <div className="ml-6 shrink-0">{action}</div>}
    </div>
  );
};

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[90rem]',
  full: 'w-full',
};

/**
 * Page container with proper padding and max-width
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'xl',
}) => {
  return (
    <div className={`mx-auto ${maxWidthMap[maxWidth]} px-6 py-8 pb-24`}>
      {children}
    </div>
  );
};

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Content section with consistent styling
 */
export const Section: React.FC<SectionProps> = ({ children, title, description }) => {
  return (
    <div className="mb-8">
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const gapMap = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

/**
 * Responsive grid layout
 */
export const Grid: React.FC<GridProps> = ({ children, cols = 3, gap = 'md' }) => {
  return (
    <div className={`grid ${colsMap[cols]} ${gapMap[gap]}`}>
      {children}
    </div>
  );
};
