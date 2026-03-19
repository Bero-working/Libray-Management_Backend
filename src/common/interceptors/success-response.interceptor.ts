import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { serializeJsonValue } from '../serializers/json-value.serializer';

type SuccessEnvelope<T> = {
  success: true;
  data: T;
};

@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessEnvelope<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessEnvelope<T> | T> {
    return next.handle().pipe(
      map((data) => {
        if (this.shouldBypass(context, data)) {
          return data;
        }

        if (
          typeof data === 'object' &&
          data !== null &&
          'success' in data &&
          data.success === true &&
          'data' in data
        ) {
          return {
            ...(data as SuccessEnvelope<T>),
            data: serializeJsonValue((data as SuccessEnvelope<T>).data) as T,
          };
        }

        return {
          success: true,
          data: serializeJsonValue(data) as T,
        };
      }),
    );
  }

  private shouldBypass(context: ExecutionContext, data: T): boolean {
    if (data instanceof StreamableFile) {
      return true;
    }

    const response = context.switchToHttp().getResponse<{
      getHeader?: (name: string) => string | string[] | number | undefined;
    }>();
    const contentType = response.getHeader?.('content-type');

    return (
      typeof contentType === 'string' &&
      !contentType.includes('application/json')
    );
  }
}
