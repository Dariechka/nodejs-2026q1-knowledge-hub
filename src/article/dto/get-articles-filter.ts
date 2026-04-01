import { IsOptional, IsString, IsIn } from 'class-validator';

export class GetArticlesFilterDto {
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
