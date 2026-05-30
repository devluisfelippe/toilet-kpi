import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadConfig } from './config/cassandra.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = loadConfig();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: cfg.corsOrigin });
  await app.listen(cfg.port);
}
void bootstrap();
