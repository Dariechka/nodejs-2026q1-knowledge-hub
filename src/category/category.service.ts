import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryStorage } from '../shared/category.storage';
import { randomUUID } from 'node:crypto';
import type { Category } from './entities/category.entity';
import { CategoryDto } from './dto/category.dto';
import { ArticleStorage } from '../shared/article.storage';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryStorage: CategoryStorage,
    private readonly articleStorage: ArticleStorage,
  ) {}

  create(categoryDto: CategoryDto) {
    const category: Category = {
      ...categoryDto,
      id: randomUUID().toString(),
    };
    this.categoryStorage.save(category);
    return category;
  }

  findAll(pagination: Pagination, sorting: Sorting) {
    return this.categoryStorage.findAll(pagination, sorting);
  }

  findOne(id: string) {
    const category: Category | undefined = this.categoryStorage.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  update(id: string, categoryDto: CategoryDto) {
    const existingCategory = this.categoryStorage.findOne(id);

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const category: Category = {
      ...categoryDto,
      id,
    };

    return this.categoryStorage.save(category);
  }

  remove(id: string) {
    const wasDeleted = this.categoryStorage.remove(id);
    if (!wasDeleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    this.articleStorage.removeCategory(id);
    return wasDeleted;
  }
}
