import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: 'knowledge-hub-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
