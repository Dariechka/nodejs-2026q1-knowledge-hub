import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorInterceptor } from './error.interceptor';
import { lastValueFrom, of, throwError } from 'rxjs';
import { ForbiddenError } from '../error/knowledge-hub-errors';
import { StatusCodes } from 'http-status-codes';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
  };

  const mockContext = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
    }),
  } as any;

  beforeEach(() => {
    interceptor = new ErrorInterceptor();
    vi.clearAllMocks();
  });

  it('passes through success', async () => {
    const handler = {
      handle: () => of({ data: 'ok' }),
    };

    const result = await lastValueFrom(
      interceptor.intercept(mockContext, handler as any),
    );

    expect(result).toEqual({ data: 'ok' });
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('handles generic error', async () => {
    const handler = {
      handle: () => throwError(() => new Error('Boom')),
    };

    const result = await lastValueFrom(
      interceptor.intercept(mockContext, handler as any),
    );

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(result).toEqual({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });

  it('handles ForbiddenError', async () => {
    const handler = {
      handle: () => throwError(() => new ForbiddenError()),
    };

    const result = await lastValueFrom(
      interceptor.intercept(mockContext, handler as any),
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(result).toEqual({
      statusCode: StatusCodes.FORBIDDEN,
      error: 'ForbiddenError',
      message: 'Access denied',
    });
  });

  it('should handle HttpException branch', async () => {
    const error = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);

    const handler = {
      handle: () => throwError(() => error),
    };

    const result = await lastValueFrom(
      interceptor.intercept(mockContext, handler as any),
    );

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);

    expect(result).toEqual({
      statusCode: HttpStatus.FORBIDDEN,
      error: 'HttpException',
      message: 'Forbidden resource',
    });
  });

  it('should handle string branch', async () => {
    const error = 'Forbidden resource';

    const handler = {
      handle: () => throwError(() => error),
    };

    const result = await lastValueFrom(
      interceptor.intercept(mockContext, handler as any),
    );

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(result).toEqual({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });
});
