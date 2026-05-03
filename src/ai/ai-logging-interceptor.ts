import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AiLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const path = req.url;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        console.log(`==================================`);
        console.log(`AI Diagnostics ${path} took ${duration}ms`);
        console.log(`==================================`);
      }),
    );
  }
}
