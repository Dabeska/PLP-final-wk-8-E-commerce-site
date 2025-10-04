import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: Role;
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
