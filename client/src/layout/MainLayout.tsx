import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import authBaseURL from '../api/authBaseURL'
import { useNotification } from '../hooks/useNotification'
import NotificationBanner from '../components/NotificationPanel'
import { Menu, X, LogOut, ChevronDown } from 'lucide-react'
import { navItems, UserRole } from '../config/rolePermissions'

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { notifySuccess, notifyError } = useNotification()
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-600">Fleet Flow</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile at Bottom */}
        <div className="border-t border-gray-200 px-3 py-4">
          <div className="relative">
            <button
              onClick={() => setShowProfilePanel(!showProfilePanel)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                showProfilePanel ? 'bg-gray-100' : ''
              }`}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user()?.name?.charAt(0)?.toUpperCase()}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user()?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{company()?.name}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfilePanel && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfilePanel(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user()?.name}</p>
                    <p className="text-xs text-gray-500">{user()?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{company()?.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        {userRole === 'safety_officer' ? '🛡️ Safety Officer' :
                         userRole === 'financial_analyst' ? '📊 Financial Analyst' :
                         userRole === 'dispatcher' ? '🚚 Dispatcher' :
                         '👑 Manager'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowProfilePanel(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        {/* Notification Area */}
        <div className="relative">
          <NotificationBanner />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout