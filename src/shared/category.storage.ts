import { Injectable } from '@nestjs/common';
import type { Category } from '../category/entities/category.entity';
import { Pagination } from './dto/pagination';
import { Sorting } from './dto/sorting';
import { paginate, sort } from './utils';

@Injectable()
export class CategoryStorage {
  private store: Map<string, Category> = new Map();

  save(category: Category) {
    this.store.set(category.id, category);
    return category;
  }

  findAll(pagination: Pagination, sorting: Sorting) {
    const values = Array.from(this.store.values());
    return paginate(sort(values, sorting), pagination);
  }

  findOne(id: string) {
    return this.store.get(id);
  }

  remove(id: string) {
    return this.store.delete(id);
  }
}
