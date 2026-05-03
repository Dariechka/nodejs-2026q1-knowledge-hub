import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ForbiddenError,
  NotFoundError,
  UnprocessableError,
} from '../shared/error/knowledge-hub-errors';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentService', () => {
  let service: CommentService;

  const prismaMock = {
    comment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
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
    service = new CommentService(prismaMock as any);
  });

  describe('create', () => {
    const dto: CreateCommentDto = {
      content: 'Content',
      articleId: '1',
      authorId: '2',
    };

    it('should allow admin to create comment', async () => {
      prismaMock.comment.create.mockResolvedValue({
        ...dto,
        id: '1',
      });
      prismaMock.article.findUnique.mockResolvedValue({ id: '1' });

      const result = await service.create(adminUser as any, dto as any);

      expect(prismaMock.comment.create).toHaveBeenCalled();
      expect(result.id).toEqual('1');
    });

    it('should throw if article not found', async () => {
      prismaMock.comment.create.mockResolvedValue({
        ...dto,
        id: '1',
        authorId: '2',
      });
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(
        service.create(editorUser as any, dto as any),
      ).rejects.toThrow(UnprocessableError);
    });

    it('should throw if user is viewer', async () => {
      prismaMock.comment.create.mockResolvedValue({
        ...dto,
        id: '1',
        authorId: '2',
      });
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(
        service.create(viewerUser as any, dto as any),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('findByArticleId', () => {
    it('should return article with mapped tags', async () => {
      prismaMock.comment.findMany.mockResolvedValue([]);

      const result = await service.findByArticleId(
        { articleId: '1' },
        {} as any,
        {} as any,
      );

      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return comment', async () => {
      prismaMock.comment.findUnique.mockResolvedValue({
        id: '1',
      });

      const result = await service.findOne('1');

      expect(result.id).toEqual('1');
    });

    it('should throw if article not found', async () => {
      prismaMock.comment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('remove', () => {
    it('should allow admin to delete', async () => {
      prismaMock.comment.delete.mockResolvedValue(undefined);
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      await expect(
        service.remove(adminUser as any, '1'),
      ).resolves.toBeUndefined();
    });

    it('should forbid viewer', async () => {
      await expect(service.remove(viewerUser as any, '1')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should forbid editor deleting foreign comment', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({
        id: '1',
        authorId: '2',
      } as any);

      await expect(service.remove(otherEditor as any, '1')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should throw NotFoundError if prisma fails', async () => {
      prismaMock.comment.delete.mockRejectedValue(new Error());

      await expect(service.remove(adminUser as any, '1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
