import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUpdateArticleDto } from './dto/create-update-article-dto';
import { Pagination } from '../shared/dto/pagination';
import { Sorting } from '../shared/dto/sorting';
import { PrismaService } from '../prisma/prisma.service';
import { toPrismaPagination, toPrismaSorting } from '../shared/utils';
import { GetArticlesFilterDto } from './dto/get-articles-filter';
import { ArticleDto } from './dto/article-dto';

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(articleDto: CreateUpdateArticleDto): Promise<ArticleDto> {
    const { authorId, categoryId, tags, ...data } = articleDto;
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

  async update(id: string, articleDto: CreateUpdateArticleDto) {
    try {
      const { authorId, categoryId, tags, ...data } = articleDto;
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
  }

  async remove(id: string) {
    try {
      await this.prismaService.article.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }
}
