import { Injectable } from '@nestjs/common';
import type { Category } from '../category/entities/category.entity';

@Injectable()
export class CategoryStorage {
  private store: Map<string, Category> = new Map();

  save(category: Category) {
    this.store.set(category.id, category);
    return category;
  }

  findAll() {
    return Array.from(this.store.values());
  }

  findOne(id: string) {
    return this.store.get(id);
  }

  remove(id: string) {
    return this.store.delete(id);
  }
}
