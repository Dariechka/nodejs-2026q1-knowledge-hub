import { Injectable } from '@nestjs/common';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { User } from './entities/user.entity';

@Injectable()
export class UsersStorage {
  private store: Map<string, User> = new Map();

  create(user: User) {
    this.store.set(user.id, user);
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
