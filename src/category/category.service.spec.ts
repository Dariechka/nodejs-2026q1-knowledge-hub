import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ForbiddenError,
  NotFoundError,
} from '../shared/error/knowledge-hub-errors';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';

describe('CategoryService', () => {
  let service: CategoryService;

  const prismaMock = {
    category: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const adminUser = { role: 'admin', userId: '1' };
  const editorUser = { role: 'editor', userId: '2' };
  const otherEditor = { role: 'editor', userId: '999' };
  const viewerUser = { role: 'viewer', userId: '3' };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CategoryService(prismaMock as any);
  });

  describe('create', () => {
    const dto: CategoryDto = {
      name: 'Name',
      description: 'Description',
    };

    it('should allow admin to create category', async () => {
      prismaMock.category.create.mockResolvedValue({
        ...dto,
        id: '1',
      });

      const result = await service.create(adminUser as any, dto as any);

      expect(prismaMock.category.create).toHaveBeenCalled();
      expect(result.id).toEqual('1');
    });

    it('should forbid editor to create category', async () => {
      await expect(
        service.create(editorUser as any, dto as any),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('findOne', () => {
    it('should return category', async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: '1',
      });

      const result = await service.findOne('1');

      expect(result.id).toEqual('1');
    });

    it('should throw if category not found', async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should call prisma.findMany', async () => {
      prismaMock.category.findMany.mockResolvedValue([]);

      await service.findAll({} as any, {} as any);

      expect(prismaMock.category.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto = { title: 'Updated' };

    it('should allow admin to update', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
      } as any);

      prismaMock.category.update.mockResolvedValue({ id: '1' });

      const result = await service.update(adminUser as any, '1', dto as any);

      expect(result).toBeDefined();
    });

    it('should forbid editor', async () => {
      await expect(
        service.update(editorUser as any, '1', dto as any),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError if prisma fails', async () => {
      prismaMock.category.update.mockRejectedValue(new Error());

      await expect(
        service.update(adminUser as any, '1', dto as any),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('should allow admin to delete', async () => {
      prismaMock.category.delete.mockResolvedValue({});

      await expect(
        service.remove(adminUser as any, '1'),
      ).resolves.toBeUndefined();
    });

    it('should forbid editor', async () => {
      await expect(service.remove(editorUser as any, '1')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should throw NotFoundError if prisma fails', async () => {
      prismaMock.category.delete.mockRejectedValue(new Error());

      await expect(service.remove(adminUser as any, '1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
