import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Registration';
import Error from '../pages/error/Error';
import AuthLayout from '../layout/AuthLayout';
import MainLayout from '../layout/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import Vehicle from '../pages/vehicle/vehicle';
import Trip from '../pages/trip/trip';
import AddEmployee from '../pages/employee/AddEmployee';
import MaintenancePage from '../pages/maintenance/Maintenance';
import Expense from '../pages/expense/Expense';
import Performance from '../pages/performance/Performance';
import Analytics from '../pages/analytics/Analytics';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,   
    errorElement: <Error />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/main',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'vehicle-registry',
        element: <Vehicle />,
      },
      {
        path: 'trip-dispatcher',
        element: <Trip />,
      },
      {
        path: 'employee/add',
        element: <AddEmployee />,
      },
      { 
        path: 'maintenance',
        element: <MaintenancePage />,
      },
      { 
        path: 'trip-expense',
        element: <Expense />,
      },
      { 
        path: 'performance',
        element: <Performance />,
      },
      { 
        path: 'analytics',
        element: <Analytics />,
      },
    ],
  },

  {
    path: '*',
    element: <Error />,
  }
]);
