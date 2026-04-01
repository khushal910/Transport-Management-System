// Role-Based Access Control Configuration
export type UserRole = 'manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst' | 'admin';

export interface RoleConfig {
  name: string;
  icon: string;
  accessiblePages: string[];
}

export const rolePermissions: Record<UserRole, RoleConfig> = {
  // 👑 Manager - Full Control
  manager: {
    name: 'Manager',
    icon: '👑',
    accessiblePages: [
      '/main/dashboard',
      '/main/vehicle-registry',
      '/main/trip-dispatcher',
      '/main/employee/add',
      '/main/maintenance',
      '/main/trip-expense',
      '/main/performance',
      '/main/analytics',
    ],
  },

  // 🚚 Dispatcher - Operations Role
  dispatcher: {
    name: 'Dispatcher',
    icon: '🚚',
    accessiblePages: [
      '/main/dashboard', // Limited data
      '/main/trip-dispatcher',
    ],
  },

  // 🛡️ Safety Officer - Compliance Role
  safety_officer: {
    name: 'Safety Officer',
    icon: '🛡️',
    accessiblePages: [
      '/main/dashboard', // Safety data
      '/main/performance', // Driver performance & safety
    ],
  },

  // 📊 Financial Analyst - Finance Role
  financial_analyst: {
    name: 'Financial Analyst',
    icon: '📊',
    accessiblePages: [
      '/main/dashboard', // Financial metrics
      '/main/trip-expense',
      '/main/analytics',
    ],
  },

  // Admin - Full Access
  admin: {
    name: 'Admin',
    icon: '⚙️',
    accessiblePages: [
      '/main/dashboard',
      '/main/vehicle-registry',
      '/main/trip-dispatcher',
      '/main/employee/add',
      '/main/maintenance',
      '/main/trip-expense',
      '/main/performance',
      '/main/analytics',
    ],
  },
};

// Navigation items configuration
export interface NavItem {
  path: string;
  label: string;
  icon: string;
  requiredRoles: UserRole[];
  dashboardType?: 'limited' | 'safety' | 'financial' | 'full'; // For dashboard data filtering
}

export const navItems: NavItem[] = [
  {
    path: '/main/dashboard',
    label: 'Dashboard',
    icon: '📊',
    requiredRoles: ['manager', 'dispatcher', 'safety_officer', 'financial_analyst', 'admin'],
    dashboardType: 'full',
  },
  {
    path: '/main/vehicle-registry',
    label: 'Vehicles',
    icon: '🚗',
    requiredRoles: ['manager', 'admin'],
  },
  {
    path: '/main/trip-dispatcher',
    label: 'Trips',
    icon: '🛣️',
    requiredRoles: ['manager', 'dispatcher', 'admin'],
  },
  {
    path: '/main/maintenance',
    label: 'Maintenance',
    icon: '🔧',
    requiredRoles: ['manager', 'admin'],
  },
  {
    path: '/main/trip-expense',
    label: 'Expenses',
    icon: '💰',
    requiredRoles: ['manager', 'financial_analyst', 'admin'],
  },
  {
    path: '/main/performance',
    label: 'Performance',
    icon: '📈',
    requiredRoles: ['manager', 'safety_officer', 'admin'],
  },
  {
    path: '/main/analytics',
    label: 'Analytics',
    icon: '📉',
    requiredRoles: ['manager', 'financial_analyst', 'admin'],
  },
  {
    path: '/main/employee/add',
    label: 'Team',
    icon: '👥',
    requiredRoles: ['manager', 'admin'],
  },
];
