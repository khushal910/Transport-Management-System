import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import authBaseURL from '../api/authBaseURL'
import { useNotification } from '../hooks/useNotification'
import NotificationBanner from '../components/NotificationPanel'
import {
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Search,
  User,
} from 'lucide-react'
import { navItems, UserRole } from '../config/rolePermissions'
import { useSidebar } from '../context/SidebarContext'

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { notifySuccess, notifyError } = useNotification()
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const user = () => {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Failed to parse stored auth data:', error)
      localStorage.removeItem('user')
      return null
    }
  }

  const company = () => {
    try {
      const companyData = localStorage.getItem('company')
      return companyData ? JSON.parse(companyData) : null
    } catch (error) {
      console.error('Failed to parse stored company data:', error)
      localStorage.removeItem('company')
      return null
    }
  }

  const handleLogout = async () => {
    try {
      await authBaseURL.post('/logout')
      localStorage.removeItem('user')
      localStorage.removeItem('company')
      notifySuccess('Logged out successfully')
      navigate('/')
    } catch (error) {
      console.error(error)
      notifyError('Logout failed')
    }
  }

  // Get user role and filter navigation items
  const userRole = (user()?.role as UserRole) || 'dispatcher'
  const filteredNavItems = navItems.filter(item => 
    item.requiredRoles.includes(userRole)
  )

  const currentPageLabel = useMemo(() => {
    return filteredNavItems.find((item) => isActive(item.path))?.label || 'Workspace'
  }, [filteredNavItems, location.pathname])

  const breadcrumbLabel = currentPageLabel === 'Dashboard' ? 'Overview' : currentPageLabel

  return (
    <div className="app-shell min-h-screen text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-72' : 'w-24'
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200/80 px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-lg text-white shadow-md shadow-blue-600/35">
              ⚡
            </div>
            {sidebarOpen ? (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">FleetFlow</h1>
                <p className="truncate text-xs text-slate-500">Transport Management Cloud</p>
              </div>
            ) : null}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors duration-200"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="app-scroll flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {sidebarOpen ? 'Navigation' : 'Menu'}
          </div>
          <div className="space-y-1.5">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive(item.path)
                    ? 'border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:border hover:border-slate-200 hover:bg-white hover:text-slate-900'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/70 text-base shadow-sm ring-1 ring-slate-200/80">
                  {item.icon}
                </span>
                {sidebarOpen ? <span className="truncate">{item.label}</span> : null}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile at Bottom */}
        <div className="border-t border-slate-200/80 px-3 py-4">
          <div className="relative">
            <button
              onClick={() => setShowProfilePanel(!showProfilePanel)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 ${
                showProfilePanel ? 'bg-slate-100' : 'hover:bg-slate-100'
              }`}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-600/30">
                {user()?.name?.charAt(0)?.toUpperCase()}
              </div>
              {sidebarOpen ? (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-slate-900">{user()?.name}</p>
                    <p className="truncate text-xs text-slate-500">{company()?.name}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                </>
              ) : null}
            </button>

            {/* Profile Dropdown */}
            {showProfilePanel && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfilePanel(false)}
                />
                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">{user()?.name}</p>
                    <p className="text-xs text-slate-500">{user()?.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{company()?.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                        {userRole === 'safety_officer' ? '🛡️ Safety Officer' :
                         userRole === 'financial_analyst' ? '📊 Financial Analyst' :
                         userRole === 'dispatcher' ? '🚚 Dispatcher' :
                         '👑 Manager'}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/main/profile"
                    onClick={() => setShowProfilePanel(false)}
                    className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowProfilePanel(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`min-h-screen flex-1 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-72' : 'ml-24'
      }`}>
        <header className="sticky top-0 z-30 px-4 pt-4 md:px-6">
          <div className="app-glass flex flex-wrap items-center justify-between gap-4 border px-4 py-3 shadow-sm md:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.09em] text-slate-500">Workspace</p>
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">{breadcrumbLabel}</h2>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3 md:max-w-xl">
              <label className="relative hidden w-full md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  readOnly
                  value="Search modules"
                  className="w-full rounded-xl border border-slate-300 bg-white/90 py-2 pl-10 pr-4 text-sm text-slate-500 outline-none"
                />
              </label>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white text-slate-600 transition-colors duration-200 hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 pt-4 md:px-6">
          <NotificationBanner />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-0 pb-8 pt-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout