import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersStorage } from './users.storage';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersStorage],
  exports: [UsersService],
})
export class UsersModule {}
