import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
