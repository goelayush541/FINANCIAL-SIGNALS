import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Memoized function to check auth status
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log('🔐 Checking auth status, token exists:', !!token);
    
    if (token) {
      try {
        const response = await authAPI.verifyToken();
        console.log('📨 Verify token response:', response.data);
        
        // Handle different response structures
        const userData = response.data.data?.user || response.data.user;
        console.log('✅ Token verified, user:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      setLoading(true);
      
      const response = await authAPI.login({ email, password });
      console.log('📨 Login API response:', response.data);
      
      // Handle different response structures
      const responseData = response.data.data || response.data;
      const { token, user: userData } = responseData;
      
      if (!userData) {
        throw new Error('User data not found in response');
      }
      
      console.log('✅ Login successful, user:', userData);
      
      localStorage.setItem('token', token);
      setUser(userData);
      setLoading(false);
      
      // Navigate to dashboard
      console.log('🔄 Navigating to dashboard...');
      navigate('/', { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      // Handle different response structures
      const responseData = response.data.data || response.data;
      const { token, user: newUser } = responseData;
      
      localStorage.setItem('token', token);
      setUser(newUser);
      setLoading(false);
      
      navigate('/', { replace: true });
      
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};