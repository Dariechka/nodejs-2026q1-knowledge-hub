import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../shared/error/knowledge-hub-errors';
import { AuthService } from './auth.service';
import type { AuthDto } from './dto/auth.dto';
import type { RefreshDto } from './dto/refresh.dto';

describe('AuthService', () => {
  let service: AuthService;

  const userService = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findByLogin: vi.fn(),
    findOne: vi.fn(),
  };
  const jwtService = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(userService as any, jwtService as any);
  });

  describe('signup', () => {
    const dto: AuthDto = {
      login: 'login',
      password: 'password',
    };

    it('should allow signup', async () => {
      await service.signup(dto as any);

      expect(userService.create).toHaveBeenCalled();
    });

    it('should throw if login is taken', async () => {
      userService.create.mockThrow(new Error());

      await expect(service.signup(dto as any)).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    const dto: AuthDto = {
      login: 'login',
      password: 'password',
    };

    it('should login', async () => {
      userService.findByLogin.mockResolvedValue({
        id: '1',
        password: await bcrypt.hash(dto.password, 10),
      });

      const result = await service.login(dto);

      expect(result).toBeDefined();
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw if password mismatch', async () => {
      userService.findByLogin.mockResolvedValue({
        id: '1',
        password: await bcrypt.hash(dto.password + '-wrong', 10),
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refresh', () => {
    const dto: RefreshDto = {
      refreshToken: 'refreshToken',
    };

    it('should refresh', async () => {
      const user = {
        id: '1',
        login: 'login',
        role: 'admin',
      };
      jwtService.verifyAsync.mockResolvedValue({ userId: '1' });
      userService.findOne.mockResolvedValue(user);

      const result = await service.refresh(dto);

      expect(result).toBeDefined();
    });

    it('should throw if no refresh token', async () => {
      await expect(service.refresh({} as any)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('should throw if verify fails', async () => {
      jwtService.verifyAsync.mockThrow(new Error());

      await expect(service.refresh(dto)).rejects.toThrow(ForbiddenError);
    });
  });
});
