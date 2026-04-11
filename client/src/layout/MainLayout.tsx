import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import authBaseURL from '../api/authBaseURL';
import { useNotification } from '../hooks/useNotification';
import NotificationBanner from '../components/NotificationPanel';
import { ChevronDown, ChevronLeft, LogOut, Menu, User, X } from 'lucide-react';
import { navItems, UserRole } from '../config/rolePermissions';
import { useSidebar } from '../context/SidebarContext';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifySuccess, notifyError } = useNotification();
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  const isExpanded = sidebarOpen;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const user = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to parse stored auth data:', error);
      localStorage.removeItem('user');
      return null;
    }
  };

  const company = () => {
    try {
      const companyData = localStorage.getItem('company');
      return companyData ? JSON.parse(companyData) : null;
    } catch (error) {
      console.error('Failed to parse stored company data:', error);
      localStorage.removeItem('company');
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await authBaseURL.post('/logout');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      notifySuccess('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error(error);
      notifyError('Logout failed');
    }
  };

  const userRole = (user()?.role as UserRole) || 'dispatcher';
  const filteredNavItems = navItems.filter((item) => item.requiredRoles.includes(userRole));

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`sidebar-gradient fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 text-slate-300 transition-all duration-300 lg:static ${
          isExpanded ? 'w-64' : 'w-[68px]'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`flex h-16 items-center border-b border-slate-800 px-4 ${!isExpanded ? 'justify-center' : ''}`}>
          {isExpanded ? (
            <Link to="/main/dashboard" className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white">
                ⚡
              </div>
              <span className="truncate text-lg font-bold text-white">FleetFlow</span>
            </Link>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">⚡</div>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto text-slate-500 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="app-scroll flex-1 space-y-1 overflow-y-auto p-3">
          {filteredNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-sky-400'
                    : 'text-slate-300 hover:bg-slate-900/55 hover:text-white'
                }`}
                title={!isExpanded ? item.label : ''}
              >
                <span className="w-5 shrink-0 text-center text-base leading-none">{item.icon}</span>
                {isExpanded ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden border-t border-slate-800 p-3 text-slate-500 transition-colors hover:text-white lg:flex lg:items-center lg:justify-center"
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
        </button>

        <div className={`border-t border-slate-800 p-3 ${!isExpanded ? 'flex flex-col items-center' : ''}`}>
          <div className="relative w-full">
            <button
              onClick={() => setShowProfilePanel(!showProfilePanel)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-900/40 ${
                !isExpanded ? 'justify-center px-0' : ''
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300">
                {user()?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {isExpanded ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{user()?.name || 'User'}</p>
                    <p className="truncate text-xs text-slate-400">{company()?.name || 'Company'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </>
              ) : null}
            </button>

            {showProfilePanel ? (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfilePanel(false)} />
                <div className="absolute bottom-full left-0 z-50 mb-2 w-full min-w-56 rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-lg shadow-slate-900/10">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{user()?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user()?.email}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{company()?.name}</p>
                    <span className="mt-2 inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                      {userRole === 'safety_officer'
                        ? '🛡️ Safety Officer'
                        : userRole === 'financial_analyst'
                        ? '📊 Financial Analyst'
                        : userRole === 'dispatcher'
                        ? '🚚 Dispatcher'
                        : userRole === 'driver'
                        ? '🚛 Driver'
                        : '👑 Manager'}
                    </span>
                  </div>
                  <Link
                    to="/main/profile"
                    onClick={() => setShowProfilePanel(false)}
                    className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100"
                  >
                    <User className="h-4 w-4" />
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfilePanel(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-500 transition-colors hover:text-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-slate-500">{currentDate}</span>
        </header>

        <div className="px-4 pt-4 sm:px-6">
          <NotificationBanner />
        </div>

        <div className="app-scroll flex-1 overflow-y-auto">
          <div className="animate-fade-in pb-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
