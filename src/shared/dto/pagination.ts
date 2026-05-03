import { IsDefined, IsInt, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class Pagination {
  @ValidateIf((o) => o.page !== undefined || o.limit !== undefined)
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @ValidateIf((o) => o.page !== undefined || o.limit !== undefined)
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  constructor(partial: Partial<Pagination>) {
    Object.assign(this, partial);
  }
}
