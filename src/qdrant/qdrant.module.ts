import { Module, Global } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Global()
@Module({
  providers: [
    {
      provide: 'QDRANT_CLIENT',
      useFactory: () => {
        return new QdrantClient({
          url: process.env.RAG_VECTOR_DB_URL || 'http://vectordb:6333',
        });
      },
    },
  ],
  exports: ['QDRANT_CLIENT'],
})
export class QdrantModule {}
