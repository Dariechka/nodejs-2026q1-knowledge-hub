export interface JwtPayload {
  sub: string;
  userId: string;
  login: string;
  role: 'viewer' | 'editor' | 'admin';
}
