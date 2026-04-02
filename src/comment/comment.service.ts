import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CommentStorage } from '../shared/comment.storage';
import type { Comment } from './entities/comment.entity';
import { CommentDto } from './dto/comment.dto';
import { ArticleStorage } from '../shared/article.storage';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentStorage: CommentStorage,
    private readonly articlesStorage: ArticleStorage,
  ) {}

  create(commentDto: CommentDto) {
    const article = this.articlesStorage.findOne(commentDto.articleId);
    if (!article) {
      throw new UnprocessableEntityException(
        `Cannot create comment: Article ${commentDto.articleId} does not exist`,
      );
    }
    const comment: Comment = {
      ...commentDto,
      id: randomUUID().toString(),
      authorId: commentDto.authorId ?? null,
      createdAt: Date.now(),
    };
    this.commentStorage.save(comment);
    return comment;
  }

  findByArticleId(articleId: string) {
    return this.commentStorage
      .findAll()
      .filter((comment) => comment.articleId === articleId);
  }

  findOne(id: string) {
    const comment: Comment | undefined = this.commentStorage.findOne(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  remove(id: string) {
    const wasDeleted = this.commentStorage.remove(id);
    if (!wasDeleted) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return wasDeleted;
  }
}
