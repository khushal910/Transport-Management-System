// Role-Based Access Control Configuration
export type UserRole = 'manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

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
      '/main/team',
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
      '/main/vehicle-registry', // View only
      '/main/driver-registry', // View only
      '/main/trip-dispatcher',
    ],
  },

  // 🛡️ Safety Officer - Compliance Role
  safety_officer: {
    name: 'Safety Officer',
    icon: '🛡️',
    accessiblePages: [
      '/main/dashboard', // Safety data only
      '/main/performance', // Driver performance & safety
      '/main/driver-registry', // Driver safety profiles (read-only)
      '/main/trip-dispatcher', // Trips read-only (view violations only)
      '/main/analytics', // Safety analytics only
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
    requiredRoles: ['manager', 'dispatcher', 'safety_officer', 'financial_analyst'],
    dashboardType: 'full',
  },
  {
    path: '/main/trip-dispatcher',
    label: 'Trips',
    icon: '🛣️',
    requiredRoles: ['manager', 'dispatcher'],
  },
  {
    path: '/main/vehicle-registry',
    label: 'Vehicles',
    icon: '🚗',
    requiredRoles: ['manager', 'dispatcher'],
  },
  {
    path: '/main/driver-registry',
    label: 'Drivers',
    icon: '👨‍✈️',
    requiredRoles: ['manager', 'dispatcher'],
  },
  {
    path: '/main/maintenance',
    label: 'Maintenance',
    icon: '🔧',
    requiredRoles: ['manager'],
  },
  {
    path: '/main/trip-expense',
    label: 'Expenses',
    icon: '💰',
    requiredRoles: ['manager', 'financial_analyst'],
  },
  {
    path: '/main/performance',
    label: 'Performance',
    icon: '📈',
    requiredRoles: ['manager', 'safety_officer'],
  },
  {
    path: '/main/analytics',
    label: 'Analytics',
    icon: '📉',
    requiredRoles: ['manager', 'financial_analyst'],
  },
  {
    path: '/main/team',
    label: 'Team',
    icon: '👥',
    requiredRoles: ['manager'],
  },
];
