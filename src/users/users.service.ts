import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { UsersStorage } from './users.storage';
import { randomUUID } from 'node:crypto';
import type { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersStorage: UsersStorage) {}

  create(createUserDto: CreateUserDto) {
    const timestamp = Date.now();
    const user: User = {
      ...createUserDto,
      role: createUserDto.role ?? 'viewer',
      id: randomUUID().toString(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.usersStorage.create(user);
    return { user, password: undefined };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updatePasswordDto: UpdatePasswordDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
