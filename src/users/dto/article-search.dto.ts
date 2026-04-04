import { IntersectionType } from '@nestjs/mapped-types';
import { Pagination } from '../../shared/dto/pagination';
import { Sorting } from '../../shared/dto/sorting';
import { GetArticlesFilterDto } from '../../article/dto/get-articles-filter';

export class SearchArticleDto extends IntersectionType(
  GetArticlesFilterDto,
  Pagination,
  Sorting,
) {}
