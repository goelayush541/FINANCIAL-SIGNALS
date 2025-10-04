import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = React.memo(({ children }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute - loading:', loading, 'user:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        <span className="ml-4 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ User authenticated, rendering protected content');
  return children;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;