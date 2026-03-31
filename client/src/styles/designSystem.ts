// Design System - Professional SaaS Theme
// Follows: 8px spacing, minimal shadows, clear hierarchy

export const designSystem = {
  // Spacing System (8px base)
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-10',
  },

  // Gap System for children
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },

  // Typography Variants
  typography: {
    // Page Title
    pageTitle: 'text-3xl font-semibold text-gray-900',
    
    // Section Heading
    heading: 'text-xl font-semibold text-gray-900',
    
    // Subheading
    subheading: 'text-lg font-medium text-gray-900',
    
    // Body
    body: 'text-sm text-gray-600',
    
    // Body Emphasized
    bodyMedium: 'text-sm font-medium text-gray-900',
    
    // Caption
    caption: 'text-xs text-gray-500',
    
    // Label
    label: 'text-xs font-semibold text-gray-700 uppercase tracking-wider',
  },

  // Colors - Semantic
  colors: {
    // Primary
    primary: 'blue',
    primaryLight: 'bg-blue-50',
    primaryText: 'text-blue-600',
    
    // Success
    success: 'bg-green-50',
    successText: 'text-green-600',
    successBorder: 'border-green-200',
    
    // Error
    error: 'bg-red-50',
    errorText: 'text-red-600',
    errorBorder: 'border-red-200',
    
    // Warning
    warning: 'bg-yellow-50',
    warningText: 'text-yellow-600',
    warningBorder: 'border-yellow-200',
    
    // Info
    info: 'bg-blue-50',
    infoText: 'text-blue-600',
    infoBorder: 'border-blue-200',
    
    // Neutral
    neutral: 'bg-gray-50',
    neutralText: 'text-gray-600',
  },

  // Border Radius
  radius: {
    default: 'rounded-xl',
    lg: 'rounded-2xl',
    sm: 'rounded-lg',
  },

  // Shadows - Minimal and soft
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    none: 'shadow-none',
  },

  // Transitions
  transition: 'transition-all duration-200 ease-in-out',

  // Component-specific utilities
  card: 'bg-white border border-gray-200 rounded-xl shadow-sm',
  input: 'border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  button: 'rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
};
