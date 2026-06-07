import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não for admin e não estiver ativo, forçar ir para pagamento
  if (user.role !== 'ADMIN' && user.status !== 'ATIVO' && location.pathname !== '/pagamento') {
    return <Navigate to="/pagamento" replace />;
  }

  // Se já estiver ativo e tentar acessar /pagamento, redirecionar para dashboard
  if (user.status === 'ATIVO' && location.pathname === '/pagamento') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
