import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import type { CurrentUserData } from '../data/current-user.data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_SECRET_KEY'),
    });
  }

  validate(payload: {
    userId: string;
    role: 'viewer' | 'editor' | 'admin';
  }): CurrentUserData {
    return { userId: payload.userId, role: payload.role };
  }
}
