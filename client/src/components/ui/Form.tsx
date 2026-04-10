import React from 'react';

interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Professional form wrapper with consistent styling
 */
export const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  className = '',
}) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Form group for organizing multiple form fields
 */
export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

interface FormColumnProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
}

/**
 * Responsive form column layout
 */
export const FormColumns: React.FC<FormColumnProps> = ({ children, cols = 2 }) => {
  const colMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colMap[cols]} gap-6`}>
      {children}
    </div>
  );
};

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

/**
 * Form action buttons with proper spacing
 */
export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
}) => {
  const alignMap = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex ${alignMap[align]} gap-3 border-t border-slate-200 pt-6`}>
      {children}
    </div>
  );
};

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

/**
 * Professional select dropdown
 */
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
          {label}
        </label>
      )}
      <select
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/35 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/35' : ''
        } ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </div>
  );
};

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Professional textarea
 */
export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">
          {label}
        </label>
      )}
      <textarea
        disabled={disabled}
        className={`w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/35 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/35' : ''
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </div>
  );
};
