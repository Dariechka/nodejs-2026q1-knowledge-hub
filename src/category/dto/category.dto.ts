import { IsString, IsNotEmpty } from 'class-validator';

export interface CreateCategory {
  name: string;
  description: string;
}

export class CategoryDto implements CreateCategory {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
