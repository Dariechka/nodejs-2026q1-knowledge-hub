import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum Task {
  REVIEW = 'review',
  BUGS = 'bugs',
  OPTIMIZE = 'optimize',
  EXPLAIN = 'explain',
}

export class AnalyzeArticleDto {
  @ApiPropertyOptional({
    description: 'Type of task',
    example: Task.OPTIMIZE,
  })
  @IsEnum(Task)
  @IsOptional()
  task?: Task = Task.REVIEW;
}
