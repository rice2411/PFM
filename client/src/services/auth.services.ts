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
   * Đăng xuất (cần accessToken)
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
   * Đăng xuất (tự động lấy token từ localStorage)
   */
  logout: async (): Promise<void> => {
    try {
      const accessToken = AuthService.getAccessToken();
      
      // Gọi API signOut nếu có accessToken
      if (accessToken) {
        try {
          await AuthService.signOut(accessToken);
        } catch (error) {
          // Nếu API fail, vẫn xóa localStorage
          console.error('Lỗi khi gọi API signOut:', error);
          localStorage.removeItem('auth_access_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_user');
        }
      } else {
        // Nếu không có token, chỉ xóa localStorage
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
      }

      // Dispatch event để các component khác biết user đã logout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'));
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      // Vẫn xóa localStorage dù có lỗi
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');
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
      // Dispatch event để các component khác biết user đã được cập nhật
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'));
      }
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

