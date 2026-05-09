import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ReindexRequestDto } from './dto/reindex-request-dto';
import { ReindexResponseDto } from './dto/reindex-response-dto';
import { RagService } from './rag.service';
import { RagSearchRequestDto } from './dto/search-request-dto';
import { RagSearchResponseDto } from './dto/search-response-dto';
import { RagChatRequestDto } from './dto/chat-request-dto';
import { RagChatResponseDto } from './dto/chat-response-dto';

@ApiTags('ai')
@Controller('ai')
export class RagController {
  constructor(private readonly ragService: RagService) {}
  @Post('rag/index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Index Knowledge Hub articles into vector database',
    description:
      'Builds or refreshes the RAG vector index by embedding articles from the Knowledge Hub database and storing them in Qdrant for semantic search.',
  })
  @ApiBody({ type: ReindexRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Articles successfully indexed into the vector database',
  })
  @ApiResponse({
    status: 404,
    description: 'One or more specified articles were not found',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request payload (validation failed: UUID format or request structure is incorrect)',
  })
  async index(@Body() dto: ReindexRequestDto): Promise<ReindexResponseDto> {
    return this.ragService.reindex(dto);
  }

  @Post('rag/search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search Knowledge Hub articles using semantic vector search',
    description:
      'Performs semantic search over indexed Knowledge Hub article embeddings stored in Qdrant and returns the most relevant content chunks for retrieval-augmented generation (RAG).',
  })
  @ApiBody({ type: RagSearchRequestDto })
  @ApiResponse({
    status: 200,
    description:
      'Relevant article chunks were successfully retrieved from the vector database',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request payload (search query is required and must be a non-empty string)',
  })
  async search(
    @Body() dto: RagSearchRequestDto,
  ): Promise<RagSearchResponseDto> {
    return this.ragService.search(dto);
  }

  @Delete('rag/index/articles/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove article vectors',
    description:
      'Deletes all vector chunks associated with a specific article ID from the vector database.',
  })
  @ApiParam({
    name: 'articleId',
    description: 'The unique UUID of the article to remove from the index',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Vectors were successfully removed from the index',
  })
  @ApiResponse({
    status: 404,
    description: 'No vector entries found for article ID',
  })
  async deleteByArticle(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
  ): Promise<void> {
    return await this.ragService.deleteArticleIndices(articleId);
  }

  @Post('rag/chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate an AI answer based on knowledge base context',
    description:
      'Performs a vector search for context and uses Gemini to generate a natural language response.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI answer was successfully generated',
    type: RagChatRequestDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload (question is missing or empty)',
  })
  async chat(@Body() dto: RagChatRequestDto): Promise<RagChatResponseDto> {
    return this.ragService.chat(dto);
  }
}
