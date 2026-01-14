import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';



async function bootstrap() {
  dotenv.config({ path: 'api/.env' });
  
  const app = await NestFactory.create(AppModule);
  
  // ✅ Ensure request body parsing is enabled
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({ origin: true, credentials: true });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
