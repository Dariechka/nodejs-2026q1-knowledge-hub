import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetArticlesFilterDto {
  @ApiPropertyOptional({
    enum: ['draft', 'published', 'archived'],
    example: 'published',
  })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @ApiPropertyOptional({
    example: 'b3bb189e-8bf9-3888-9912-ace4e6543003',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'b3bb189e-8bf9-3888-9912-ace4e6543003',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    example: 'nestjs',
  })
  @IsOptional()
  @IsString()
  tag?: string;
}
