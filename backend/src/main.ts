import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 * Configures security middleware, CORS, validation, and starts the server
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. Security Headers - Apply first for all requests
  app.use(
    helmet({
      contentSecurityPolicy:
        configService.get('NODE_ENV') === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. CORS Configuration - Apply before routing
  const clientUrl = configService.get<string>(
    'CLIENT_URL',
    'http://localhost:3000',
  );
  app.enableCors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 3. Global Validation Pipe - Validate all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error if unknown properties
      transform: true, // Transform to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Rate Limiting - Applied via ThrottlerGuard in AppModule

  // 5. Startup Logging
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');

  console.log('='.repeat(50));
  console.log('🚀 Backend Server Starting...');
  console.log('='.repeat(50));
  console.log(`📝 Environment: ${environment}`);
  console.log(`🌐 Server URL: http://localhost:${port}`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
  console.log(`🔒 CORS Origin: ${clientUrl}`);
  console.log('='.repeat(50));

  // 6. Graceful Shutdown
  app.enableShutdownHooks();

  // 7. Start Server
  await app.listen(port);

  console.log('✅ Server started successfully');
  console.log('='.repeat(50));
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
