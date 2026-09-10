import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('BeautyNestBootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }));

  // CORS Configuration
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev
      }
    },
    credentials: true,
  });

  // Global Request Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger / OpenAPI 3.0 Documentation
  const config = new DocumentBuilder()
    .setTitle('BeautyNest API')
    .setDescription(
      'Complete Production REST & Realtime API for BeautyNest – Ladies Doorstep Salon platform (Yes Madam style model)',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'OTP login, token issuance, password login')
    .addTag('Services & Categories', 'Beauty services catalog and category trees')
    .addTag('Bookings', 'Lifecycle, auto-assignment, start OTP verification')
    .addTag('Beauticians', 'Partner registration, KYC, jobs, earnings')
    .addTag('Customers', 'Profiles and saved addresses')
    .addTag('Payments', 'Razorpay checkout and signature verification')
    .addTag('Reviews & Ratings', 'Customer feedback and ratings')
    .addTag('Admin Dashboard & Operations', 'Analytics, KYC approvals, override assignment')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🌸 BeautyNest API is running on: http://localhost:${port}`);
  logger.log(`📖 Swagger API Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
