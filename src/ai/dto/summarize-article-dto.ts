import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum MaxLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  DETAILED = 'detailed',
}

export class SummarizeArticleDto {
  @ApiPropertyOptional({
    enum: MaxLength,
    example: MaxLength.SHORT,
  })
  @IsOptional()
  @IsEnum(MaxLength)
  maxLength?: MaxLength = MaxLength.MEDIUM;
}
