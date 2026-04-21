import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const corsOrigin = configService.get<string>('CORS_ORIGIN')?.split(',');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    exposedHeaders: '*',
  });

  app.setGlobalPrefix('api/v1');

  await app.listen(configService.getOrThrow<string>('PORT') ?? 3000);
}
void bootstrap();
