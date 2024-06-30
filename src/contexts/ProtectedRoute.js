import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';
import Loader from '@/components/Loader';
import '@/App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='main-loader-container'>
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

export default ProtectedRoute;
