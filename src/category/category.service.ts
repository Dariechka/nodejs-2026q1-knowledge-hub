import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(categoryDto: CategoryDto) {
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

  async update(id: string, categoryDto: CategoryDto) {
    try {
      return await this.prismaService.category.update({
        where: { id },
        data: categoryDto,
      });
    } catch {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prismaService.category.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
