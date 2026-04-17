import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthDto } from './dto/auth.dto';
import type { RefreshDto } from './dto/refresh.dto';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(authDto: AuthDto) {
    const hash = await bcrypt.hash(authDto.password, 10);

    try {
      await this.prismaService.user.create({
        data: {
          login: authDto.login,
          password: hash,
        },
      });

      return { message: 'Successfully sign up' };
    } catch {
      throw new BadRequestException('Login already taken');
    }
  }

  async login(authDto: AuthDto) {}

  async refresh(refreshDto: RefreshDto) {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedException('No refresh token in body');
    }
    try {
      const payload: JwtPayload = await this.jwt.verifyAsync(
        refreshDto.refreshToken,
        {
          secret: process.env.JWT_SECRET_REFRESH_KEY,
        },
      );
      return this.generateJWT(payload.sub, payload.login);
    } catch {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }
  }

  private async generateJWT(userId: string, login: string) {
    const payload = { sub: userId, login };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET_REFRESH_KEY,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
