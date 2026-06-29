import React from 'react';
import { CustomThemeProvider } from './Theme/ThemeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './Layout/AppLayout';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Auth } from './Page/Auth';
import { AppProvider } from './ContextApi/AppContext';
import FakerTextField from './Components/Dashboard/PlayGround/helper/FakerTextField';
import LandingPage from './Components/LandingPage/LandingPage';

const ProtectedRoutes = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') != null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') != null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export const App = () => {
  return (
    <CustomThemeProvider>
      <GoogleOAuthProvider clientId="1020480354420-ap37jpum6hgp7tvvm0e4mbtfjn9h0uq5.apps.googleusercontent.com">
        <Router>
          <Routes>
            {/* Landing Page - default public route */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth routes */}
            <Route
              path="/*"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Dashboard - protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoutes>
                  <AppProvider>
                    <AppLayout />
                  </AppProvider>
                </ProtectedRoutes>
              }
            />
            <Route path="/random" element={<FakerTextField />} />
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </CustomThemeProvider>
  );
};

export default App;
