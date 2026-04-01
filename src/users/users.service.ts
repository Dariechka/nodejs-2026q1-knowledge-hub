import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { randomUUID } from 'node:crypto';
import type { User } from './entities/user.entity';
import { UsersStorage } from './users.storage';

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
    return this.usersStorage.findAll();
  }

  findOne(id: string) {
    const user: User | undefined = this.usersStorage.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.usersStorage.findOne(id);
  }

  update(id: number, updatePasswordDto: UpdatePasswordDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    const wasDeleted = this.usersStorage.remove(id);
    if (!wasDeleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return wasDeleted;
  }
}
