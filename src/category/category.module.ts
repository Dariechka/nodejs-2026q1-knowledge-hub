import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryStorage } from './category.storage';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryStorage],
  exports: [CategoryService],
})
export class CategoryModule {}
