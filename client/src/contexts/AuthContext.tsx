import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContextType';
import type { User } from './AuthContextType';
import { useLocation } from 'react-router-dom';

let authBootstrapPromise: Promise<void> | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    setUser(null);
  };

  useEffect(() => {
    let isMounted = true;

    // Páginas onde não precisamos checar autenticação inicialmente
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    const checkAuth = async () => {
      if (authBootstrapPromise) {
        await authBootstrapPromise;
        return;
      }

      if (isAuthPage) {
        setLoading(false);
        return;
      }

      authBootstrapPromise = (async () => {
        try {
          const res = await api.get('/user/me');
          if (isMounted) setUser(res.data.data);
        } catch {
          if (isMounted) setUser(null);
        } finally {
          if (isMounted) setLoading(false);
          authBootstrapPromise = null;
        }
      })();

      await authBootstrapPromise;
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const login = async (email: string, senha: string) => {
    const res = await api.post('/auth/login', { email, senha });
    setUser(res.data.data.user);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
