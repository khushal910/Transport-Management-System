import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SetupPasswordPage from "./pages/SetupPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LandingPage from "./pages/LandingPage";
import DocumentationPage from "./pages/DocumentationPage";
import DocumentationTopicPage from "./pages/DocumentationTopicPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import TripsPage from "./pages/TripsPage";
import LiveMapPage from "./pages/LiveMapPage";
import DriversPage from "./pages/DriversPage";
import MaintenancePage from "./pages/MaintenancePage";
import ExpensesPage from "./pages/ExpensesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import EmployeesPage from "./pages/EmployeesPage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/docs/:slug" element={<DocumentationTopicPage />} />
            <Route path="/documentation" element={<Navigate to="/docs" replace />} />
            <Route path="/documentation/:slug" element={<DocumentationTopicPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/setup-password" element={<SetupPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Profile: all authenticated users */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'dispatcher', 'safety_officer', 'financial_analyst', 'driver']} />}>
              <Route path="/profile" element={<UserProfilePage />} />
            </Route>

            {/* Dashboard: manager, dispatcher, safety_officer, financial_analyst */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'dispatcher', 'safety_officer', 'financial_analyst']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Manager-only routes */}
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
            </Route>

            {/* Trips: manager, dispatcher, driver */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'dispatcher', 'driver']} />}>
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/trips/live-map" element={<LiveMapPage />} />
            </Route>

            {/* Expenses: manager, dispatcher, driver, financial_analyst (view-only for analyst) */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'dispatcher', 'driver', 'financial_analyst']} />}>
              <Route path="/expenses" element={<ExpensesPage />} />
            </Route>

            {/* Drivers: manager, dispatcher, safety_officer */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'dispatcher', 'safety_officer']} />}>
              <Route path="/drivers" element={<DriversPage />} />
            </Route>

            {/* Maintenance: manager, safety_officer */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'safety_officer']} />}>
              <Route path="/maintenance" element={<MaintenancePage />} />
            </Route>

            {/* Analytics: manager, financial_analyst */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'financial_analyst']} />}>
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
