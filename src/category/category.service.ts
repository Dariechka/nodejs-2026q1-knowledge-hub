import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import type { CurrentUserData } from '../auth/data/current-user.data';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: CurrentUserData, categoryDto: CategoryDto) {
    if (user.role === 'viewer' || user.role === 'editor') {
      throw new ForbiddenException('Access denied');
    }
    return this.prismaService.category.create({
      data: categoryDto,
    });
  }

  async findAll(pagination: Pagination, sorting: Sorting) {
    return this.prismaService.category.findMany({
      ...toPrismaPagination(pagination),
      ...toPrismaSorting(sorting),
    });
  }

  async findOne(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(user: CurrentUserData, id: string, categoryDto: CategoryDto) {
    if (user.role === 'viewer' || user.role === 'editor') {
      throw new ForbiddenException('Access denied');
    }
    try {
      return await this.prismaService.category.update({
        where: { id },
        data: categoryDto,
      });
    } catch {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async remove(user: CurrentUserData, id: string) {
    if (user.role === 'viewer' || user.role === 'editor') {
      throw new ForbiddenException('Access denied');
    }
    try {
      await this.prismaService.category.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
