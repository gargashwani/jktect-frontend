/**
 * Authentication Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error in AuthContext useEffect:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize immediately (synchronous)
    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, user: userData } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      const response = await apiClient.post<User>(API_ENDPOINTS.REGISTER, data);
      console.log('Registration successful:', response.data);
      // After registration, user needs to login
    } catch (error: any) {
      console.error('Registration API error:', error);
      // Re-throw to let the component handle it
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Always provide a value, even during initialization
  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_superuser || false,
  };

  // Ensure we always render the provider with a value
  if (value === undefined) {
    console.error('AuthContext value is undefined!');
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    const error = new Error('useAuth must be used within an AuthProvider');
    console.error('useAuth error:', error);
    console.trace('useAuth called from:');
    throw error;
  }
  return context;
};
