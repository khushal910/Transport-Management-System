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
import EmployeeList from '../pages/employee/EmployeeList';

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
        path: 'employee/list',
        element: <EmployeeList />,
      },
      { 
        path: 'maintenance',
        element: <div>Maintenance</div>,
      },
      { 
        path: 'trip-expense',
        element: <div>Trip & Expense</div>,
      },
      { 
        path: 'performance',
        element: <div>Performance</div>,
      },
      { 
        path: 'analytics',
        element: <div>Analytics</div>,
      },
    ],
  },

  {
    path: '*',
    element: <Error />,
  }
]);
