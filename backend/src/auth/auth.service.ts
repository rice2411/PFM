import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Tạo URL để đăng nhập với Google
   */
  getGoogleAuthUrl(): { url: string } {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const redirectTo = this.configService.get<string>(
      'http://localhost:3002/auth/callback',
      `${supabaseUrl}/auth/v1/callback`,
    );

    console.log(redirectTo);

    // Supabase tự động xử lý Google OAuth
    // URL format: https://{project}.supabase.co/auth/v1/authorize?provider=google
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('http://localhost:3002/auth/callback')}`;

    return { url: authUrl };
  }

  /**
   * Xử lý callback từ Google OAuth
   * Supabase sẽ tự động xử lý callback, endpoint này chỉ để verify
   */
  async handleGoogleCallback(code: string): Promise<any> {
    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      
      // Supabase xử lý callback tự động
      // Client sẽ nhận được session từ redirect URL
      // Endpoint này chỉ để verify code
      return {
        message: 'Callback được xử lý thành công',
        code: code,
        note: 'Client sẽ nhận session từ Supabase redirect URL',
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Lỗi khi xử lý Google callback',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thông tin user từ access token
   */
  async getUser(accessToken: string): Promise<any> {
    try {
      const client = this.supabaseService.getClient();

      const { data, error } = await client.auth.getUser(accessToken);

      if (error) {
        throw new HttpException(
          {
            message: 'Lỗi khi lấy thông tin user',
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      return data.user;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Lỗi khi lấy thông tin user',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Đăng xuất
   */
  async signOut(accessToken: string): Promise<{ message: string }> {
    try {
      const client = this.supabaseService.getClient();

      // Set session với access token trước khi sign out
      const { error: setError } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // Không cần refresh token để sign out
      });

      if (setError) {
        // Nếu không set được session, vẫn thử sign out
        this.logger.warn(`Không thể set session: ${setError.message}`);
      }

      const { error } = await client.auth.signOut();

      if (error) {
        throw new HttpException(
          {
            message: 'Lỗi khi đăng xuất',
            error: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return { message: 'Đăng xuất thành công' };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Lỗi khi đăng xuất',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const client = this.supabaseService.getClient();

      const { data, error } = await client.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new HttpException(
          {
            message: 'Lỗi khi refresh token',
            error: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Lỗi khi refresh token',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

