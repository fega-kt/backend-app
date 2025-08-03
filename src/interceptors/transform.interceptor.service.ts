import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { status: number; data: T }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ status: number; data: T }> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response: { statusCode: number } = ctx.getResponse();

        const status = [200, 201].includes(response.statusCode) ? 0 : 1;

        return {
          status,
          data,
        };
      }),
    );
  }
}
