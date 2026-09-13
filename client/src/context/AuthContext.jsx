import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('techloom_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('techloom_token');
      const storedUser = localStorage.getItem('techloom_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('techloom_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing credentials.');
          localStorage.removeItem('techloom_token');
          localStorage.removeItem('techloom_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('techloom_token', data.token);
      localStorage.setItem('techloom_user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('techloom_token', data.token);
      localStorage.setItem('techloom_user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('techloom_token');
    localStorage.removeItem('techloom_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
