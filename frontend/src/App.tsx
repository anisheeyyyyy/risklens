import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { Vulnerabilities } from './pages/Vulnerabilities';
import { Threats } from './pages/Threats';
import { AIInsights } from './pages/AIInsights';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="vulnerabilities" element={<Vulnerabilities />} />
              <Route path="threats" element={<Threats />} />
              <Route path="ai-insights" element={<AIInsights />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
