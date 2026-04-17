export interface JwtPayload {
  sub: string;
  login: string;
  role: 'admin' | 'editor' | 'viewer';
  iat?: number;
  exp?: number;
}
