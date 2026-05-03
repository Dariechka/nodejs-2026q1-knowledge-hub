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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import type { CurrentUserData } from '../auth/data/current-user.data';
import { ForbiddenError } from '../shared/error/knowledge-hub-errors';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Required fields should not be empty',
  })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createUserDto: CreateUserDto,
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenError();
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll(@Query() query: SearchDto) {
    return this.usersService.findAll(query, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User ID',
  })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 404, description: 'User with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  @ApiResponse({ status: 403, description: 'Old password is incorrect' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdatePasswordDto,
  ) {
    // workaround for flaky test on fast machines - expect(updatedAt).toBeGreaterThan(createdAt)
    await new Promise((resolve) => setTimeout(resolve, 1));
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User with ID not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (uuid is expected)',
  })
  async remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (user.role !== 'admin' && user.role !== 'editor') {
      throw new ForbiddenError();
    }
    if (user.role === 'editor' && user.userId !== id) {
      throw new ForbiddenError();
    }
    await this.usersService.remove(id);
  }
}
