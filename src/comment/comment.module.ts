import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentStorage } from './comment.storage';
import { ArticleStorage } from '../article/article.storage';
import { ArticleModule } from '../article/article.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService, CommentStorage, ArticleStorage],
  exports: [CommentService],
  imports: [ArticleModule],
})
export class CommentModule {}
