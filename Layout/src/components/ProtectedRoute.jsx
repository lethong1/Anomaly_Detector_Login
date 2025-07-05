import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
} 