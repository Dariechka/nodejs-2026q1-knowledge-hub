import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface CreateCategory {
  name: string;
  description: string;
}

export class CategoryDto implements CreateCategory {
  @ApiProperty({
    example: 'Technology',
    description: 'Category name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Articles related to technology and programming',
    description: 'Category description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
