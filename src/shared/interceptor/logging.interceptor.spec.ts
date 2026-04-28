import { vi } from 'vitest';
import { LoggingInterceptor } from './logging.interceptor';
import { randomUUID } from 'node:crypto';
import { lastValueFrom, of } from 'rxjs';

vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  const mockRequest = {
    method: 'POST',
    url: '/test',
    body: { password: 'secret' },
    params: { id: '1' },
    query: { q: 'search' },
  };

  const mockResponse = {
    statusCode: 200,
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
  } as any;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    vi.clearAllMocks();

    vi.mocked(randomUUID).mockReturnValue(
      '05d7db19-6f6a-4ef1-9631-0234b91740ba',
    );

    vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1050);
  });

  it('should log request and response', async () => {
    const handler = {
      handle: () => of('ok'),
    };

    const logSpy = vi.spyOn(interceptor['logger'], 'log');

    await lastValueFrom(interceptor.intercept(mockContext, handler as any));

    expect(logSpy).toHaveBeenNthCalledWith(1, {
      uuid: '05d7db19-6f6a-4ef1-9631-0234b91740ba',
      method: 'POST',
      url: '/test',
      body: expect.any(Object),
      params: { id: '1' },
      query: { q: 'search' },
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        uuid: '05d7db19-6f6a-4ef1-9631-0234b91740ba',
      }),
    );
  });
});
