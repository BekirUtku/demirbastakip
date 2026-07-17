import api from './api';
import type { LoginRequest, LoginResponse, AuthUser } from '../types';

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', request);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('demirbas_token');
      localStorage.removeItem('demirbas_user');
    }
  },

  saveUser(data: LoginResponse): void {
    localStorage.setItem('demirbas_token', data.token);
    localStorage.setItem('demirbas_user', JSON.stringify({
      token: data.token,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      userId: data.userId,
    } as AuthUser));
  },

  getUser(): AuthUser | null {
    const userStr = localStorage.getItem('demirbas_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('demirbas_token');
  },
};
