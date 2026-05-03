import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class TranslateOutputDto {
  @Expose()
  @ApiProperty({
    description:
      'The content of the article translated into the target language',
    example: 'Este artículo analiza las tendencias de IA en 2026...',
  })
  @IsString()
  @IsNotEmpty()
  translatedText: string;

  @Expose()
  @ApiProperty({
    description: 'The full name of the source language detected by the AI',
    example: 'English',
  })
  @IsString()
  @IsNotEmpty()
  detectedLanguage: string;
}
