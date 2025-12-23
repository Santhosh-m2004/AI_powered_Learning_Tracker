import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingPage } from '../components/LoadingSpinner.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still checking authentication
  if (loading) {
    return <LoadingPage />;
  }

  // Not authenticated → redirect to login with redirect param
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Authenticated → allow
  return children;
};

export default ProtectedRoute;
