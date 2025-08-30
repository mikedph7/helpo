"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthApiClient, AuthUser } from '@/lib/auth-client';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authClient = new AuthApiClient();

  const refreshUser = async () => {
    try {
      const response = await authClient.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authClient.login({ email, password });
    setUser(response.user);
  };

  const register = async (email: string, password: string, name?: string, phone?: string) => {
    const response = await authClient.register({ 
      email, 
      password, 
      name, 
      phone 
    });
    setUser(response.user);
  };

  const logout = async () => {
    await authClient.logout();
    setUser(null);
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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

// HOC to protect routes that require authentication
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      window.location.href = '/auth/login';
      return null;
    }

    return <Component {...props} />;
  };
}
