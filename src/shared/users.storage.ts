import { Injectable } from '@nestjs/common';
import { UpdatePasswordDto } from '../users/dto/update-password.dto';
import type { User } from '../users/entities/user.entity';

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

  update(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user: User = this.store.get(id);
    user.password = updatePasswordDto.newPassword;
    user.updatedAt = Date.now();
    return user;
  }

  remove(id: string) {
    return this.store.delete(id);
  }
}
