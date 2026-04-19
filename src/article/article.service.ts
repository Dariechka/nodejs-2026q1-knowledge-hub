import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUpdateArticleDto } from './dto/create-update-article-dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import { GetArticlesFilterDto } from './dto/get-articles-filter';
import { ArticleDto } from './dto/article-dto';
import type { CurrentUserData } from '../auth/data/current-user.data';

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
      throw new ForbiddenException('Access denied');
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
      throw new NotFoundException(`Article with ID ${id} not found`);
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
    const { authorId, categoryId, tags, ...data } = articleDto;
    const articleFromDb = await this.findOne(id);
    if (
      user.role === 'admin' ||
      (user.role === 'editor' &&
        user.userId === articleFromDb.authorId &&
        user.userId === authorId)
    ) {
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
        throw new NotFoundException(`Article with ID ${id} not found`);
      }
    } else {
      throw new ForbiddenException('Access denied');
    }
  }

  async remove(user: CurrentUserData, id: string) {
    const articleFromDb = await this.findOne(id);
    if (
      user.role === 'admin' ||
      (user.role === 'editor' && user.userId === articleFromDb.authorId)
    ) {
      try {
        await this.prismaService.article.delete({ where: { id } });
      } catch {
        throw new NotFoundException(`Article with ID ${id} not found`);
      }
    } else {
      throw new ForbiddenException('Access denied');
    }
  }
}
