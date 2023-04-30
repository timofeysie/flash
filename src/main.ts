import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: false,
    preflightContinue: true,
    methods: ['GET,POST,OPTIONS,DELETE,PUT'],
  });
  await app.listen(3000);
}
bootstrap();
