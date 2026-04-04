import { Injectable } from '@nestjs/common';
import { UpdatePasswordDto } from '../users/dto/update-password.dto';
import type { User } from '../users/entities/user.entity';
import { Pagination } from './dto/pagination';
import { Sorting } from './dto/sorting';
import { paginate, sort } from './utils';

@Injectable()
export class UsersStorage {
  private store: Map<string, User> = new Map();

  create(user: User) {
    this.store.set(user.id, user);
  }

  findAll(pagination: Pagination, sorting: Sorting) {
    const values = Array.from(this.store.values());
    return paginate(sort(values, sorting), pagination);
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
