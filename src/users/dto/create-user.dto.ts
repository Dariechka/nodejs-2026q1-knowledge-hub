import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface CreateUser {
  login: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer'; // defaults to 'viewer'
}

export class CreateUserDto implements CreateUser {
  @ApiProperty({ example: 'john456' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    enum: ['admin', 'editor', 'viewer'],
    example: 'viewer',
  })
  @IsOptional()
  @IsIn(['admin', 'editor', 'viewer'])
  role?: 'admin' | 'editor' | 'viewer';
}
