import { describe, it, expect } from 'vitest';
import { GetArticlesFilterDto } from './get-articles-filter';
import { validateDto } from '../../../test/utils/dto.validator';

describe('GetArticlesFilterDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await validateDto(
      GetArticlesFilterDto,
      new GetArticlesFilterDto({
        status: 'published',
        categoryId: 'uuid-123',
        authorId: 'uuid-456',
        tag: 'something',
      }),
    );

    expect(errors.length).toBe(0);
  });

  it('should fail invalid status enum', async () => {
    const errors = await validateDto(
      GetArticlesFilterDto,
      new GetArticlesFilterDto({
        status: 'invalid-status' as 'draft',
      }),
    );

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should accept empty payload (all optional)', async () => {
    const errors = await validateDto(
      GetArticlesFilterDto,
      new GetArticlesFilterDto({}),
    );
    expect(errors.length).toBe(0);
  });
});
