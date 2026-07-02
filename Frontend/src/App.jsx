import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import Dashboard from "./pages/Dashboard";
import ProblemList from "./pages/ProblemList";
import ProblemDetails from "./pages/ProblemDetails";
import SubmissionHistory from "./pages/SubmissionHistory";
import Profile from "./pages/Profile";
import ProblemCreation from "./pages/ProblemCreation";

// Route Guard for Protected Pages
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route Guard for Guest Pages (unauthenticated only)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Route Guard for Admin-only Pages
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  return isAuthenticated && user?.role === "admin" ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-bg text-gray-100">
        {/* Global Navbar */}
        <Navbar onShowToast={showToast} />

        {/* Page Content */}
        <main className="flex-grow">
          <Routes>
            {/* Guest Routes */}
            <Route path="/" element={<Landing />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login onShowToast={showToast} />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <Signup onShowToast={showToast} />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <PublicOnlyRoute>
                  <OTPVerification onShowToast={showToast} />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard onShowToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/problems"
              element={
                <ProtectedRoute>
                  <ProblemList onShowToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/problems/:id"
              element={
                <ProtectedRoute>
                  <ProblemDetails onShowToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submissions"
              element={
                <ProtectedRoute>
                  <SubmissionHistory onShowToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile onShowToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-problem"
              element={
                <AdminRoute>
                  <ProblemCreation onShowToast={showToast} />
                </AdminRoute>
              }
            />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Toast Alerts Container */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={closeToast}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
