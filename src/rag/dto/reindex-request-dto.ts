import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

interface ReindexRequest {
  onlyPublished?: boolean; // default true
  articleIds?: string[]; // optional selective reindex
}

export class ReindexRequestDto implements ReindexRequest {
  @ApiPropertyOptional({
    description: 'If true, only published articles will be synced to Qdrant.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyPublished?: boolean = true;

  @ApiPropertyOptional({
    description:
      'List of specific article IDs to reindex. If empty, all articles are processed.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4')
  articleIds?: string[];
}
