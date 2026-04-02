import { Injectable } from '@nestjs/common';
import type { Comment } from '../comment/entities/comment.entity';

@Injectable()
export class CommentStorage {
  private store: Map<string, Comment> = new Map();

  save(comment: Comment) {
    this.store.set(comment.id, comment);
    return comment;
  }

  findAll() {
    return Array.from(this.store.values());
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
