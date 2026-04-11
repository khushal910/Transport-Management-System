import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label ? <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label> : null}
      <div className="relative">
        {icon ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        ) : null}
        <input
          className={`h-10 w-full rounded-md border bg-white ${icon ? 'pl-9' : 'px-3'} py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? 'border-rose-500' : 'border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
};
