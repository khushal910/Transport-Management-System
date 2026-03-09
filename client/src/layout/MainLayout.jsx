import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col ">
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-center items-center gap-6 shadow-md">
        <Link
          to="/main/dashboard"
          className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Dashboard
        </Link>
        <Link
          to="/main/vehicle-registry"
          className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Vehicle Registry
        </Link>
        <Link
          to="/main/Trip-Dispatcher"
          className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Trip Dispatcher
        </Link>
        <Link
          to="/main/maintenance"
          className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Maintenance
        </Link>
        <Link
          to="/main/Trip-Expense"
          className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Trip & Expense
        </Link>
        <Link
          to="/main/Performance"
          className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Performance
        </Link>
        <Link
          to="/main/Analytics"
          className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Analytics
        </Link>
      </nav>
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout