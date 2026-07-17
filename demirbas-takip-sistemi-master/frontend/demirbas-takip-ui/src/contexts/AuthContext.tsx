import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AuthUser, LoginRequest } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authService.login(request);
    authService.saveUser(response);
    setUser({
      token: response.token,
      username: response.username,
      fullName: response.fullName,
      email: response.email,
      userId: response.userId,
    });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
