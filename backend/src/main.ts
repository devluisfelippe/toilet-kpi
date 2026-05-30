import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadConfig } from './config/cassandra.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = loadConfig();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: config.corsOrigin });
  await app.listen(config.port);
}
void bootstrap();
