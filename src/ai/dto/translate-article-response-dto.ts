import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export interface TranslateArticleResponse {
  articleId: string;
  translatedText: string;
  detectedLanguage: string;
}

export class TranslateArticleResponseDto implements TranslateArticleResponse {
  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the article',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  articleId: string;

  @Expose()
  @ApiProperty({
    description:
      'The content of the article translated into the target language',
    example:
      'Este artículo analiza el auge de las energías renovables en 2026...',
  })
  @IsString()
  @IsNotEmpty()
  translatedText: string;

  @Expose()
  @ApiProperty({
    description: 'The language detected by the AI if not explicitly provided',
    example: 'en',
  })
  @IsString()
  detectedLanguage: string;
}
