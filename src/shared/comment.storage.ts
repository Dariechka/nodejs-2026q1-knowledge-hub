import { Injectable } from '@nestjs/common';
import type { Comment } from '../comment/entities/comment.entity';
import { Pagination } from './dto/pagination';
import { Sorting } from './dto/sorting';
import { GetCommentFilterDto } from '../comment/dto/get-comment-filter';
import { paginate, sort } from './utils';

@Injectable()
export class CommentStorage {
  private store: Map<string, Comment> = new Map();

  save(comment: Comment) {
    this.store.set(comment.id, comment);
    return comment;
  }

  findByArticleId(
    articleId: GetCommentFilterDto,
    pagination: Pagination,
    sorting: Sorting,
  ) {
    const value = Array.from(this.store.values()).filter(
      (comment) => comment.articleId === articleId.articleId,
    );
    return paginate(sort(value, sorting), pagination);
  }

  findOne(id: string) {
    return this.store.get(id);
  }

  remove(id: string) {
    const comment = this.store.get(id);
    if (comment) {
      this.store.delete(id);
    }
    return comment;
  }

  removeByArticleId(articleId: string) {
    for (const comment of this.store.values()) {
      if (comment.articleId === articleId) {
        this.store.delete(comment.id);
      }
    }
  }

  removeByUserId(userId: string) {
    [...this.store.values()]
      .filter((comment) => comment.authorId === userId)
      .forEach((comment) => this.store.delete(comment.id));
  }
}
