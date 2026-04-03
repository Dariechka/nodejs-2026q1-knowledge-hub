import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/comment.dto';
import { GetCommentFilterDto } from './dto/get-comment-filter';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create comment' })
  @ApiBody({ type: CommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Required fields should not be empty',
  })
  @ApiResponse({
    status: 422,
    description: 'Cannot create comment: Article with articleId does not exist',
  })
  create(@Body() commentDto: CommentDto) {
    return this.commentService.create(commentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get comments by articleId' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  @ApiQuery({
    name: 'articleId',
    type: 'string',
    required: true,
    description: 'Article ID to filter comments',
  })
  findAll(@Query() filterDto: GetCommentFilterDto) {
    return this.commentService.findByArticleId(filterDto.articleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Comment ID',
  })
  @ApiResponse({ status: 404, description: 'Comment with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @ApiResponse({ status: 404, description: 'Comment with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentService.remove(id);
  }
}
