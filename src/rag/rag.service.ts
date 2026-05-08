import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ReindexRequestDto } from './dto/reindex-request-dto';
import { ReindexResponseDto } from './dto/reindex-response-dto';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ArticleService } from '../article/article.service';
import { throwError } from 'rxjs';
import {
  NotFoundError,
  ServerUnavailableError,
} from '../shared/error/knowledge-hub-errors';
import { SortOrder } from '../shared/dto/sorting';
import { GeminiRagService } from './gemini.rag.service';
import { createHash } from 'node:crypto';
import { Schemas } from '@qdrant/js-client-rest';
import { RagSearchRequestDto } from './dto/search-request-dto';
import { RagSearchResponseDto } from './dto/search-response-dto';
import { Article } from '../article/entities/article.entity';

type PointStruct = Schemas['PointStruct'];

@Injectable()
export class RagService implements OnModuleInit {
  private readonly collectionName: string =
    process.env.RAG_VECTOR_COLLECTION ?? 'collection';
  private readonly chunkSize: number =
    Number(process.env.RAG_CHUNK_SIZE) ?? 800;
  private readonly chunkOverlap: number =
    Number(process.env.RAG_CHUNK_OVERLAP) ?? 200;

  constructor(
    @Inject('QDRANT_CLIENT') private readonly qdrant: QdrantClient,
    private readonly articleService: ArticleService,
    private readonly gemini: GeminiRagService,
  ) {}

  async onModuleInit() {
    try {
      const collections = await this.qdrant.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        await this.qdrant.createCollection(this.collectionName, {
          vectors: {
            size: 768,
            distance: 'Cosine',
          },
        });
      }
    } catch (error) {
      return throwError(
        () =>
          new ServerUnavailableError(
            'Vector DB is unavailable. Please try again later.',
          ),
      );
    }
  }

  async reindex(dto: ReindexRequestDto): Promise<ReindexResponseDto> {
    try {
      const { onlyPublished = true, articleIds } = dto;
      const filter: any = {};
      if (articleIds?.length) {
        filter.id = { in: articleIds };
      }
      if (onlyPublished) {
        filter.status = 'published';
      }
      const articles: Array<Article> = await this.articleService.findAll(
        filter,
        { page: 0, limit: 1000 },
        { sortBy: 'createdAt', order: SortOrder.ASC },
      );

      let totalChunks = 0;
      for (const article of articles) {
        const text = `Title: ${article.title}\nContent: ${article.content}`;
        const chunks = this.chunkText(text);

        const points: PointStruct[] = await Promise.all(
          chunks.map(async (content, index) => {
            const vector = await this.gemini.fetchEmbeddings(content);
            const chunkId = this.generateDeterministicId(article.id, index);

            return {
              id: chunkId,
              vector,
              payload: {
                articleId: article.id,
                title: article.title,
                categoryId: article.categoryId,
                status: article.status,
                tags: article.tags,
                content,
              },
            };
          }),
        );

        await this.qdrant.upsert(this.collectionName, {
          wait: true,
          points: points,
        });
        totalChunks += points.length;
      }

      return {
        indexedArticles: articles.length,
        indexedChunks: totalChunks,
        vectorCollection: this.collectionName,
      };
    } catch (error) {
      throw new ServerUnavailableError(
        'Failed to complete article indexing due to an unavailable vector database service',
      );
    }
  }

  async search(dto: RagSearchRequestDto): Promise<RagSearchResponseDto> {
    try {
      const vector = await this.gemini.fetchEmbeddings(dto.query);
      const must: any[] = [];

      if (dto.articleStatus) {
        must.push({
          key: 'status',
          match: { value: dto.articleStatus },
        });
      }

      if (dto.categoryId) {
        must.push({
          key: 'categoryId',
          match: { value: dto.categoryId },
        });
      }

      if (dto.tags?.length) {
        must.push(
          ...dto.tags.map((tag) => ({
            key: 'tags',
            match: {
              value: tag,
            },
          })),
        );
      }

      const searchResults = await this.qdrant.search(this.collectionName, {
        vector,
        limit: dto.limit ?? 5,
        with_payload: true,

        ...(must.length && {
          filter: {
            must,
          },
        }),
      });

      return {
        results: searchResults.map((point) => ({
          articleId: String(point.payload?.articleId ?? ''),
          articleTitle: String(point.payload?.title ?? ''),
          chunk: String(point.payload?.content ?? ''),
          similarity: point.score ?? 0,
        })),
      };
    } catch (error) {
      throw new ServerUnavailableError(
        'Failed to perform semantic search due to an unavailable vector database service',
      );
    }
  }

  async deleteArticleIndices(articleId: string): Promise<void> {
    try {
      const result = await this.qdrant.scroll(this.collectionName, {
        filter: {
          must: [
            {
              key: 'articleId',
              match: { value: articleId },
            },
          ],
        },
        limit: 1,
        with_payload: false,
        with_vector: false,
      });

      if (result.points.length === 0) {
        throw new NotFoundError(
          `No vector entries found for article ID: ${articleId}`,
        );
      }

      await this.qdrant.delete(this.collectionName, {
        filter: {
          must: [
            {
              key: 'articleId',
              match: { value: articleId },
            },
          ],
        },
        wait: true,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new ServerUnavailableError(
        'Failed to delete article due to an unavailable vector database service',
      );
    }
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = start + this.chunkSize;
      chunks.push(text.slice(start, end));
      if (end >= text.length) break;
      start += this.chunkSize - this.chunkOverlap;
    }
    return chunks;
  }

  private generateDeterministicId(articleId: string, index: number): string {
    const input = `${articleId}-chunk-${index}`;
    return createHash('sha256').update(input).digest('hex').substring(0, 32);
  }
}
