import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslateArticleDto {
  @ApiProperty({
    description: 'The language you want to translate the article into',
    example: 'French',
  })
  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @ApiPropertyOptional({
    description: 'The original language of the article (optional)',
    example: 'English',
  })
  @IsString()
  @IsOptional()
  sourceLanguage?: string;
}
