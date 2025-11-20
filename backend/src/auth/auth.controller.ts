import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

class GoogleSignInDto {
  idToken: string;
}

class RefreshTokenDto {
  refresh_token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/url')
  @ApiOperation({
    summary: 'Lấy URL đăng nhập Google',
    description:
      'Trả về URL để redirect user đến trang đăng nhập Google của Supabase',
  })
  @ApiResponse({
    status: 200,
    description: 'URL đăng nhập Google',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://your-project.supabase.co/auth/v1/authorize?provider=google&redirect_to=...',
        },
      },
    },
  })
  getGoogleAuthUrl() {
    return this.authService.getGoogleAuthUrl();
  }

  @Get('google/callback')
  @ApiOperation({
    summary: 'Xử lý callback từ Google OAuth',
    description:
      'Endpoint này được gọi sau khi user đăng nhập thành công với Google',
  })
  @ApiQuery({
    name: 'code',
    description: 'Authorization code từ Google',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          description: 'Thông tin user',
        },
        session: {
          type: 'object',
          description: 'Session information',
        },
        access_token: {
          type: 'string',
          description: 'Access token',
        },
        refresh_token: {
          type: 'string',
          description: 'Refresh token',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi khi xử lý callback',
  })
  async handleGoogleCallback(@Query('code') code: string) {
    if (!code) {
      throw new Error('Code không được cung cấp');
    }
    return await this.authService.handleGoogleCallback(code);
  }

  @Get('user')
  @ApiOperation({
    summary: 'Lấy thông tin user hiện tại',
    description: 'Lấy thông tin user từ access token',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (access token)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUser(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Access token không được cung cấp');
    }
    return await this.authService.getUser(token);
  }

  @Post('signout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Đăng xuất',
    description: 'Đăng xuất user hiện tại',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token (access token)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
  })
  async signOut(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Access token không được cung cấp');
    }
    return await this.authService.signOut(token);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Lấy access token mới từ refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token được refresh thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        expires_at: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi khi refresh token',
  })
  async refreshToken(@Body() body: RefreshTokenDto) {
    return await this.authService.refreshToken(body.refresh_token);
  }
}

