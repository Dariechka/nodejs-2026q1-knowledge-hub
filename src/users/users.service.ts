import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import { UserDto } from './dto/user.dto';
import {
  ForbiddenError,
  NotFoundError,
} from '../shared/error/knowledge-hub-errors';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const user = await this.prismaService.user.create({
      data: createUserDto,
    });
    return new UserDto(user);
  }

  async findAll(pagination: Pagination, sorting: Sorting): Promise<UserDto[]> {
    return (
      await this.prismaService.user.findMany({
        ...toPrismaPagination(pagination),
        ...toPrismaSorting(sorting),
      })
    ).map((user) => new UserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return new UserDto(user);
  }

  async findByLogin(login: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { login },
    });
    if (!user) {
      throw new NotFoundError(`User with login ${login} not found`);
    }
    return new UserDto(user);
  }

  async update(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    if (updatePasswordDto.oldPassword !== user.password) {
      throw new ForbiddenError('Old password is incorrect');
    }

    const newUser = await this.prismaService.user.update({
      where: { id },
      data: { password: { set: updatePasswordDto.newPassword } },
    });
    return new UserDto(newUser);
  }

  async remove(id: string) {
    try {
      await this.prismaService.user.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
  }
}
