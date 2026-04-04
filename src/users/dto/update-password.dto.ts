import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface UpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export class UpdatePasswordDto implements UpdatePassword {
  @ApiProperty({ example: 'oldPassword832' })
  @IsString()
  @IsNotEmpty()
  readonly oldPassword: string;

  @ApiProperty({ example: 'newPassword689' })
  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;
}
