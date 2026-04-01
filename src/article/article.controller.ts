import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { GetArticlesFilterDto } from './dto/get-articles-filter';
import { ArticleDto } from './dto/article-dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(@Body() articleDto: ArticleDto) {
    return this.articleService.create(articleDto);
  }

  @Get()
  findAll(@Query() filterDto: GetArticlesFilterDto) {
    return this.articleService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() articleDto: ArticleDto,
  ) {
    return this.articleService.update(id, articleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.remove(id);
  }
}
