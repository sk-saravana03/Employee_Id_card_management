import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth & Check Current Session
  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const response = await authService.getCurrentUser();
          if (response?.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.warn('[Auth Check Failed]: Session token invalid');
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for global unauthorized events (session expiry)
    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password, enforceSingleSession = true) => {
    try {
      const response = await authService.login({ email, password, enforceSingleSession });
      const { user: userData, accessToken: token } = response.data;

      setUser(userData);
      setAccessToken(token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', token);

      toast.success(`Welcome back, ${userData.firstName}`);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Authentication failed. Check credentials.';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network failures on logout
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      toast.success('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
