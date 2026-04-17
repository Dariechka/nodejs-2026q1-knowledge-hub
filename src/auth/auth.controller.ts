import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
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
  signup(@Body() dto: AuthDto) {
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
  login(@Body() dto: AuthDto) {
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
}
