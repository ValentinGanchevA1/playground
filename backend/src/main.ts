import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://10.0.2.2:8081', // Android emulator
    ],
    credentials: true,
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('G88 API')
    .setDescription('G88 Location-Based Social Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('locations', 'Geospatial operations')
    .addTag('chat', 'Real-time messaging')
    .addTag('payments', 'Stripe payments')
    .addTag('verification', 'Identity verification')
    .addTag('notifications', 'Push notifications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    G88 Backend Server                         ║
╠═══════════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${port}                 ║
║  📖 API Docs:          http://localhost:${port}/api/docs        ║
║  📱 Android Emulator:  http://10.0.2.2:${port}                  ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
