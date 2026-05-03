import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { GetCommentFilterDto } from './dto/get-comment-filter';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import { CommentDto } from './dto/comment.dto';
import type { CurrentUserData } from '../auth/data/current-user.data';
import {
  ForbiddenError,
  UnprocessableError,
  NotFoundError,
} from '../shared/error/knowledge-hub-errors';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    user: CurrentUserData,
    commentDto: CreateCommentDto,
  ): Promise<CommentDto> {
    if (
      user.role === 'admin' ||
      (user.role === 'editor' && user.userId === commentDto.authorId)
    ) {
      const article = await this.prismaService.article.findUnique({
        where: { id: commentDto.articleId },
      });
      if (!article) {
        throw new UnprocessableError(
          `Cannot create comment: Article ${commentDto.articleId} does not exist`,
        );
      }

      const { authorId, articleId, ...data } = commentDto;
      const newComment = await this.prismaService.comment.create({
        data: {
          ...data,
          author: authorId ? { connect: { id: authorId } } : undefined,
          article: articleId ? { connect: { id: articleId } } : undefined,
        },
      });
      return new CommentDto(newComment);
    } else {
      throw new ForbiddenError();
    }
  }

  async findByArticleId(
    filter: GetCommentFilterDto,
    pagination: Pagination,
    sorting: Sorting,
  ) {
    return this.prismaService.comment.findMany({
      where: {
        articleId: filter.articleId,
      },
      ...toPrismaPagination(pagination),
      ...toPrismaSorting(sorting),
    });
  }

  async findOne(id: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundError(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async remove(user: CurrentUserData, id: string) {
    if (user.role !== 'admin' && user.role !== 'editor') {
      throw new ForbiddenError();
    }
    const commentFromDb = await this.findOne(id);
    if (user.role === 'editor' && user.userId !== commentFromDb.authorId) {
      throw new ForbiddenError();
    }

    try {
      await this.prismaService.comment.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`Comment with ID ${id} not found`);
    }
  }
}
