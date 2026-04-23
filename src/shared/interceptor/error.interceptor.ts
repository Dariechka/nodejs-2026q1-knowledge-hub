import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, of } from 'rxjs';
import { KnowledgeHubError } from '../error/knowledge-hub-errors';
import { Response } from 'express';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      catchError((error: any) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'An unexpected error occurred';
        let errorText = 'Internal Server Error';

        if (error instanceof KnowledgeHubError) {
          status = error.statusCode;
          message = error.message;
          errorText = error.name;
        } else if (error instanceof HttpException) {
          status = error.getStatus();
          message = error.message;
          errorText = error.name;
        }

        const stack = error instanceof Error ? error.stack : null;
        this.logger.error(message, stack);

        response.status(status);
        return of({
          statusCode: status,
          error: errorText,
          message,
        });
      }),
    );
  }
}
