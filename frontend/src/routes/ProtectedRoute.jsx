import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Route protection wrapper checking authenticated user sessions and authorization roles.
 * Supports public, guest-only, authenticated, passenger-only, and admin-only rules.
 */
const ProtectedRoute = ({ allowedRoles = [], guestOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Handle guest-only pages (e.g. login, register). Redirect to dashboard if logged in.
  if (guestOnly) {
    if (user) {
      return <Navigate to={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} replace />;
    }
    return <Outlet />;
  }

  // Requiring authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Requiring authorized roles (e.g. ROLE_ADMIN or ROLE_PASSENGER)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
