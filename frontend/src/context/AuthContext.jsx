import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('canteen_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      } else {
        localStorage.removeItem('canteen_token');
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      localStorage.removeItem('canteen_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('canteen_token', res.token);
      setUser(res.user);
      setAuthModalOpen(false);
    }
    return res;
  };

  const demoLogin = async (role) => {
    const res = await api.demoLogin(role);
    if (res.success) {
      localStorage.setItem('canteen_token', res.token);
      setUser(res.user);
      setAuthModalOpen(false);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('canteen_token', res.token);
      setUser(res.user);
      setAuthModalOpen(false);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('canteen_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      demoLogin,
      register,
      logout,
      authModalOpen,
      setAuthModalOpen,
      isAdmin: user?.role === 'ADMIN',
      isStudent: user?.role === 'STUDENT'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
