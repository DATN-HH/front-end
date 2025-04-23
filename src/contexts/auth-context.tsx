'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { loginUser, logoutUser, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on client-side only
  useEffect(() => {
    // This will only run in the browser, not during SSR
    const storedToken =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (storedToken) {
      setToken(storedToken);
      // You might want to fetch the user profile here with the stored token
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const { user, token } = await loginUser(credentials);
      setUser(user);
      setToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }, []);

  const contextValue = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  // Always render children, but use context to signal loading state
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
