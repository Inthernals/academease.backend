import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const whitelist = ['http://localhost:3000'];

  app.enableCors({
    origin: whitelist,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(3100);
}
bootstrap();
