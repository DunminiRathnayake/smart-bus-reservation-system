import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Route protection wrapper checking authenticated user sessions and authorization roles.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If authenticated but unauthorized, redirect to their home dashboard
    return <Navigate to={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
