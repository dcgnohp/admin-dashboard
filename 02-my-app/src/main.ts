import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  app.enableCors(
    {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      preflightContinue: false,
      credentials: true
    }
  );
  app.setGlobalPrefix('api/v1', { exclude: [''] });

  await app.listen(port);
}
bootstrap();
