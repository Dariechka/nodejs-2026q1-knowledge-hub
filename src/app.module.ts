import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    UsersModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    SharedModule,
  ],
})
export class AppModule {}
