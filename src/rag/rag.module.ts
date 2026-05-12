import { Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { GeminiRagService } from './gemini.rag.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ArticleModule, HttpModule],
  controllers: [RagController],
  providers: [RagService, GeminiRagService],
  exports: [RagService],
})
export class RagModule {}
