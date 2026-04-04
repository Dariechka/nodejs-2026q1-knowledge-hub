import { IntersectionType } from '@nestjs/mapped-types';
import { Pagination } from '../../shared/dto/pagination';
import { Sorting } from '../../shared/dto/sorting';

export class SearchDto extends IntersectionType(Pagination, Sorting) {}
