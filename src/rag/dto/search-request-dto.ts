import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

interface RagSearchRequest {
  query: string; // required
  limit?: number; // optional, default 5, max 20
  articleStatus?: 'draft' | 'published' | 'archived'; // optional filter
  categoryId?: string; // optional filter
  tags?: string[]; // optional filter
}

export class RagSearchRequestDto implements RagSearchRequest {
  @ApiProperty({
    description: 'The natural language query or question',
    example: 'How do I reset my password?',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({
    description: 'Number of results to return (max 20)',
    default: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;

  @ApiPropertyOptional({
    description: 'Filter by article lifecycle status',
    enum: ['draft', 'published', 'archived'],
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], {
    message: 'articleStatus must be draft, published, or archived',
  })
  articleStatus?: 'draft' | 'published' | 'archived';

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by one or more tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
