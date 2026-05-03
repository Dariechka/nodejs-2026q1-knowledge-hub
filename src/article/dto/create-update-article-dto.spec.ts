import { describe, it, expect } from 'vitest';
import { validateDto } from '../../../test/utils/dto.validator';
import { CreateUpdateArticleDto } from './create-update-article-dto';

describe('CreateUpdateArticleDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await validateDto(
      CreateUpdateArticleDto,
      new CreateUpdateArticleDto({
        title: 'Synthesis',
        content: 'Total Synthesis of Triplinone F',
        status: 'draft',
        authorId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        tags: ['synthesis', 'chemistry'],
      }),
    );

    expect(errors.length).toBe(0);
  });

  it('should fail when title is missing', async () => {
    const errors = await validateDto(
      CreateUpdateArticleDto,
      new CreateUpdateArticleDto({
        content: 'Some content',
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when content is empty', async () => {
    const errors = await validateDto(
      CreateUpdateArticleDto,
      new CreateUpdateArticleDto({
        title: 'Valid title',
        content: '',
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail invalid status enum', async () => {
    const errors = await validateDto(
      CreateUpdateArticleDto,
      new CreateUpdateArticleDto({
        title: 'Title',
        content: 'Content',
        status: 'invalid-status' as 'draft',
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should fail invalid UUID for authorId', async () => {
    const errors = await validateDto(
      CreateUpdateArticleDto,
      new CreateUpdateArticleDto({
        title: 'Title',
        content: 'Content',
        authorId: 'not-a-uuid',
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });

  it('should fail when tags contains non-string values', async () => {
    const errors = await validateDto(
      CreateUpdateArticleDto,
      new CreateUpdateArticleDto({
        title: 'Title',
        content: 'Content',
        tags: ['nestjs', 123] as string[],
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should allow null optional UUID fields', async () => {
    const errors = await validateDto(
      CreateUpdateArticleDto,
      new CreateUpdateArticleDto({
        title: 'Title',
        content: 'Content',
        authorId: null,
        categoryId: null,
      }),
    );

    expect(errors.length).toBe(0);
  });
});
