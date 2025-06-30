'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  sessionId: string;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize session
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Check for existing session
      const storedUser = localStorage.getItem('user');
      const storedSessionId = localStorage.getItem('sessionId');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        // Generate new session ID for guest
        const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        localStorage.setItem('sessionId', newSessionId);
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      // Generate fallback session ID
      const fallbackSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(fallbackSessionId);
      localStorage.setItem('sessionId', fallbackSessionId);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        localStorage.setItem('user', JSON.stringify(userData.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Keep session ID for guest tracking
  };

  return (
    <AuthContext.Provider value={{
      user,
      sessionId,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
