import { IsString, IsNotEmpty } from 'class-validator';

export interface UpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export class UpdatePasswordDto implements UpdatePassword {
  @IsString()
  @IsNotEmpty()
  readonly oldPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;
}
