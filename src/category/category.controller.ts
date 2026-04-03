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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({ type: CategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Required fields should not be empty',
  })
  create(@Body() categoryDto: CategoryDto) {
    return this.categoryService.create(categoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all category' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Category ID',
  })
  @ApiResponse({ status: 404, description: 'Category with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Category ID',
  })
  @ApiBody({ type: CategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() categoryDto: CategoryDto,
  ) {
    return this.categoryService.update(id, categoryDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
