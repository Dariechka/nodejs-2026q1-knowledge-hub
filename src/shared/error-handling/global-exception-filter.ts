import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { KnowledgeHubError } from './knowledge-hub-errors';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private logger = new Logger(CustomExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let error = 'Internal Server Error';

    if (exception instanceof KnowledgeHubError) {
      status = exception.statusCode;
      message = exception.message;
      error = exception.name;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      error = exception.name;
    }

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
