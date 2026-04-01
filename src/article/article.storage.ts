import { Injectable } from '@nestjs/common';
import type { Article } from './entities/article.entity';

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
    const article = this.store.get(id);
    if (article) {
      this.store.delete(id);
    }
    return article;
  }
}
