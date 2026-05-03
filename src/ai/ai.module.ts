import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from './gemini.service';
import { AiController } from './ai.controller';
import { ArticleModule } from '../article/article.module';
import { AiCacheService } from './ai.cash.service';
import { AiMetricsService } from './ai.metrics.service';
import { AiValidationService } from './ai.validation.service';

@Module({
  imports: [HttpModule, ArticleModule],
  controllers: [AiController],
  providers: [
    GeminiService,
    AiCacheService,
    AiMetricsService,
    AiValidationService,
  ],
})
export class AiModule {}
