import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export interface AnalyzeArticleResponse {
  articleId: string;
  analysis: string;
  suggestions: string[];
  severity: 'info' | 'warning' | 'error';
}

export enum AnalysisSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export class AnalyzeArticleResponseDto implements AnalyzeArticleResponse {
  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the article',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  articleId: string;

  @Expose()
  @ApiProperty({
    description: 'Detailed AI analysis of the article content',
    example:
      'The article contains several technical inaccuracies regarding 2026 battery tech.',
  })
  @IsString()
  @IsNotEmpty()
  analysis: string;

  @Expose()
  @ApiProperty({
    description: 'List of actionable suggestions to improve the article',
    example: [
      'Update the energy density figures',
      'Add a citation for the solid-state section',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  suggestions: string[];

  @Expose()
  @ApiProperty({
    description: 'The priority level of the analysis findings',
    enum: AnalysisSeverity,
    example: 'warning',
  })
  @IsEnum(AnalysisSeverity)
  severity: 'info' | 'warning' | 'error';
}
