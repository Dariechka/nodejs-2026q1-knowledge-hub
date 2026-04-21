import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { randomUUID } from 'node:crypto';
import { sanitize } from '../utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const uuid = randomUUID();

    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;

    this.logger.log({ uuid, method, url, body: sanitize(body), params, query });

    return next.handle().pipe(
      tap((response) => {
        const delay = Date.now() - now;
        this.logger.log({
          uuid,
          status: response.status,
          duration: `${delay}ms`,
        });
      }),
    );
  }
}
