/**
 * Authentication helpers
 */
import { apiClient } from './api';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  tenant_id: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

export class AuthService {
  private user: AuthUser | null = null;

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await apiClient.login(email, password);
    if (!response.user) {
      throw new Error('Login failed: No user data received');
    }
    const user = response.user;
    this.user = user;
    return user;
  }

  async register(userData: {
    email: string;
    password: string;
    full_name?: string;
    tenant_id: string;
    role?: string;
  }): Promise<AuthUser> {
    const user = await apiClient.register(userData);
    this.user = user;
    return user;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!apiClient['token']) {
      return null;
    }

    try {
      this.user = await apiClient.getCurrentUser();
      return this.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    this.user = null;
    apiClient.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!apiClient['token'];
  }

  getUser(): AuthUser | null {
    return this.user;
  }
}

export const authService = new AuthService();

