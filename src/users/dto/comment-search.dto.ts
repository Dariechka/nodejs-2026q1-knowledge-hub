import { IntersectionType } from '@nestjs/mapped-types';
import { Pagination } from '../../shared/dto/pagination';
import { Sorting } from '../../shared/dto/sorting';
import { GetCommentFilterDto } from '../../comment/dto/get-comment-filter';

export class SearchCommentDto extends IntersectionType(
  GetCommentFilterDto,
  Pagination,
  Sorting,
) {}
