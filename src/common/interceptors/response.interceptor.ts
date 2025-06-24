import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response as ExpressRespone } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from '../interfaces/response.interfaces';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.getArgByIndex<ExpressRespone>(1);
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map(
        (data: T) =>
          ({
            statusCode,
            status: 'success',
            data,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          }) as Response<T>,
      ),
    );
  }
}
