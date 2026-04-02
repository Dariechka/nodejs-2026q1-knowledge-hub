import { Injectable } from '@nestjs/common';
import type { Article } from '../article/entities/article.entity';

@Injectable()
export class ArticleStorage {
  private store: Map<string, Article> = new Map();

  save(article: Article): Article {
    this.store.set(article.id, article);
    return article;
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

  removeAuthor(userId: string) {
    for (const article of this.store.values()) {
      if (article.authorId === userId) {
        article.authorId = null;
      }
    }
  }

  removeCategory(categoryId: string) {
    for (const article of this.store.values()) {
      if (article.categoryId === categoryId) {
        article.categoryId = null;
      }
    }
  }
}
