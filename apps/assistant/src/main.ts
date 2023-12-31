/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import {IoAdapter} from "@nestjs/platform-socket.io";

export class SocketAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: any
  ) {
    const server = super.createIOServer(port, { ...options, cors: true });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      allowedHeaders: ['content-type'],
      origin: 'http://localhost:4200',
      credentials: true,
    }
  );
  app.useWebSocketAdapter(new SocketAdapter(app));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
