import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommentDto } from './dto/comment.dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { GetCommentFilterDto } from './dto/get-comment-filter';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(commentDto: CommentDto) {
    const article = await this.prismaService.article.findUnique({
      where: { id: commentDto.articleId },
    });
    if (!article) {
      throw new UnprocessableEntityException(
        `Cannot create comment: Article ${commentDto.articleId} does not exist`,
      );
    }
    return this.prismaService.comment.create({
      data: commentDto,
    });
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

  async remove(id: string) {
    try {
      await this.prismaService.comment.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
}
