import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './shared/interceptor/logging.interceptor';
import { ErrorInterceptor } from './shared/interceptor/error.interceptor';
import { registerProcessErrorHandlers } from './shared/error-handling/register-process-error.handlers';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
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
    new ErrorInterceptor(),
  );
  const config = new DocumentBuilder()
    .setTitle('Nest.js Knowledge Hub API')
    .setDescription('API for Nest.js Knowledge Hub application')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  registerProcessErrorHandlers(app);
  await app.listen(process.env.PORT);
}

void bootstrap();
