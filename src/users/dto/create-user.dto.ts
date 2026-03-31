export interface CreateUserDto {
  login: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer'; // defaults to 'viewer'
}
