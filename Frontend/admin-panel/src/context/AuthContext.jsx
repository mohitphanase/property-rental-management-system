import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      if (!saved || saved === 'undefined' || saved === 'null') {
        localStorage.removeItem('admin_user');
        return null;
      }
      const parsed = JSON.parse(saved);
      if (parsed && String(parsed.role || '').toUpperCase() !== 'ADMIN') {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
        return null;
      }
      return parsed;
    } catch (e) {
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Validate stored token on mount if user exists
    const token = localStorage.getItem('admin_token');
    if (token && user) {
      api.getCurrentUserProfile()
        .then(profile => {
          if (profile) {
            const role = String(profile.role || '').toUpperCase();
            if (role !== 'ADMIN') {
              console.warn('Access denied: stored session account is not an ADMIN');
              logout();
            } else {
              setUser(profile);
              localStorage.setItem('admin_user', JSON.stringify(profile));
            }
          }
        })
        .catch(err => {
          console.warn('Stored JWT token validation failed:', err);
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data && data.token) {
        setUser(data.user);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: 'Authentication failed. Invalid server response.' };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed. Check server status.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
