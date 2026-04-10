// Design System - Modern SaaS Theme

export const designSystem = {
  spacing: {
    '2xs': 'p-1',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-10',
    '3xl': 'p-12',
  },

  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-10',
  },

  typography: {
    display: 'text-4xl md:text-5xl font-bold tracking-tight text-slate-950',
    pageTitle: 'text-3xl md:text-4xl font-bold tracking-tight text-slate-950',
    heading: 'text-2xl font-semibold text-slate-900',
    subheading: 'text-lg font-semibold text-slate-900',
    body: 'text-sm md:text-base text-slate-600',
    bodyMedium: 'text-sm md:text-base font-medium text-slate-800',
    caption: 'text-xs text-slate-500',
    label: 'text-xs font-semibold text-slate-700 uppercase tracking-[0.08em]',
  },

  colors: {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-700',
    primarySurface: 'bg-blue-50',
    accent: 'bg-teal-600',
    accentText: 'text-teal-700',
    surface: 'bg-white',
    surfaceMuted: 'bg-slate-50',
    border: 'border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  },

  radius: {
    sm: 'rounded-lg',
    default: 'rounded-xl',
    lg: 'rounded-2xl',
    pill: 'rounded-full',
  },

  shadow: {
    xs: 'shadow-sm',
    sm: 'shadow-md shadow-slate-900/5',
    md: 'shadow-lg shadow-slate-900/10',
    lg: 'shadow-2xl shadow-slate-900/15',
    none: 'shadow-none',
  },

  transition: 'transition-all duration-200 ease-out',

  card: 'bg-white border border-slate-200 rounded-2xl shadow-sm',
  input:
    'border border-slate-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-200',
  button:
    'rounded-xl font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2',
};
