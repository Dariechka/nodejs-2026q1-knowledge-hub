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
import { RagChatRequestDto } from './dto/chat-request-dto';
import { RagChatResponseDto } from './dto/chat-response-dto';
import { PrismaService } from '../prisma/prisma.service';
import { RagChatHistoryResponseDto } from './dto/history-response-dto';
import { MessageType } from '@prisma/client';

type PointStruct = Schemas['PointStruct'];

@Injectable()
export class RagService implements OnModuleInit {
  private readonly collectionName: string =
    process.env.RAG_VECTOR_COLLECTION ?? 'collection';
  private readonly chunkSize: number =
    Number(process.env.RAG_CHUNK_SIZE) ?? 800;
  private readonly chunkOverlap: number =
    Number(process.env.RAG_CHUNK_OVERLAP) ?? 200;
  private readonly limit: number =
    Number(process.env.RAG_CONVERSATION_MAX_MESSAGES) ?? 10;

  constructor(
    @Inject('QDRANT_CLIENT') private readonly qdrant: QdrantClient,
    private readonly articleService: ArticleService,
    private readonly gemini: GeminiRagService,
    private readonly prismaService: PrismaService,
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

  async chat(dto: RagChatRequestDto): Promise<RagChatResponseDto> {
    const conversationId = dto.conversationId ?? crypto.randomUUID();
    try {
      await this.prismaService.conversation.upsert({
        where: {
          id: conversationId,
        },

        update: {},

        create: {
          id: conversationId,
        },
      });

      const history = await this.prismaService.message.findMany({
        where: {
          conversationId,
        },

        orderBy: {
          createdAt: 'desc',
        },

        take: this.limit,
      });
      const orderedHistory = history.reverse();
      const historyText = orderedHistory
        .map(
          (message) =>
            `${message.contentType.toUpperCase()}: ${message.content}`,
        )
        .join('\n');

      const vector = await this.gemini.fetchEmbeddings(dto.question);
      const searchResults = await this.qdrant.search(this.collectionName, {
        vector,
        limit: 3,
        with_payload: true,
      });

      const filteredResults = searchResults.filter(
        (point) => (point.score ?? 0) > 0.4,
      );

      if (filteredResults.length === 0) {
        return {
          answer: "I couldn't find relevant information in the knowledge base.",
          sources: [],
          conversationId,
        };
      }

      // const sources = searchResults.map((point) => ({
      //   articleId: String(point.payload?.articleId ?? ''),
      //   articleTitle: String(point.payload?.title ?? ''),
      //   relevantChunk: String(point.payload?.content ?? ''),
      // }));

      const rerankedSources = await this.rerankResults(
        dto.question,
        filteredResults,
      );
      const contextText = rerankedSources
        .map((s) => `Source: ${s.articleTitle}\nContent: ${s.relevantChunk}`)
        .join('\n');

      const ragPrompt = `
    Answering questions using ONLY the provided context.

    Rules:
    - Use only the supplied context.
    - Do not invent information.
    - If the answer is not present in the context, say:
      "I could not find this information in the knowledge base."
    - Be concise and factual.
    
    Conversation History:
    ${historyText}
    
    Context:
    ${contextText}
    
    User Question: ${dto.question}
  `;

      const answer = await this.gemini.generateAnswer(ragPrompt);
      await this.prismaService.$transaction([
        this.prismaService.message.createMany({
          data: [
            {
              conversationId,
              contentType: MessageType.question,
              content: dto.question,
            },

            {
              conversationId,
              contentType: MessageType.answer,
              content: answer,
            },
          ],
        }),

        this.prismaService.conversation.update({
          where: {
            id: conversationId,
          },

          data: {
            updatedAt: new Date(),
          },
        }),
      ]);
      return {
        answer,
        sources: rerankedSources,
        conversationId,
      };
    } catch {
      throw new ServerUnavailableError(
        'Failed to perform RAG conversation due to vector database services',
      );
    }
  }

  async getHistory(conversationId: string): Promise<RagChatHistoryResponseDto> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new NotFoundError(
        `Conversation with ID ${conversationId} was not found`,
      );
    }

    const messages = await this.prismaService.message.findMany({
      where: {
        conversationId,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: this.limit,
    });

    return {
      conversationId,

      messages: messages.reverse().map((message) => ({
        id: message.id,
        messageType: message.contentType,
        content: message.content,
        createdAt: Number(message.createdAt),
      })),
    };
  }

  private async rerankResults(
    question: string,
    results: Array<{
      payload?: {
        articleId?: string;
        title?: string;
        content?: string;
      };
      score?: number;
    }>,
  ): Promise<
    Array<{
      articleId: string;
      articleTitle: string;
      relevantChunk: string;
    }>
  > {
    if (results.length === 0) {
      return [];
    }
    const candidates = results
      .map(
        (result, index) => `
    [ID ${index}]
    Title: ${String(result.payload?.title ?? '')}

    Content:
    ${String(result.payload?.content ?? '')}
    `,
      )
      .join('\n');

    const rerankPrompt = `
    Select the 3 most relevant document chunks for answering the user's question.

    Rules:
    - Return ONLY numeric IDs.
    - No explanations.
    - No additional text.
    - Format strictly:
    0,1,2

    User Question:
    ${question}

    Document Chunks:
    ${candidates}
    `;

    let response: string;

    try {
      response = await this.gemini.generateAnswer(rerankPrompt);
    } catch (error) {
      console.error('Failed to rerank results:', error);

      return results.slice(0, 3).map((result) => ({
        articleId: String(result.payload?.articleId ?? ''),

        articleTitle: String(result.payload?.title ?? ''),

        relevantChunk: String(result.payload?.content ?? ''),
      }));
    }

    const parsedIds = response
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id) && id >= 0 && id < results.length);

    const uniqueIds = [...new Set(parsedIds)];

    if (uniqueIds.length === 0) {
      return results.slice(0, 3).map((result) => ({
        articleId: String(result.payload?.articleId ?? ''),

        articleTitle: String(result.payload?.title ?? ''),

        relevantChunk: String(result.payload?.content ?? ''),
      }));
    }

    return uniqueIds.slice(0, 3).map((id) => ({
      articleId: String(results[id].payload?.articleId ?? ''),

      articleTitle: String(results[id].payload?.title ?? ''),

      relevantChunk: String(results[id].payload?.content ?? ''),
    }));
  }
}
