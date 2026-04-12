import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleDto } from './dto/article-dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import { GetArticlesFilterDto } from './dto/get-articles-filter';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(articleDto: ArticleDto) {
    return this.prismaService.article.create({
      data: {
        ...articleDto,
        authorId: articleDto.authorId ?? null,
        categoryId: articleDto.categoryId ?? null,
        tags: {
          connectOrCreate: (articleDto.tags ?? []).map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
  }

  async findAll(
    filter: GetArticlesFilterDto,
    pagination: Pagination,
    sorting: Sorting,
  ) {
    return this.prismaService.article.findMany({
      where: {
        status: filter.status as ArticleStatus,
        categoryId: filter.categoryId,
        authorId: filter.authorId,
        tags: {
          some: { name: filter.tag },
        },
      },
      ...toPrismaPagination(pagination),
      ...toPrismaSorting(sorting),
    });
  }

  async findOne(id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async update(id: string, articleDto: ArticleDto) {
    try {
      const { authorId, categoryId, tags, ...data } = articleDto;
      return this.prismaService.article.update({
        where: { id },
        data: {
          ...data,
          author: authorId ? { connect: { id: authorId } } : undefined,
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          tags: tags
            ? { connect: tags.map((tag) => ({ name: tag })) }
            : undefined,
        },
      });
    } catch {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prismaService.article.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }
}
