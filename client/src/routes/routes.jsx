import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Registration';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import SetupPassword from '../pages/auth/SetupPassword';
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
import PrivateRoute from '../components/PrivateRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,   
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'setup-password',
        element: <SetupPassword />,
      },
    ],
  },
  {
    path: '/main',
    element: <PrivateRoute><MainLayout /></PrivateRoute>,
    errorElement: <Error />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'vehicle-registry',
        element: <PrivateRoute requiredRoles={['manager', 'admin']}><Vehicle /></PrivateRoute>,
      },
      {
        path: 'trip-dispatcher',
        element: <Trip />,
      },
      {
        path: 'employee/add',
        element: <PrivateRoute requiredRoles={['manager', 'admin']}><AddEmployee /></PrivateRoute>,
      },
      { 
        path: 'maintenance',
        element: <PrivateRoute requiredRoles={['manager', 'admin']}><MaintenancePage /></PrivateRoute>,
      },
      { 
        path: 'trip-expense',
        element: <Expense />,
      },
      { 
        path: 'performance',
        element: <PrivateRoute requiredRoles={['manager', 'admin']}><Performance /></PrivateRoute>,
      },
      { 
        path: 'analytics',
        element: <PrivateRoute requiredRoles={['manager', 'admin']}><Analytics /></PrivateRoute>,
      },
    ],
  },

  {
    path: '*',
    element: <Error />,
  }
]);
