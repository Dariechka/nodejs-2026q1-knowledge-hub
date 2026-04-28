import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUpdateArticleDto {
  @ApiProperty({ example: 'How to use NestJS with Swagger' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This article explains how to integrate Swagger...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    enum: ['draft', 'published', 'archived'],
    example: 'draft',
  })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';

  @ApiPropertyOptional({
    example: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  authorId: string | null;

  @ApiPropertyOptional({
    example: 'b3bb189e-8bf9-3888-9912-ace4e6543003',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  categoryId: string | null;

  @ApiPropertyOptional({
    type: [String],
    example: ['nestjs', 'swagger', 'backend'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  constructor(partial: Partial<CreateUpdateArticleDto>) {
    Object.assign(this, partial);
  }
}
