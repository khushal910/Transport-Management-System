import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Registration';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import SetupPassword from '../pages/auth/SetupPassword';
import Landing from '../pages/landing/Landing';
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
import { SafetyOfficerDashboard } from '../pages/dashboard/SafetyOfficerDashboard';
import { DriverSafetyProfile } from '../pages/dashboard/DriverSafetyProfile';
import { SafetyAnalytics } from '../pages/dashboard/SafetyAnalytics';

import PrivateRoute from '../components/PrivateRoute';
// Documentation pages
import DocsIndex from '../pages/docs/index';
import GettingStarted from '../pages/docs/getting-started';
import FleetManagement from '../pages/docs/fleet-management';
import DriverManagement from '../pages/docs/driver-management';
import TripManagement from '../pages/docs/trip-management';
import Maintenance from '../pages/docs/maintenance';
import Expenses from '../pages/docs/expenses';
import RBACDocs from '../pages/docs/rbac';
import EmailNotificationsDocs from '../pages/docs/email-notifications';
// Role-based access control
import { UserRole } from '../config/rolePermissions';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    errorElement: <Error />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,   
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Navigate to="login" replace />,
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
      // Dashboard - Accessible by all authenticated roles
      {
        path: 'dashboard',
        element: <PrivateRoute requiredRoles={['manager', 'dispatcher', 'safety_officer', 'financial_analyst'] as UserRole[]}><Dashboard /></PrivateRoute>,
      },
      // Vehicles - Manager only (full access), Dispatcher read-only (view only)
      {
        path: 'vehicle-registry',
        element: <PrivateRoute requiredRoles={['manager', 'dispatcher'] as UserRole[]}><Vehicle /></PrivateRoute>,
      },
      // Drivers - Manager only (full access), Dispatcher read-only (view only), Safety Officer read-only (safety profile)
      {
        path: 'driver-registry',
        element: (
          <PrivateRoute requiredRoles={['manager', 'dispatcher', 'safety_officer'] as UserRole[]}>
            <AddEmployee />
          </PrivateRoute>
        ),
      },
      // Trips - Manager, Dispatcher, Safety Officer (read-only)
      {
        path: 'trip-dispatcher',
        element: (
          <PrivateRoute requiredRoles={['manager', 'dispatcher', 'safety_officer'] as UserRole[]}>
            <Trip />
          </PrivateRoute>
        ),
      },
      // Team Page - Manager only
      {
        path: 'team',
        element: <PrivateRoute requiredRoles={['manager'] as UserRole[]}><AddEmployee /></PrivateRoute>,
      },
      { 
        path: 'maintenance',
        element: <PrivateRoute requiredRoles={['manager'] as UserRole[]}><MaintenancePage /></PrivateRoute>,
      },
      // Expenses - Manager, Financial Analyst
      { 
        path: 'trip-expense',
        element: <PrivateRoute requiredRoles={['manager', 'financial_analyst'] as UserRole[]}><Expense /></PrivateRoute>,
      },
      // Performance - Manager, Safety Officer
      { 
        path: 'performance',
        element: <PrivateRoute requiredRoles={['manager', 'safety_officer'] as UserRole[]}><Performance /></PrivateRoute>,
      },
      // Analytics - Manager, Financial Analyst, Safety Officer (role-specific data)
      {
        path: 'analytics',
        element: (
          <PrivateRoute requiredRoles={['manager', 'financial_analyst', 'safety_officer'] as UserRole[]}>
            <Analytics />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/docs',
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <DocsIndex />,
      },
      {
        path: 'getting-started',
        element: <GettingStarted />,
      },
      {
        path: 'fleet-management',
        element: <FleetManagement />,
      },
      {
        path: 'driver-management',
        element: <DriverManagement />,
      },
      {
        path: 'trip-management',
        element: <TripManagement />,
      },
      {
        path: 'maintenance',
        element: <Maintenance />,
      },
      {
        path: 'expenses',
        element: <Expenses />,
      },
      {
        path: 'rbac',
        element: <RBACDocs />,
      },
      {
        path: 'email-notifications',
        element: <EmailNotificationsDocs />,
      },
    ],
  },

  {
    path: '*',
    element: <Error />,
  }
]);
