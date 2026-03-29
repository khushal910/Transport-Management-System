import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import authBaseURL from '../api/authBaseURL'
import { toast } from 'react-toastify'

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isActive = (path) => {
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
      toast.success('Logged out successfully')
      navigate('/auth/login')
    } catch (error) {
      console.error(error)
      toast.error('Logout failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar Navigation */}
      <nav className={`fixed left-0 top-0 h-screen bg-gray-900 text-white flex flex-col shadow-lg transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo/Title Area and Toggle Button */}
        <div className="px-4 py-6 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-blue-400">Fleet Flow</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? (
              // X Icon (Hide)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Icon (Show)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <Link
            to="/main/dashboard"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/main/vehicle-registry"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/vehicle-registry')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Vehicle Registry
          </Link>
          <Link
            to="/main/trip-dispatcher"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/trip-dispatcher')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Trip Dispatcher
          </Link>
          <Link
            to="/main/maintenance"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/maintenance')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Maintenance
          </Link>
          <Link
            to="/main/trip-expense"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/trip-expense')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Trip & Expense
          </Link>
          <Link
            to="/main/performance"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/performance')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Performance
          </Link>
          <Link
            to="/main/analytics"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/analytics')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Analytics
          </Link>
          <Link
            to="/main/employee/add"
            className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/employee/add')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Employees
          </Link>
        </div>
        )}

        {/* Profile Section at Bottom */}
        {sidebarOpen && (
          <div className="border-t border-gray-800 px-4 py-4 space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowProfilePanel(!showProfilePanel)}
              className="w-full text-sm flex flex-col hover:bg-gray-800 p-2 rounded transition-colors text-left cursor-pointer"
              title="Click to view profile"
            >
              {user() && <span className="font-semibold text-white text-xs">{user().name}</span>}
              {company() && <span className="text-gray-400 text-xs">{company().name}</span>}
            </button>

            {/* Profile Dropdown Panel */}
            {showProfilePanel && (
              <>
                <div
                  onClick={() => setShowProfilePanel(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute bottom-full left-0 z-50 mb-2 bg-white rounded-lg shadow-2xl border border-gray-200 w-80">
                  {/* Panel Header */}
                  <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg border-b border-blue-700">
                    <h2 className="text-lg font-semibold">Profile Details</h2>
                  </div>

                  {/* Panel Body */}
                  <div className="px-6 py-6 space-y-5 max-h-96 overflow-y-auto">
                    {/* User Information Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">User Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Name</p>
                          <p className="text-sm text-gray-900 font-semibold">{user()?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                          <p className="text-sm text-gray-900">{user()?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Role</p>
                          <p className="inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize mt-1" 
                             style={{
                               backgroundColor: 
                                 user()?.role === 'admin' ? '#dcfce7' :
                                 user()?.role === 'manager' ? '#dbeafe' :
                                 user()?.role === 'dispatcher' ? '#fef3c7' :
                                 '#f3f4f6',
                               color:
                                 user()?.role === 'admin' ? '#15803d' :
                                 user()?.role === 'manager' ? '#0369a1' :
                                 user()?.role === 'dispatcher' ? '#b45309' :
                                 '#374151'
                             }}>
                            {user()?.role || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Company Information Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">Company Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Company Name</p>
                          <p className="text-sm text-gray-900 font-semibold">{company()?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Registration Number</p>
                          <p className="text-sm text-gray-900">{company()?.registrationNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Address</p>
                          <p className="text-sm text-gray-900">{company()?.address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone</p>
                          <p className="text-sm text-gray-900">{company()?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel Footer */}
                  <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => setShowProfilePanel(false)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium transition text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full hover:bg-red-600 bg-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className={`flex-1 bg-gray-100 p-6 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout