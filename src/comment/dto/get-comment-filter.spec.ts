import { describe, it, expect } from 'vitest';
import { validateDto } from '../../../test/utils/dto.validator';
import { GetCommentFilterDto } from './get-comment-filter';

describe('GetCommentFilterDto', () => {
  it('should pass with valid articleId', async () => {
    const errors = await validateDto(
      GetCommentFilterDto,
      new GetCommentFilterDto({
        articleId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should fail when articleId is missing', async () => {
    const errors = await validateDto(
      GetCommentFilterDto,
      new GetCommentFilterDto({}),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when articleId is empty string', async () => {
    const errors = await validateDto(
      GetCommentFilterDto,
      new GetCommentFilterDto({ articleId: '' }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when articleId is not a UUID', async () => {
    const errors = await validateDto(
      GetCommentFilterDto,
      new GetCommentFilterDto({
        articleId: '1234',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });
});
