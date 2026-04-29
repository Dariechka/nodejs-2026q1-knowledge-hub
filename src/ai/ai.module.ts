import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from './gemini.service';
import { AiController } from './ai.controller';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [HttpModule, ArticleModule],
  controllers: [AiController],
  providers: [GeminiService],
})
export class AiModule {}
