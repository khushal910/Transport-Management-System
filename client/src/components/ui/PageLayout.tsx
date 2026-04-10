import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}

/**
 * Professional page header with consistent spacing and typography
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  eyebrow,
}) => {
  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:flex md:items-start md:justify-between md:gap-6">
      <div className="flex-1">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">{eyebrow}</p>
        ) : null}
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm text-slate-600 md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="mt-4 shrink-0 md:mt-0">{action}</div> : null}
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
    <div className={`mx-auto ${maxWidthMap[maxWidth]} px-4 py-6 pb-24 md:px-6 lg:px-8`}>
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
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      {title ? (
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
      ) : null}
      <div>{children}</div>
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
