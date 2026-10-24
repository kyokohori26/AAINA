import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Questionnaire from "./pages/Questionnaire";
import PersonaPicker from "./pages/PersonaPicker";
import Home from "./pages/Home";
import Diary from "./pages/Diary";
import History from "./pages/History";
import Mood from "./pages/Mood";
import Circle from "./pages/Circle";
import Me from "./pages/Me";
import SafetyScreen from "./pages/SafetyScreen";
import ParentDemo from "./pages/ParentDemo";
import { useUserStore } from "./store/userStore";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, token } = useUserStore();
  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default function App() {
  const { user } = useUserStore();

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/safety" element={<SafetyScreen />} />
          <Route path="/parent-demo" element={<ParentDemo />} />

          {/* Onboarding Routes */}
          <Route
            path="/questionnaire"
            element={
              <ProtectedRoute>
                <Questionnaire />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personas"
            element={
              <ProtectedRoute>
                <PersonaPicker />
              </ProtectedRoute>
            }
          />

          {/* Main App Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diary"
            element={
              <ProtectedRoute>
                <Diary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mood"
            element={
              <ProtectedRoute>
                <Mood />
              </ProtectedRoute>
            }
          />
          <Route
            path="/circle"
            element={
              <ProtectedRoute>
                <Circle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <Me />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
