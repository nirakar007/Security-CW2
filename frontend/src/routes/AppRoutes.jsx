import { Route, Routes } from "react-router-dom";

// Import all the pages you want to route to
import ProtectedRoute from "../components/layout/ProtectedRoute";
import DashboardPage from "../components/pages/DashboardPage";
import HomePage from "../components/pages/HomePage";
import LoginPage from "../components/pages/LoginPage";
// import NotFoundPage from "../components/pages/NotFoundPage";
import ForgotPasswordPage from "../components/pages/ForgotPasswordPage";
import RegisterPage from "../components/pages/RegisterPage";
import SettingsPage from "../components/pages/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* A catch-all route for 404 Not Found pages */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default AppRoutes;
