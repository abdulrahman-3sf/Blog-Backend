import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(helmet()); // secure headers
  app.use(cookieParser());

  app.enableCors({
    origin: ['https://abdulrahman-3sf.github.io'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Drops any properties that are not in your DTO
    forbidNonWhitelisted: true, // Instead of silently dropping unknown fields, it throws 400 if any extra props are present
    transform: true, // Converts the plain JSON into an instance of your DTO class
    transformOptions: { enableImplicitConversion: true },
  }));

  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Production-grade Blog backend with JWT access tokens, refresh cookie, RBAC, CSRF')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Access token' },
      'access-token',
    )
    .addCookieAuth( // to show the refresh cookie usage in docs (informational)
      process.env.REFRESH_COOKIE_NAME ?? 'refresh_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description: 'HTTP-only refresh token (sent by browser automatically).',
      },
      'refresh-cookie',
    )
    .addApiKey(     // CSRF header
      { type: 'apiKey', in: 'header', name: process.env.CSRF_HEADER_NAME ?? 'x-csrf-token', description: 'CSRF token (must match csrf_token cookie)' },
      'csrf-header',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
