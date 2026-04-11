import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import TripsPage from "./pages/TripsPage";
import DriversPage from "./pages/DriversPage";
import MaintenancePage from "./pages/MaintenancePage";
import ExpensesPage from "./pages/ExpensesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import EmployeesPage from "./pages/EmployeesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
