import { Injectable } from '@nestjs/common';
import { CreateUpdateArticleDto } from './dto/create-update-article-dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import { GetArticlesFilterDto } from './dto/get-articles-filter';
import { ArticleDto } from './dto/article-dto';
import type { CurrentUserData } from '../auth/data/current-user.data';
import {
  ForbiddenError,
  NotFoundError,
} from '../shared/error/knowledge-hub-errors';

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    user: CurrentUserData,
    articleDto: CreateUpdateArticleDto,
  ): Promise<ArticleDto> {
    const { authorId, categoryId, tags, ...data } = articleDto;
    if (
      user.role === 'admin' ||
      (user.role === 'editor' && user.userId === authorId)
    ) {
      const article = await this.prismaService.article.create({
        include: { tags: { select: { name: true } } },
        data: {
          ...data,
          author: authorId ? { connect: { id: authorId } } : undefined,
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          tags: {
            connectOrCreate: (tags ?? []).map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
      });
      return new ArticleDto({
        ...article,
        tags: article.tags.map((tag) => tag.name),
      });
    } else {
      throw new ForbiddenError();
    }
  }

  async findAll(
    filter: GetArticlesFilterDto,
    pagination: Pagination,
    sorting: Sorting,
  ) {
    return this.prismaService.article.findMany({
      where: {
        OR: [
          { status: filter.status },
          { categoryId: filter.categoryId },
          { authorId: filter.authorId },
          {
            tags: {
              some: { name: filter.tag },
            },
          },
        ],
      },
      ...toPrismaPagination(pagination),
      ...toPrismaSorting(sorting),
    });
  }

  async findOne(id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { id },
      include: { tags: { select: { name: true } } },
    });
    if (!article) {
      throw new NotFoundError(`Article with ID ${id} not found`);
    }
    return {
      ...article,
      tags: article.tags.map((tag) => tag.name),
    };
  }

  async update(
    user: CurrentUserData,
    id: string,
    articleDto: CreateUpdateArticleDto,
  ) {
    if (user.role !== 'admin' && user.role !== 'editor') {
      throw new ForbiddenError();
    }
    const { authorId, categoryId, tags, ...data } = articleDto;
    const articleFromDb = await this.findOne(id);
    if (
      user.role === 'editor' &&
      (user.userId !== articleFromDb.authorId ||
        (authorId !== undefined && user.userId !== authorId))
    ) {
      throw new ForbiddenError();
    }

    try {
      return await this.prismaService.article.update({
        where: { id },
        data: {
          ...data,
          author: authorId ? { connect: { id: authorId } } : undefined,
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          tags: tags
            ? {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              }
            : undefined,
        },
      });
    } catch {
      throw new NotFoundError(`Article with ID ${id} not found`);
    }
  }

  async remove(user: CurrentUserData, id: string) {
    if (user.role !== 'admin' && user.role !== 'editor') {
      throw new ForbiddenError();
    }
    const articleFromDb = await this.findOne(id);
    if (user.role === 'editor' && user.userId !== articleFromDb.authorId) {
      throw new ForbiddenError();
    }

    try {
      await this.prismaService.article.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`Article with ID ${id} not found`);
    }
  }
}
