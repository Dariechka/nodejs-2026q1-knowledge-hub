import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  ConsoleLogger,
  LogLevel,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './shared/interceptor/logging.interceptor';
import { isProd } from './shared/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger('', {
      logLevels: [process.env.LOG_LEVEL ?? 'log'] as LogLevel[],
      json: isProd,
    }),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new LoggingInterceptor(),
  );
  const config = new DocumentBuilder()
    .setTitle('Nest.js Knowledge Hub API')
    .setDescription('API for Nest.js Knowledge Hub application')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  await app.listen(process.env.PORT);
}
bootstrap();
