import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Drops any properties that are not in your DTO
    forbidNonWhitelisted: true, // Instead of silently dropping unknown fields, it throws 400 if any extra props are present
    transform: true, // Converts the plain JSON into an instance of your DTO class
    transformOptions: { enableImplicitConversion: true },
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
