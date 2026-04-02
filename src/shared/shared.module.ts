import { Global, Module } from '@nestjs/common';
import { ArticleStorage } from './article.storage';
import { CommentStorage } from './comment.storage';
import { UsersStorage } from './users.storage';
import { CategoryStorage } from './category.storage';

@Global()
@Module({
  providers: [ArticleStorage, CommentStorage, UsersStorage, CategoryStorage],
  exports: [ArticleStorage, CommentStorage, UsersStorage, CategoryStorage],
})
export class SharedModule {}
