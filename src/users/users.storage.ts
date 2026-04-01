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
    return Array.from(this.store.values());
  }

  findOne(id: string) {
    return this.store.get(id);
  }

  update(id: number, updatePasswordDto: UpdatePasswordDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    const user = this.store.get(id);
    if (user) {
      this.store.delete(id);
    }
    return user;
  }
}
