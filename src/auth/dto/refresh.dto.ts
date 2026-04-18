import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'The refresh token string' })
  @IsOptional()
  refreshToken: string;
}
