import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [UsersModule, ArticleModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
