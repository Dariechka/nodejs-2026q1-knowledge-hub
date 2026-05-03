import { describe, it, expect } from 'vitest';
import { validateDto } from '../../../test/utils/dto.validator';
import { CreateCommentDto } from './create-comment.dto';

describe('CreateCommentDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await validateDto(
      CreateCommentDto,
      new CreateCommentDto({
        content: 'This article is very helpful!',
        articleId: '6c4a84bc-86ea-4ccf-bec8-b7b11a90b67b',
        authorId: '8bef8474-1842-42c1-9ca4-4297ac0a40d2',
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should allow null authorId', async () => {
    const errors = await validateDto(
      CreateCommentDto,
      new CreateCommentDto({
        content: 'Nice article!',
        articleId: '6c4a84bc-86ea-4ccf-bec8-b7b11a90b67b',
        authorId: null,
      }),
    );
    expect(errors.length).toBe(0);
  });

  it('should fail when content is missing', async () => {
    const errors = await validateDto(
      CreateCommentDto,
      new CreateCommentDto({
        articleId: '6c4a84bc-86ea-4ccf-bec8-b7b11a90b67b',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when content is empty', async () => {
    const errors = await validateDto(
      CreateCommentDto,
      new CreateCommentDto({
        content: '',
        articleId: '6c4a84bc-86ea-4ccf-bec8-b7b11a90b67b',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when articleId is missing', async () => {
    const errors = await validateDto(
      CreateCommentDto,
      new CreateCommentDto({
        content: 'Valid content',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when articleId is not a UUID', async () => {
    const errors = await validateDto(
      CreateCommentDto,
      new CreateCommentDto({
        content: 'Valid content',
        articleId: 'not-a-uuid',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });

  it('should fail when authorId is not a UUID', async () => {
    const errors = await validateDto(
      CreateCommentDto,
      new CreateCommentDto({
        content: 'Valid content',
        articleId: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
        authorId: 'not-a-uuid',
      }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });
});
