import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { randomUUID } from 'node:crypto';
import type { User } from './entities/user.entity';
import { UsersStorage } from '../shared/users.storage';
import { CommentStorage } from '../shared/comment.storage';
import { ArticleStorage } from '../shared/article.storage';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersStorage: UsersStorage,
    private readonly articleStorage: ArticleStorage,
    private readonly commentStorage: CommentStorage,
  ) {}

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
    return { ...user, password: undefined };
  }

  findAll(pagination: Pagination, sorting: Sorting) {
    return this.usersStorage.findAll(pagination, sorting);
  }

  findOne(id: string) {
    const user: User | undefined = this.usersStorage.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  update(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = this.usersStorage.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.password !== updatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    return {
      ...this.usersStorage.update(id, updatePasswordDto),
      password: undefined,
    };
  }

  remove(id: string) {
    const wasDeleted = this.usersStorage.remove(id);
    if (!wasDeleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.commentStorage.removeByUserId(id);
    this.articleStorage.removeAuthor(id);
    return wasDeleted;
  }
}
