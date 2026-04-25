import { describe, it, expect } from 'vitest';
import { ArticleDto } from './article-dto';
import { convertDto } from '../../../test/utils/dto.convert';

describe('ArticleDto', () => {
  it('should map partial object correctly via constructor', () => {
    const dto = new ArticleDto({
      id: '1',
      title: 'Test article',
      content: 'Content',
      authorId: 'author-1',
      categoryId: null,
      tags: ['something'],
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    });

    expect(dto.id).toBe('1');
    expect(dto.title).toBe('Test article');
    expect(dto.tags).toEqual(['something']);
  });

  it('should transform createdAt to timestamp', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');

    const dto = convertDto(ArticleDto, {
      id: '1',
      title: 'Test',
      content: 'Content',
      authorId: null,
      categoryId: null,
      createdAt: date,
      updatedAt: date,
    });

    expect(dto.createdAt).toBe(date.getTime());
  });

  it('should transform updatedAt to timestamp', () => {
    const date = new Date('2024-01-02T00:00:00.000Z');

    const dto = convertDto(ArticleDto, {
      id: '1',
      title: 'Test',
      content: 'Content',
      authorId: null,
      categoryId: null,
      createdAt: date,
      updatedAt: date,
    });

    expect(dto.updatedAt).toBe(date.getTime());
  });

  it('should handle optional fields', () => {
    const dto = new ArticleDto({
      id: '1',
      title: 'Test',
      content: 'Content',
      authorId: null,
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(dto.tags).toBeUndefined();
    expect(dto.status).toBeUndefined();
  });
});
