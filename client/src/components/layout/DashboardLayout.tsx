import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  Route,
  MapPinned,
  Users,
  Wrench,
  Receipt,
  BarChart3,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { name: 'Vehicles', href: '/vehicles', icon: Truck, roles: ['manager'] },
  { name: 'Trips', href: '/trips', icon: Route, roles: ['manager', 'dispatcher', 'driver'] },
  { name: 'Live Map', href: '/trips/live-map', icon: MapPinned, roles: ['manager', 'dispatcher'] },
  { name: 'Drivers', href: '/drivers', icon: Users, roles: ['manager', 'dispatcher', 'safety_officer'] },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['manager', 'safety_officer'] },
  { name: 'Expenses', href: '/expenses', icon: Receipt, roles: ['manager', 'dispatcher', 'driver', 'financial_analyst'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['manager', 'financial_analyst'] },
  { name: 'Employees', href: '/employees', icon: UserPlus, roles: ['manager'] },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const filteredNav = navigation.filter((item) => user && item.roles.includes(user.role));

  const isNavItemActive = (href: string) => {
    if (href === '/trips') {
      return location.pathname === href;
    }

    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'sidebar-gradient fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border transition-all duration-300 lg:static',
          collapsed ? 'w-[68px]' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b border-sidebar-border px-4', collapsed && 'justify-center')}>
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-accent-foreground">FleetFlow</span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-sidebar-muted lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredNav.map((item) => {
            const isActive = isNavItemActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden border-t border-sidebar-border p-3 text-sidebar-muted hover:text-sidebar-foreground lg:flex lg:items-center lg:justify-center"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>

        {/* User section */}
        <div className={cn('border-t border-sidebar-border p-3 flex items-center gap-2 w-full', collapsed && 'flex-col gap-1')}>
          <button
            onClick={handleLogout}
            className={cn(
              'text-sidebar-muted hover:text-destructive flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent/50 shrink-0',
              !collapsed && 'hidden'
            )}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-3 rounded-lg px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors flex-1 min-w-0',
              collapsed && 'flex-col justify-center w-full'
            )}
            title="View Profile"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{user?.name?.split(' ').slice(0, 2).join(' ') ?? ''}</p>
                <p className="truncate text-xs text-sidebar-muted capitalize">{user?.role?.replace('_', ' ') ?? ''}</p>
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              'text-sidebar-muted hover:text-destructive flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent/50 shrink-0',
              collapsed && 'hidden'
            )}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
