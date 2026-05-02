import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from './gemini.service';
import { AiController } from './ai.controller';
import { ArticleModule } from '../article/article.module';
import { AiCacheService } from './ai.cash.service';

@Module({
  imports: [HttpModule, ArticleModule],
  controllers: [AiController],
  providers: [GeminiService, AiCacheService],
})
export class AiModule {}
