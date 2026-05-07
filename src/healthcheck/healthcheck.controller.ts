import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthCheckController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}
