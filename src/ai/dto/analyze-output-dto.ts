import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { AnalysisSeverity } from './analyze-article-response-dto';

export class AnalyzeOutputDto {
  @Expose()
  @ApiProperty({
    description: 'A detailed narrative summary of the AI findings',
    example:
      'The article is well-structured but lacks citations for the 2026 market data.',
  })
  @IsString()
  @IsNotEmpty()
  analysis: string;

  @Expose()
  @ApiProperty({
    description: 'An array of specific, actionable improvement points',
    example: [
      'Add a source for the 15% growth claim',
      'Clarify the technical definition of solid-state',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  suggestions: string[];

  @Expose()
  @ApiProperty({
    description:
      "The findings priority. Must be: 'info', 'warning', or 'error'",
    enum: AnalysisSeverity,
    example: 'warning',
  })
  @IsEnum(AnalysisSeverity)
  severity: AnalysisSeverity;
}
