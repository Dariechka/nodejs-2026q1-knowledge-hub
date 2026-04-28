import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshDto } from './dto/refresh.dto';
import type { UserDto } from '../users/dto/user.dto';
import { ForbiddenError } from '../shared/error/knowledge-hub-errors';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private ips: Map<string, number[]> = new Map();

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 201, description: 'Successfully sign up' })
  @HttpCode(201)
  @ApiResponse({
    status: 400,
    description: 'Required fields should not be empty',
  })
  signup(@Req() req: Request, @Body() dto: AuthDto): Promise<UserDto> {
    this.enforceRateLimiting(req);
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'Successfully login' })
  @HttpCode(200)
  @ApiResponse({
    status: 400,
    description: 'Required fields should not be empty',
  })
  @ApiResponse({
    status: 403,
    description: 'No user with such login/password',
  })
  login(@Req() req: Request, @Body() dto: AuthDto) {
    this.enforceRateLimiting(req);
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'Successfully refresh' })
  @HttpCode(200)
  @ApiResponse({
    status: 401,
    description: 'No refresh token in body',
  })
  @ApiResponse({
    status: 403,
    description: 'Refresh token is invalid or expired',
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  private enforceRateLimiting(req: Request) {
    if (
      process.env.RATE_LIMIT_WINDOW_MS === undefined ||
      process.env.RATE_LIMIT_THRESHOLD === undefined
    ) {
      return;
    }

    const ip = req.socket.remoteAddress;
    const currentTimestamp = Date.now();
    if (this.ips.has(ip)) {
      const oldHistory = this.ips.get(ip);
      const newHistory = oldHistory.filter(
        (timestamp) =>
          currentTimestamp - timestamp <
          Number(process.env.RATE_LIMIT_WINDOW_MS),
      );
      newHistory.push(currentTimestamp);
      this.ips.set(ip, newHistory);
      if (newHistory.length > Number(process.env.RATE_LIMIT_THRESHOLD)) {
        throw new ForbiddenError();
      }
    } else {
      this.ips.set(ip, [currentTimestamp]);
    }
  }
}
