import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Index from "./pages/Index";
import NewWorkEntry from "./pages/NewWorkEntry";
import WorkEntries from "./pages/WorkEntries";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import DataCleanup from "./pages/DataCleanup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Use BrowserRouter for clean URLs
const Router = BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-work-entry"
              element={
                <ProtectedRoute>
                  <NewWorkEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/work-entries"
              element={
                <ProtectedRoute>
                  <WorkEntries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute requiredRole="manager">
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute requiredRole="manager">
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole="manager">
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-cleanup"
              element={
                <ProtectedRoute requiredRole="manager">
                  <DataCleanup />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
