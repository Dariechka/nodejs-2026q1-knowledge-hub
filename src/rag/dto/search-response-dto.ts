import { ApiProperty } from '@nestjs/swagger';

interface RagSearchResponse {
  results: Array<{
    articleId: string;
    articleTitle: string;
    chunk: string;
    similarity: number;
  }>;
}

export class RagSearchResultDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  articleId: string;

  @ApiProperty({ example: 'How to Reset Your Password' })
  articleTitle: string;

  @ApiProperty({
    description:
      'The specific text snippet from the article that matched the query.',
    example:
      'To reset your password, click on the "Forgot Password" link on the login page...',
  })
  chunk: string;

  @ApiProperty({
    description:
      'The cosine similarity score (0 to 1). Higher is more relevant.',
    example: 0.92,
  })
  similarity: number;
}

export class RagSearchResponseDto implements RagSearchResponse {
  @ApiProperty({ type: [RagSearchResultDto] })
  results: RagSearchResultDto[];
}
