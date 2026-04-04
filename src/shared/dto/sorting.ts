import { IsDefined, IsEnum, IsString, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class Sorting {
  @ValidateIf((o) => o.sortBy !== undefined || o.order !== undefined)
  @IsDefined()
  @IsString()
  sortBy?: string;

  @ValidateIf((o) => o.sortBy !== undefined || o.order !== undefined)
  @IsDefined()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(SortOrder)
  order?: SortOrder;
}
