import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add interceptor to include token in all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth from LocalStorage on mount (Restore session on refresh)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token by getting the current user profile
        const response = await api.get('/api/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('[Auth] Session restoration failed:', error.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updated) => setUser((prev) => (prev ? { ...prev, ...updated } : null));

  const authValue = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    api // Export axios instance for other components
  };

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
