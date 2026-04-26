import { Exclude, Transform } from 'class-transformer';

export class UserDto {
  id: string;
  login: string;
  role: 'viewer' | 'editor' | 'admin';

  @Exclude()
  password: string;

  @Transform(({ value }) => value.getTime())
  createdAt: Date;

  @Transform(({ value }) => value.getTime())
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
    this.password = undefined;
  }
}
