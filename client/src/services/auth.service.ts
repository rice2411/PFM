import { ENVIRONMENT_VARIABLES } from '@/config/env';

export interface AuthResponse {
  url?: string;
  user?: any;
  session?: any;
  access_token?: string;
  refresh_token?: string;
  message?: string;
  error?: string;
}

export const AuthService = {
  endpoint: {
    googleAuthUrl: `${ENVIRONMENT_VARIABLES.API_URL}/auth/google/url`,
    user: `${ENVIRONMENT_VARIABLES.API_URL}/auth/user`,
    signout: `${ENVIRONMENT_VARIABLES.API_URL}/auth/signout`,
    refresh: `${ENVIRONMENT_VARIABLES.API_URL}/auth/refresh`,
  },
  /**
   * Lấy URL đăng nhập Google từ backend
   */
  getGoogleAuthUrl: async (): Promise<string> => {
    try {
      const response = await fetch(AuthService.endpoint.googleAuthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy URL đăng nhập Google');
      }

      const data: AuthResponse = await response.json();
      return data.url || '';
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin user từ access token
   */
  getUser: async (accessToken: string): Promise<any> => {
    try {
      const response = await fetch(AuthService.endpoint.user, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin user');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Đăng xuất
   */
  signOut: async (accessToken: string): Promise<void> => {
    try {
      const response = await fetch(AuthService.endpoint.signout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể đăng xuất');
      }

      // Xóa tokens khỏi localStorage
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
  }> => {
    try {
      const response = await fetch(AuthService.endpoint.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Không thể refresh token');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  /**
   * Lưu auth data vào localStorage
   */
  saveAuthData: (accessToken: string, refreshToken: string, user?: any) => {
    localStorage.setItem('auth_access_token', accessToken);
    localStorage.setItem('auth_refresh_token', refreshToken);
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  /**
   * Lấy access token từ localStorage
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('auth_access_token');
  },

  /**
   * Lấy refresh token từ localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('auth_refresh_token');
  },

  /**
   * Lấy user từ localStorage
   */
  getUserFromStorage: (): any | null => {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_access_token');
  },
};

