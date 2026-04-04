import { Injectable } from '@nestjs/common';
import type { Article } from '../article/entities/article.entity';
import { Pagination } from './dto/pagination';
import { Sorting } from './dto/sorting';
import { SearchArticleDto } from '../users/dto/article-search.dto';
import { paginate, sort } from './utils';

@Injectable()
export class ArticleStorage {
  private store: Map<string, Article> = new Map();

  save(article: Article): Article {
    this.store.set(article.id, article);
    return article;
  }

  findAll(
    filterDto: SearchArticleDto,
    pagination: Pagination,
    sorting: Sorting,
  ) {
    const { status, categoryId, tag } = filterDto;
    let articles = Array.from(this.store.values());
    if (Object.keys(filterDto).length > 0) {
      articles = articles.filter((article) => {
        let isMatch = true;

        if (status && article.status !== status) {
          isMatch = false;
        }
        if (categoryId && article.categoryId !== categoryId) {
          isMatch = false;
        }
        if (tag && !article.tags.includes(tag)) {
          isMatch = false;
        }

        return isMatch;
      });
    }
    return paginate(sort(articles, sorting), pagination);
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
