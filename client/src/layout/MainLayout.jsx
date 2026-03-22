import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import authBaseURL from '../api/authBaseURL'
import { toast } from 'react-toastify'

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

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
      navigate('/login')
    } catch (error) {
      console.error(error)
      toast.error('Logout failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col ">
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex justify-center items-center gap-6">
          <Link
            to="/main/dashboard"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/dashboard')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/main/vehicle-registry"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/vehicle-registry')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Vehicle Registry
          </Link>
          <Link
            to="/main/trip-dispatcher"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/trip-dispatcher')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Trip Dispatcher
          </Link>
          <Link
            to="/main/maintenance"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/maintenance')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Maintenance
          </Link>
          <Link
            to="/main/trip-expense"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/trip-expense')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Trip & Expense
          </Link>
          <Link
            to="/main/performance"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/performance')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Performance
          </Link>
          <Link
            to="/main/analytics"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/analytics')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Analytics
          </Link>
          <Link
            to="/main/employee/add"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/main/employee/add')
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700 text-white'
            }`}
          >
            Employees
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm flex flex-col">
            {user() && <span className="font-semibold">{user().name}</span>}
            {company() && <span className="text-gray-300 text-xs">{company().name}</span>}
          </div>
          <button
            onClick={handleLogout}
            className="hover:bg-red-600 bg-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout