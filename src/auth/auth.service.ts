import { Injectable } from '@nestjs/common';
import type { AuthDto } from './dto/auth.dto';
import type { RefreshDto } from './dto/refresh.dto';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { StringValue } from 'ms';
import type { User } from '@prisma/client';
import type { UserDto } from '../users/dto/user.dto';
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from '../shared/error/knowledge-hub-errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async signup(authDto: AuthDto): Promise<UserDto> {
    const hash = await bcrypt.hash(
      authDto.password,
      Number(process.env.CRYPT_SALT),
    );

    try {
      return await this.userService.create({
        login: authDto.login,
        password: hash,
        role: 'viewer',
      });
    } catch (error) {
      throw new ValidationError('Login already taken');
    }
  }

  async login(authDto: AuthDto) {
    const user = await this.userService.findByLogin(authDto.login);
    if (!(await bcrypt.compare(authDto.password, user.password))) {
      throw new UnauthorizedError();
    }
    return this.generateJwt(this.createJwtPayload(user));
  }

  async refresh(refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedError('No refresh token is present in body');
    }
    try {
      const payload: { userId: string } = await this.jwt.verifyAsync(
        refreshDto.refreshToken,
        {
          secret: process.env.JWT_SECRET_REFRESH_KEY,
        },
      );
      const user = await this.userService.findOne(payload.userId);
      return this.generateJwt(this.createJwtPayload(user));
    } catch {
      throw new ForbiddenError('Refresh token is invalid or expired');
    }
  }

  private createJwtPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      userId: user.id,
      login: user.login,
      role: user.role,
    };
  }

  private async generateJwt(payload: JwtPayload) {
    return {
      accessToken: await this.jwt.signAsync(payload, {
        expiresIn: process.env.TOKEN_EXPIRE_TIME as StringValue,
        secret: process.env.JWT_SECRET_KEY,
      }),
      refreshToken: await this.jwt.signAsync(payload, {
        expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME as StringValue,
        secret: process.env.JWT_SECRET_REFRESH_KEY,
      }),
    };
  }
}
