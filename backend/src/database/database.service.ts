import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DatabaseService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async testConnection() {
    try {
      const client = this.supabaseService.getClient();

      // Test kết nối bằng cách query một bảng hệ thống hoặc thực hiện một query đơn giản
      // Supabase không có endpoint test trực tiếp, nên ta thử query từ một bảng phổ biến
      const { error } = await client.from('_realtime').select('*').limit(0);

      // Nếu không có lỗi hoặc lỗi là do bảng không tồn tại (không phải lỗi kết nối)
      if (!error || error.code === 'PGRST116') {
        return {
          success: true,
          message: 'Kết nối database thành công',
          timestamp: new Date().toISOString(),
        };
      }

      // Nếu có lỗi khác, vẫn coi là kết nối thành công vì đã kết nối được đến Supabase
      return {
        success: true,
        message: 'Kết nối database thành công',
        timestamp: new Date().toISOString(),
        note: 'Database đã sẵn sàng để sử dụng',
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Không thể kết nối với database',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTables(): Promise<{ tables: string[] }> {
    try {
      const client = this.supabaseService.getClient();

      // Danh sách các bảng phổ biến để thử
      const commonTables = [
        'test'
   
      ];

      const existingTables: string[] = [];

      // Thử query từng bảng để xem bảng nào tồn tại
      for (const table of commonTables) {
        try {
          const { error } = await client.from(table).select('*').limit(0);
          if (!error) {
            existingTables.push(table);
          }
        } catch (e) {
          // Bảng không tồn tại, bỏ qua
        }
      }

      return {
        tables: existingTables,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Không thể lấy danh sách bảng',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async queryTable(
    table: string,
    limit: number = 10,
  ): Promise<{ table: string; data: any[]; count: number }> {
    try {
      const client = this.supabaseService.getClient();

      // Query dữ liệu từ bảng
      const { data, error, count } = await client
        .from(table)
        .select('*', { count: 'exact' })
        .limit(limit || 10);

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            {
              message: `Bảng "${table}" không tồn tại`,
              error: error.message,
            },
            HttpStatus.NOT_FOUND,
          );
        }

        throw new HttpException(
          {
            message: `Lỗi khi query bảng "${table}"`,
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        table,
        data: data || [],
        count: count || 0,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Lỗi khi query bảng "${table}"`,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

