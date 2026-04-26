import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ForbiddenError,
  NotFoundError,
} from '../shared/error/knowledge-hub-errors';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { UpdatePasswordDto } from './dto/update-password.dto';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UsersService(prismaMock as any);
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      login: 'login',
      password: 'password',
      role: 'viewer',
    };

    it('should allow create user', async () => {
      prismaMock.user.create.mockResolvedValue({
        ...dto,
        id: 1,
      });

      const result = await service.create(dto);

      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result.id).toEqual(1);
    });
  });

  describe('findOne', () => {
    it('should return user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
      });

      const result = await service.findOne('1');

      expect(result.id).toEqual('1');
    });

    it('should strip out password from user response', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        password: 'password',
      });

      const result = await service.findOne('1');

      expect(result.id).toEqual('1');
      expect(result.password).toBeUndefined();
    });

    it('should throw if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findByLogin', () => {
    it('should return user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
      });

      const result = await service.findByLogin('login');

      expect(result.id).toEqual('1');
    });

    it('should throw if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findByLogin('login')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should call prisma.findMany', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await service.findAll({} as any, {} as any);

      expect(prismaMock.user.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto: UpdatePasswordDto = {
      oldPassword: 'oldpassword',
      newPassword: 'newpassword',
    };

    it('should allow to update password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        password: dto.oldPassword,
      });

      prismaMock.user.update.mockResolvedValue({ id: '1' });

      const result = await service.update('1', dto);

      expect(result).toBeDefined();
    });

    it('should throw if no user found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.update('1', dto)).rejects.toThrow(NotFoundError);
    });

    it('should throw if password is wrong', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        password: dto.oldPassword + '-wrong',
      });

      await expect(service.update('1', dto)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('remove', () => {
    it('should delete', async () => {
      prismaMock.user.delete.mockResolvedValue(undefined);

      await expect(service.remove('1')).resolves.toBeUndefined();
    });

    it('should throw not found', async () => {
      prismaMock.user.delete.mockThrow(new Error());

      await expect(service.remove('1')).rejects.toThrow(NotFoundError);
    });
  });
});
