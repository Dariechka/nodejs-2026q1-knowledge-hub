import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export interface SummarizeArticleResponse {
  articleId: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
}

export class SummarizeArticleResponseDto implements SummarizeArticleResponse {
  @ApiProperty({
    description: 'The unique identifier of the article',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  articleId: string;

  @ApiProperty({
    description: 'The AI-generated summary of the article content',
    example: 'This article discusses the rise of renewable energy in 2026...',
  })
  @IsString()
  summary: string;

  @ApiProperty({
    description: 'The character count of the original article text',
    example: 5240,
  })
  @IsNumber()
  originalLength: number;

  @ApiProperty({
    description: 'The character count of the generated summary',
    example: 450,
  })
  @IsNumber()
  summaryLength: number;
}
