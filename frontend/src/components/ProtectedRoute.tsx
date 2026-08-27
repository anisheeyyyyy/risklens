import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center flex-col gap-4">
        <ShieldCheck className="w-12 h-12 text-cyan-500 animate-pulse" />
        <p className="text-cyan-500 font-mono text-sm tracking-widest uppercase">
          Verifying Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
