import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArticleService } from './article.service';
import {
  ForbiddenError,
  NotFoundError,
} from '../shared/error/knowledge-hub-errors';

describe('ArticleService', () => {
  let service: ArticleService;

  const prismaMock = {
    article: {
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
    service = new ArticleService(prismaMock as any);
  });

  describe('create', () => {
    const dto = {
      title: 'Test',
      content: 'Content',
      authorId: '2',
      categoryId: '10',
      tags: ['nestjs'],
    };

    it('should allow admin to create article', async () => {
      prismaMock.article.create.mockResolvedValue({
        ...dto,
        id: '1',
        tags: [{ name: 'nestjs' }],
      });

      const result = await service.create(adminUser as any, dto as any);

      expect(prismaMock.article.create).toHaveBeenCalled();
      expect(result.tags).toEqual(['nestjs']);
    });

    it('should allow editor to create own article', async () => {
      prismaMock.article.create.mockResolvedValue({
        ...dto,
        id: '1',
        tags: [],
      });

      await expect(
        service.create(editorUser as any, dto as any),
      ).resolves.toBeDefined();
    });

    it('should forbid editor creating for another user', async () => {
      await expect(
        service.create(otherEditor as any, dto as any),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should forbid viewer', async () => {
      await expect(
        service.create(viewerUser as any, dto as any),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should create article with author, category and tags', async () => {
      prismaMock.article.create.mockResolvedValue({
        id: '1',
        tags: [{ name: 'nestjs' }, { name: 'ts' }],
      });

      const dto = {
        title: 'Test',
        content: 'Content',
        authorId: 'author-1',
        categoryId: 'category-1',
        tags: ['nestjs', 'ts'],
      };

      await service.create(adminUser as any, dto as any);

      expect(prismaMock.article.create).toHaveBeenCalledWith({
        include: { tags: { select: { name: true } } },
        data: {
          title: 'Test',
          content: 'Content',
          author: { connect: { id: 'author-1' } },
          category: { connect: { id: 'category-1' } },
          tags: {
            connectOrCreate: [
              {
                where: { name: 'nestjs' },
                create: { name: 'nestjs' },
              },
              {
                where: { name: 'ts' },
                create: { name: 'ts' },
              },
            ],
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return article with mapped tags', async () => {
      prismaMock.article.findUnique.mockResolvedValue({
        id: '1',
        tags: [{ name: 'nestjs' }],
      });

      const result = await service.findOne('1');

      expect(result.tags).toEqual(['nestjs']);
    });

    it('should throw if article not found', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should call prisma.findMany', async () => {
      prismaMock.article.findMany.mockResolvedValue([]);

      await service.findAll({} as any, {} as any, {} as any);

      expect(prismaMock.article.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto = { title: 'Updated' };

    it('should allow admin to update', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      prismaMock.article.update.mockResolvedValue({ id: '1' });

      const result = await service.update(adminUser as any, '1', dto as any);

      expect(result).toBeDefined();
    });

    it('should forbid viewer', async () => {
      await expect(
        service.update(viewerUser as any, '1', dto as any),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should forbid editor updating чужой article', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      await expect(
        service.update(otherEditor as any, '1', dto as any),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError if prisma fails', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      prismaMock.article.update.mockRejectedValue(new Error());

      await expect(
        service.update(adminUser as any, '1', dto as any),
      ).rejects.toThrow(NotFoundError);
    });
    it('should update article with all fields', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      const dto = {
        title: 'Updated',
        content: 'Updated content',
        authorId: '2',
        categoryId: '10',
        tags: ['nestjs', 'ts'],
      };

      prismaMock.article.update.mockResolvedValue({ id: '1' });

      await service.update(adminUser as any, '1', dto as any);

      expect(prismaMock.article.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          title: 'Updated',
          content: 'Updated content',
          author: { connect: { id: '2' } },
          category: { connect: { id: '10' } },
          tags: {
            connectOrCreate: [
              {
                where: { name: 'nestjs' },
                create: { name: 'nestjs' },
              },
              {
                where: { name: 'ts' },
                create: { name: 'ts' },
              },
            ],
          },
        },
      });
    });
    it('should NOT enter editor restriction block for non-editor users', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '999',
      } as any);

      const admin = {
        role: 'admin',
        userId: '1',
      };

      prismaMock.article.update.mockResolvedValue({ id: '1' });

      await service.update(admin as any, '1', {
        title: 'Update',
      } as any);

      expect(prismaMock.article.update).toHaveBeenCalled();
    });
    it('should allow editor updating own article', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      const editor = { role: 'editor', userId: '2' };

      prismaMock.article.update.mockResolvedValue({ id: '1' });

      await expect(
        service.update(editor as any, '1', {
          title: 'Updated',
        } as any),
      ).resolves.toBeDefined();
    });
    it('should forbid viewer from updating article', async () => {
      const viewer = {
        role: 'viewer',
        userId: '1',
      };

      await expect(
        service.update(viewer as any, '1', {
          title: 'Update',
        } as any),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('remove', () => {
    it('should allow admin to delete', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      prismaMock.article.delete.mockResolvedValue({});

      await expect(
        service.remove(adminUser as any, '1'),
      ).resolves.toBeUndefined();
    });

    it('should forbid viewer', async () => {
      await expect(service.remove(viewerUser as any, '1')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should forbid editor deleting foreign article', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      await expect(service.remove(otherEditor as any, '1')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should throw NotFoundError if prisma fails', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      prismaMock.article.delete.mockRejectedValue(new Error());

      await expect(service.remove(adminUser as any, '1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
