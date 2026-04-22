import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private logger = new Logger(CustomExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'An unexpected error occurred';
    const error =
      exception instanceof HttpException
        ? exception.name
        : 'Internal Server Error';

    const responseBody = {
      statusCode: status,
      error,
      message,
    };

    const stack = exception instanceof Error ? exception.stack : null;
    this.logger.error(message, stack);

    this.logger.log({
      ...(ctx.getRequest()._logContext ?? {}),
      status,
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
