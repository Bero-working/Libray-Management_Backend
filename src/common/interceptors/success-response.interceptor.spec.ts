import { CallHandler, ExecutionContext, StreamableFile } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { SuccessResponseInterceptor } from './success-response.interceptor';

describe('SuccessResponseInterceptor', () => {
  const createExecutionContext = (contentType?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({
          getHeader: () => contentType,
        }),
      }),
    }) as ExecutionContext;

  it('wraps payloads in a success envelope', async () => {
    const interceptor = new SuccessResponseInterceptor();
    const executionContext = createExecutionContext('application/json');
    const callHandler = {
      handle: () => of({ status: 'ok' }),
    } as CallHandler;

    await expect(
      lastValueFrom(interceptor.intercept(executionContext, callHandler)),
    ).resolves.toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });

  it('serializes bigint values before returning success payloads', async () => {
    const interceptor = new SuccessResponseInterceptor();
    const executionContext = createExecutionContext('application/json');
    const callHandler = {
      handle: () => of({ id: BigInt(1) }),
    } as CallHandler;

    await expect(
      lastValueFrom(interceptor.intercept(executionContext, callHandler)),
    ).resolves.toEqual({
      success: true,
      data: { id: '1' },
    });
  });

  it('does not double wrap responses already in the success envelope', async () => {
    const interceptor = new SuccessResponseInterceptor();
    const executionContext = createExecutionContext('application/json');
    const callHandler = {
      handle: () => of({ success: true, data: { status: 'ok' } }),
    } as CallHandler;

    await expect(
      lastValueFrom(interceptor.intercept(executionContext, callHandler)),
    ).resolves.toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });

  it('bypasses non-json responses', async () => {
    const interceptor = new SuccessResponseInterceptor();
    const executionContext = createExecutionContext('application/pdf');
    const file = new StreamableFile(Buffer.from('pdf'));
    const callHandler = {
      handle: () => of(file),
    } as CallHandler;

    await expect(
      lastValueFrom(interceptor.intercept(executionContext, callHandler)),
    ).resolves.toBe(file);
  });
});
