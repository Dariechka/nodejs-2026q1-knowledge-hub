import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { GetArticlesFilterDto } from './dto/get-articles-filter';
import { ArticleStorage } from '../shared/article.storage';
import type { Article } from './entities/article.entity';
import { ArticleDto } from './dto/article-dto';
import { CommentStorage } from '../shared/comment.storage';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleStorage: ArticleStorage,
    private readonly commentStorage: CommentStorage,
  ) {}

  create(articleDto: ArticleDto) {
    const timestamp = Date.now();

    const article: Article = {
      ...articleDto,
      status: articleDto.status ?? 'draft',
      authorId: articleDto.authorId ?? null,
      categoryId: articleDto.categoryId ?? null,
      tags: articleDto.tags ?? [],
      id: randomUUID().toString(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.articleStorage.save(article);
    return article;
  }

  findAll(filterDto: GetArticlesFilterDto) {
    const { status, categoryId, tag } = filterDto;
    let articles = this.articleStorage.findAll();
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
    return articles;
  }

  findOne(id: string) {
    const article: Article | undefined = this.articleStorage.findOne(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  update(id: string, articleDto: ArticleDto) {
    const existingArticle = this.articleStorage.findOne(id);

    if (!existingArticle) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    const article: Article = {
      ...existingArticle,
      ...articleDto,
      updatedAt: Date.now(),

      id: existingArticle.id,
      createdAt: existingArticle.createdAt,
    };
    return this.articleStorage.save(article);
  }

  remove(id: string) {
    const wasDeleted = this.articleStorage.remove(id);
    if (!wasDeleted) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    this.commentStorage.removeByArticleId(id);
    return wasDeleted;
  }
}
