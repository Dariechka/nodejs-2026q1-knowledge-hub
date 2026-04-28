import { describe, it, expect } from 'vitest';
import { CommentDto } from './comment.dto';
import { plainToInstance } from 'class-transformer';

describe('CommentDto', () => {
  it('should assign all properties via constructor', () => {
    const date = new Date('2024-01-01T12:00:00.000Z');

    const dto = new CommentDto({
      id: 'comment-1',
      content: 'This is a comment',
      articleId: 'article-1',
      authorId: 'author-1',
      createdAt: date,
    });

    expect(dto.id).toBe('comment-1');
    expect(dto.content).toBe('This is a comment');
    expect(dto.articleId).toBe('article-1');
    expect(dto.authorId).toBe('author-1');
    expect(dto.createdAt).toBe(date);
  });

  it('should transform createdAt to timestamp with class-transformer', () => {
    const date = new Date('2024-01-01T12:00:00.000Z');

    const dto = plainToInstance(CommentDto, {
      id: 'comment-1',
      content: 'This is a comment',
      articleId: 'article-1',
      authorId: 'author-1',
      createdAt: date,
    });

    const transformed =
      dto.createdAt instanceof Date ? dto.createdAt.getTime() : dto.createdAt;

    expect(transformed).toBe(date.getTime());
  });
});
