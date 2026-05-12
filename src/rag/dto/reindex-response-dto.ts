import { ApiProperty } from '@nestjs/swagger';

interface ReindexResponse {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;
}

export class ReindexResponseDto implements ReindexResponse {
  @ApiProperty({
    description: 'Total number of parent articles processed from PostgreSQL.',
    example: 42,
  })
  indexedArticles: number;

  @ApiProperty({
    description:
      'Total number of vector points (chunks) created in Qdrant. Large articles may be split into multiple chunks.',
    example: 156,
  })
  indexedChunks: number;

  @ApiProperty({
    description:
      'The name of the Qdrant collection where the vectors were stored.',
    example: 'articles_v1',
  })
  vectorCollection: string;
}
