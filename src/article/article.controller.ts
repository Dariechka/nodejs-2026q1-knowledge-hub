import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateUpdateArticleDto } from './dto/create-update-article-dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchArticleDto } from '../users/dto/article-search.dto';

@ApiTags('article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create article' })
  @ApiBody({ type: CreateUpdateArticleDto })
  @ApiResponse({ status: 201, description: 'Article created' })
  @ApiResponse({
    status: 400,
    description: 'Required fields should not be empty',
  })
  create(@Body() articleDto: CreateUpdateArticleDto) {
    return this.articleService.create(articleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles with filters' })
  @ApiResponse({ status: 200, description: 'List of articles' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'archived'],
  })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  findAll(@Query() query: SearchArticleDto) {
    return this.articleService.findAll(query, query, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Article ID',
  })
  @ApiResponse({ status: 404, description: 'Article with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update article by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Article ID',
  })
  @ApiBody({ type: CreateUpdateArticleDto })
  @ApiResponse({ status: 200, description: 'Article updated' })
  @ApiResponse({ status: 404, description: 'Article with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() articleDto: CreateUpdateArticleDto,
  ) {
    return this.articleService.update(id, articleDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete article' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Article deleted' })
  @ApiResponse({ status: 404, description: 'Article with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.articleService.remove(id);
  }
}
