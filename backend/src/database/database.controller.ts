import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DatabaseService } from './database.service';

@ApiTags('database')
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('test')
  @ApiOperation({
    summary: 'Test kết nối với Supabase database',
    description: 'Kiểm tra xem kết nối với Supabase database có hoạt động không',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết nối thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Kết nối database thành công' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Lỗi kết nối database',
  })
  async testConnection() {
    return await this.databaseService.testConnection();
  }

  @Get('tables')
  @ApiOperation({
    summary: 'Lấy danh sách các bảng trong database',
    description:
      'Trả về danh sách tất cả các bảng (tables) có trong Supabase database',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tables',
    schema: {
      type: 'object',
      properties: {
        tables: {
          type: 'array',
          items: { type: 'string' },
          example: ['users', 'products', 'orders'],
        },
      },
    },
  })
  async getTables() {
    return await this.databaseService.getTables();
  }

  @Get('query/:table')
  @ApiOperation({
    summary: 'Query dữ liệu từ một bảng',
    description: 'Lấy dữ liệu từ một bảng cụ thể trong database',
  })
  @ApiParam({
    name: 'table',
    description: 'Tên bảng cần query',
    example: 'users',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng bản ghi tối đa',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu từ bảng',
  })
  @ApiResponse({
    status: 404,
    description: 'Bảng không tồn tại',
  })
  async queryTable(
    @Param('table') table: string,
    @Query('limit') limit?: number,
  ) {
    return await this.databaseService.queryTable(table, limit);
  }
}

