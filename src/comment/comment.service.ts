import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { GetCommentFilterDto } from './dto/get-comment-filter';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import { CommentDto } from './dto/comment.dto';
import type { CurrentUserData } from '../auth/data/current-user.data';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    user: CurrentUserData,
    commentDto: CreateCommentDto,
  ): Promise<CommentDto> {
    if (
      user.role === 'viewer' ||
      (user.role === 'editor' && user.userId !== commentDto.authorId)
    ) {
      throw new ForbiddenException('Access denied');
    }
    const article = await this.prismaService.article.findUnique({
      where: { id: commentDto.articleId },
    });
    if (!article) {
      throw new UnprocessableEntityException(
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
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async remove(user: CurrentUserData, id: string) {
    if (user.role === 'viewer' || user.role === 'editor') {
      throw new ForbiddenException('Access denied');
    }
    try {
      await this.prismaService.comment.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
}
