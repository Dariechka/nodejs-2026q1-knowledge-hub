import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthDto } from './dto/auth.dto';
import type { RefreshDto } from './dto/refresh.dto';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async signup(authDto: AuthDto) {
    const hash = await bcrypt.hash(
      authDto.password,
      Number(process.env.CRYPT_SALT),
    );

    try {
      await this.userService.create({
        login: authDto.login,
        password: hash,
        role: 'viewer',
      });

      return { message: 'Successfully signed up' };
    } catch {
      throw new BadRequestException('Login already taken');
    }
  }

  async login(authDto: AuthDto) {
    const user = await this.userService.findByLogin(authDto.login);
    if (!(await bcrypt.compare(authDto.password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      userId: user.id,
      login: user.login,
      role: user.role,
    } satisfies JwtPayload;
    return this.generateJwt(payload);
  }

  async refresh(refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedException('No refresh token is present in body');
    }
    try {
      const payload: JwtPayload = await this.jwt.verifyAsync(
        refreshDto.refreshToken,
        {
          secret: process.env.JWT_SECRET_REFRESH_KEY,
        },
      );
      return this.generateJwt(payload);
    } catch {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }
  }

  private async generateJwt(payload: JwtPayload) {
    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: process.env.TOKEN_EXPIRE_TIME as StringValue,
        secret: process.env.JWT_SECRET_KEY,
      }),
      refresh_token: await this.jwt.signAsync(payload, {
        expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME as StringValue,
        secret: process.env.JWT_SECRET_REFRESH_KEY,
      }),
    };
  }
}
