import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ArticleStorage } from './article.storage';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, ArticleStorage],
  exports: [ArticleService],
})
export class ArticleModule {}
