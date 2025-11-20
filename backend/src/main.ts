import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Cấu hình CORS
  const allowedOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3002')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Kiểm tra origin có trong danh sách allowed không
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    credentials: true, // Cho phép gửi cookies/credentials
    exposedHeaders: ['Authorization'], // Headers client có thể đọc được
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('PFM API')
    .setDescription('API documentation cho Personal Finance Management')
    .setVersion('1.0')
    .addTag('supabase')
    .addTag('auth')
    .addTag('database')
    .addBearerAuth() // Thêm Bearer token authentication cho Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
