import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ReindexRequestDto } from './dto/reindex-request-dto';
import { ReindexResponseDto } from './dto/reindex-response-dto';
import { RagService } from './rag.service';

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
}
