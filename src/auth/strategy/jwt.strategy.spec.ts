import { describe, it, expect } from 'vitest';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const configServiceMock = {
    getOrThrow: () => 'test-secret',
  } as any;

  const strategy = new JwtStrategy(configServiceMock);

  it('should transform payload into CurrentUserData', () => {
    const payload = {
      userId: '123',
      role: 'admin' as const,
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: '123',
      role: 'admin',
    });
  });
});
