export interface GithubDocEntry {
  id: string;
  title: string;
  icon: string;
  description: string;
  routePath: string;
  sourceFile: string;
  tags: string[];
}

// Synced from .github/client/src/pages/docs/index.tsx
export const githubDocsCatalog: GithubDocEntry[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🚀',
    description: 'Learn the basics and set up your first fleet.',
    routePath: '/docs/getting-started',
    sourceFile: '.github/client/src/pages/docs/getting-started.tsx',
    tags: ['setup', 'onboarding', 'basics'],
  },
  {
    id: 'fleet-management',
    title: 'Fleet Management',
    icon: '🚗',
    description: 'Manage vehicles, track status, and maintain inventory.',
    routePath: '/docs/fleet-management',
    sourceFile: '.github/client/src/pages/docs/fleet-management.tsx',
    tags: ['vehicles', 'inventory', 'status'],
  },
  {
    id: 'driver-management',
    title: 'Driver Management',
    icon: '👨‍💼',
    description: 'Manage drivers, licenses, and performance metrics.',
    routePath: '/docs/driver-management',
    sourceFile: '.github/client/src/pages/docs/driver-management.tsx',
    tags: ['drivers', 'licenses', 'performance'],
  },
  {
    id: 'employee-management',
    title: 'Employee Management',
    icon: '👥',
    description: 'Add, update, delete, and recover team members with auto-recovery.',
    routePath: '/docs/employee-management',
    sourceFile: '.github/client/src/pages/docs/employee-management.tsx',
    tags: ['employees', 'accounts', 'recovery'],
  },
  {
    id: 'trip-management',
    title: 'Trip Management',
    icon: '📍',
    description: 'Plan routes, dispatch trips, and track deliveries.',
    routePath: '/docs/trip-management',
    sourceFile: '.github/client/src/pages/docs/trip-management.tsx',
    tags: ['routes', 'dispatch', 'delivery'],
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    icon: '🔧',
    description: 'Schedule maintenance and track service history.',
    routePath: '/docs/maintenance',
    sourceFile: '.github/client/src/pages/docs/maintenance.tsx',
    tags: ['service', 'workshop', 'uptime'],
  },
  {
    id: 'expenses',
    title: 'Expenses & Costs',
    icon: '💰',
    description: 'Track and manage fleet expenses and budgets.',
    routePath: '/docs/expenses',
    sourceFile: '.github/client/src/pages/docs/expenses.tsx',
    tags: ['cost', 'finance', 'budget'],
  },
  {
    id: 'security',
    title: 'System Security & Privacy',
    icon: '🔒',
    description: 'Understand security features, data protection, and access control.',
    routePath: '/docs/security',
    sourceFile: '.github/client/src/pages/docs/security.tsx',
    tags: ['security', 'privacy', 'compliance'],
  },
  {
    id: 'rbac',
    title: 'Role-Based Access',
    icon: '🔐',
    description: 'Understand user roles, permissions, and access control.',
    routePath: '/docs/rbac',
    sourceFile: '.github/client/src/pages/docs/rbac.tsx',
    tags: ['rbac', 'permissions', 'roles'],
  },
  {
    id: 'email-notifications',
    title: 'Email Notifications',
    icon: '📧',
    description: 'Automated email updates for employee account changes.',
    routePath: '/docs/email-notifications',
    sourceFile: '.github/client/src/pages/docs/email-notifications.tsx',
    tags: ['notifications', 'email', 'automation'],
  },
];
